// ==================================== Global Variables Area ===========================================//
var channels = []; // pub/sub channel list for group
var users = []; // user list for check already join
var current_channel;

// create Date for Log
function getToday() {
    var date = new Date();
    return date.getFullYear() + '.' + (date.getMonth() + 1)
        + '.' + date.getDate() + ' ' + date.getHours()
        + ':' + date.getMinutes() + ':' + date.getSeconds();
};


module.exports = function (io, pub, sub) {
    var chat = io.of('/chat').on('connection', function (c_socket) {
        c_socket.on('chat_join', function (data) {
            var member = data.member;
            var channel = data.channel;

            c_socket.channel = channel;
            c_socket.member = member;

            if(channels[channel] == undefined) {
                console.log('channel create : ' + channel);
                channels[channel] = new Object();
                channels[channel].users = new Object();
            }

            var result = channels[channel].users[member.member_no];

            if (result != undefined) {  // alreay user info exist
                chat.to(channel).emit('chat_fail', JSON.stringify(member.member_name));
            } else {
                console.log('channel create: ' + channel);
                channels[channel].users[member.member_no] = c_socket.id;

                console.log(channels);

                sub.subscribe("c:"+channel);
                c_socket.join(channel);

                data = { msg: "[" + getToday() + "]" + member.member_name + ' 님이 접속하셨습니다.',
                          users: channels[channel].users };

                chat.to(channel).emit('chat_connect', data);
                chat.to(channel).emit("connected_member", data);
            }
        });

        c_socket.on('send_message', function (data) {
            var msg = data;
            var channel;
            console.log(msg);

            if (msg['channel'] != undefined) {
                channel = msg['channel'];
                console.log(channel);
            }
            if (channel != undefined) {
                var chatting_message = msg.member.member_name + ' : ' + msg.message;
                pub.publish("c:"+channel, chatting_message);
            }
        });

        c_socket.on('disconnect', function (data) {
            var channel = c_socket.channel;
            console.log("socket.channel" + c_socket.channel);
            if (channel != undefined && channels[channel] != undefined) {
                var member = c_socket.member;

                if (member != undefined) {
                    console.log('member_name ' + member.member_name + ' has been disconnected');
                    if (channels[channel].users != undefined
                        && channels[channel].users[member.member_no] != undefined) 
                        delete channels[channel].users[member.member_no];
                }

                data = { msg: "[" + getToday() + "]" + member.member_name + ' 님이 나가셨습니다.',
                          users: channels[channel].users };
                console.log(data);

                chat.to(channel).emit('member_disconnected', data);

                sub.unsubscribe("c:" + channel);
                console.log("channel = c:" + channel + ", member = " + member.member_name + " disconnect")
            }
        });

        // event for member conn
        c_socket.on('chat_conn', function (data) {

        });

        c_socket.on('send_msg', function (data) {

        });

    });

    var group = io.of('/group').on('connection', function (g_socket) {
        console.log("test connection group");
        g_socket.on('group_info', function (data) {
            var len = Object.keys(data.group_info).length;
            console.log("test connection group =====");

            for (var i = 0; i < len; i++) {
                var group = data.group_info[i];
                console.log("test: ");
                console.log(group);
                g_socket.join(group.GROUP_NO);
                sub.subscribe("g:" + group.GROUP_NO);
            }
        });

        g_socket.on('send_notify', function (data) {
            var data = data;
            console.log("*************notify**********")
            console.log(data);
            pub.publish("g:" + data.channel, "notify! to All " + data.channel + "from " + data.member.member_name);
        });
    });

    sub.on('message', function (channel, message) {
        console.log("========================");
        console.log(channel + ":" + message);
        var prefix = channel.split(":")[0];
        channel = channel.split(":")[1];
        if (prefix == "g") {
            console.log("sub.on group : " + message);
            group.to(channel).emit('notify', message);
        } 
        if (prefix == 'c') {
            console.log("chatting room : " + channel + message);
            chat.to(channel).emit('receive_message', message);
        }

    });

    io.of('/chat').on('close', function (chat_socket) {
        sub.unsubscribe();
        pub.close();
        sub.close();
    });

};