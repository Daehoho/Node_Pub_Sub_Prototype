// ==================================== Global Variables Area ===========================================//
var users = [];
var current_channel = 'chat';

// create Date for Log
function getToday() {
    var date = new Date();
    return date.getFullYear() + '.' + (date.getMonth() + 1) 
            + '.' + date.getDate() + ' ' + date.getHours() 
            + ':' + date.getMinutes() + ':' + date.getSeconds();
};

module.exports = function(io, publisher, subscriber) {
    io.sockets.on('connection', function(socket) {

        socket.on('chat_join', function (data) {
            var member = data.member;
            var channel = data.channel;


            console.log(subscriber);

            // current_channel = channel;

            socket.channel = channel;
            socket.member = member;

            var result = users[member.member_no];

            console.log("ch" + channel);
            console.log("cu_ch" + current_channel);

            if(result != undefined) {  // alreay user info exist
                // socket.emit('chat_fail', JSON.stringify());
            } else {
                users[member.member_no] = member;
                console.log(users);
                console.log(Object.keys(users));

                socket.broadcast.emit('chat_connect', JSON.stringify(users));
                socket.emit('chat_connect', JSON.stringify(users));

                socket.emit("connected_member", JSON.stringify(users));
                socket.broadcast.emit("connected_member", JSON.stringify(users));
            } 
        });

        socket.on('send_message', function(data) {
            var msg = data;
            var channel = '';
            console.log("ch" + channel);
            console.log("cu_ch" + current_channel);

            if(msg['channel'] != undefined) {
                channel = msg['channel'];
            }

            if(channel == current_channel) {
                var chatting_message = msg.member_name + ' : ' + msg.message;
                console.log('test publish');
                publisher.publish(current_channel, chatting_message);
            }
        });

        socket.on('disconnect', function (data) {
            var member_name = socket.member_name;
            var channel = socket.channel;
            
            if (member_name != undefined &&  channel != undefined) {
                console.log('member_name ' + member_name + ' has been disconnected');

                data = { msg: "[" + getToday() + "]" + member_name + ' 님이 나가셨습니다.' };

                socket.emit('member_disconnected', data);
                socket.broadcast.emit('member_disconnected', data);
            }
        });

        // event for member conn
        socket.on('chat_conn', function (data) {

        });

        socket.on('send_msg', function(data) {

        });

        socket.on('disconnect', function(data) {

        });

        subscriber.on('message', function(current_channel, message) {
            socket.emit('receive_message', message);
        });

        subscriber.subscribe(current_channel);
    });

    io.sockets.on('close', function (socket) {
        subscriber.unsubscribe();
        publisher.close();
        subscriber.close();
    });
};

//   io.sockets.on('connection', function (socket) {
//           // 사용자가 채팅창에 최초 접속시 발생하는 소켓 이벤트
//           socket.on('chat_user', function (raw_msg) {
//                // MongoDB에 있는 접속로그를 불러온다.
//           });
//           // 사용자가 접속했을 때 발생하는 소켓 이벤트
//           socket.on('chat_conn', function (raw_msg) {
//                // 사용자접속 처리. 아이디 중복체크, 접속로그 등록(MongoDB)
//                // 현재접속자에 대한 새로고침
//           });
//           // 사용자가 메시지를 보냈을 때 발생하는 소켓 이벤트
//           socket.on('message', function (raw_msg) {
//                // 발행자로부터 구독자에 메시지 전달 (redis)
//           });
//           // 사용자가 채팅방에서 나갔을 때 발생하는 소켓 이벤트
//           socket.on('leave', function (raw_msg) {
//                // 나가기, 새로고침에 대한 처리 / 접속로그 등록(MongoDB)
//                // 현재접속자에 대한 새로고침
//           });
//           // 구독자 객체가 메시지를 받으면 소켓을 통해 메시지를 전달하는 함수
//           subscriber.on('message', function (channel, message) {
//                // 사용자에게 메시지 전달. 클라이언트에게 보낸다.
//           });
//           // 구독자 객체는 'chat' 채널에 대한 구독을 시작
//           subscriber.subscribe('chat');
//      }); 
