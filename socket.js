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
    var chat = io.of('/chat').on('connection', function (socket) {
        socket.on('chat_join', function (data) {
            var member = data.member;
            var channel = data.channel;

            socket.channel = channel;
            socket.member = member;

            console.log('join');
            if(channels[channel] == undefined) {
                console.log('channel create : ' + channel);
                channels[channel] = new Object();
                channels[channel].users = new Object();
            }

            var result = channels[channel].users[member.member_no];

            if (result != undefined) {  // alreay user info exist
                chat.emit('chat_fail', JSON.stringify(member.member_no));
            } else {
                console.log('channel create: ' + channel);
                channels[channel].users[member.member_no] = socket.id;

                console.log(channels);

                sub.subscribe("c:"+channel);
                socket.join(channel);

                chat.to(channel).emit('chat_connect', JSON.stringify(channels[channel].users));
                // chat_socket.broadcast.emit('chat_connect', JSON.stringify(users));
                // chat_socket.emit('chat_connect', JSON.stringify(users));

                chat.to(channel).emit("connected_member", JSON.stringify(channels[channel].users));
                // chat_socket.emit("connected_member", JSON.stringify(users));
                // chat_socket.broadcast.emit("connected_member", JSON.stringify(users));
            }
        });

        socket.on('send_message', function (data) {
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
                pub.publish("g:"+channel, "notify! group : " + channel);
            }
        });

        socket.on('disconnect', function (data) {
            var member_name = socket.member.member_name;
            var channel = socket.channel;
            console.log("socket.channel" + socket.channel);

            if (member_name != undefined && channel != undefined) {
                console.log('member_name ' + member_name + ' has been disconnected');

                data = { msg: "[" + getToday() + "]" + member_name + ' 님이 나가셨습니다.' };

                chat.emit('member_disconnected', data);
                chat.to(channel).emit('member_disconnected', data);

                sub.unsubscribe("c:"+channel);
            }
            console.log("channel = c:" + channel + ", member = " + member_name + " disconnect")
        });

        // event for member conn
        socket.on('chat_conn', function (data) {

        });

        socket.on('send_msg', function (data) {

        });

    });

    var group = io.of('/group').on('connection', function (socket) {
        console.log("test connection group");
        socket.on('group_info', function (data) {
            var len = Object.keys(data.group_info).length;
            console.log("test connection group =====");

            for (var i = 0; i < len; i++) {
                var group = data.group_info[i];
                console.log("test: ");
                console.log(group);
                sub.subscribe("g:" + group.GROUP_NO);
            }
        });
    });

    sub.on('message', function (channel, message) {
        console.log("========================");
        console.log(channel + ":" + message);
        var prefix = channel.split(":")[0];
        channel = channel.split(":")[1];
        if (prefix == "g") {
            console.log("group : " + channel + message);
            console.log(chat);
            // chat.socket.broadcast.emit('notify', message);
            chat.emit('notify', message);
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