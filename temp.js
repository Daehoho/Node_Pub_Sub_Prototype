// ======================== global variables area =================== //
var socket_ids = [];
var count = 0;
var rooms = [];


module.exports = function (io) {
     function registerUser(socket, member_name) {
         var pre_nick = socket.member_name;
         if (pre_nick != undefined) delete socket_ids[pre_nick];
         socket_ids[member_name] = socket.id;
         socket.member_name = member_name;
     io.sockets.emit('userlist', {users: Object.keys(socket_ids)});
     };

    io.on('connection', function (socket) {
        //  registerUser(socket, 'GUEST-'+count);
        //  count++;

        socket.emit('init');

        socket.on('changename', function (data) {
            registerUser(socket, data.member_name);
        });
        socket.on('joinroom', function (data) {
            socket.join(data.room);
            socket.room = data.room;

            var room = data.room;
            var member_name =  data.member_name;

            socket.member_name = member_name;


            socket.emit('changename', { member_name: member_name });

            // Create Room
            if (rooms[room] == undefined) {
                console.log('room create : ' + room);
                rooms[room] = new Object();
                rooms[room].socket_ids = new Object();
            }

            rooms[room].socket_ids[member_name] = socket.id;

            console.log("room state:");
            console.log(rooms);

            data = { msg: member_name + ' 님이 입장하셨습니다' };
            io.sockets.in(room).emit('broadcast_msg', data);

            //for whisper
            io.sockets.in(room).emit('userlist', {
                users: Object.keys(rooms[room].socket_ids)
            });

            //for connected userlist
            io.sockets.in(room).emit('newuser', {
                new_user:  member_name
            });

            count++;
        });


        socket.on('changename', function (data) {
            var room = socket.room;
            var pre_nick = socket.member_name;
            var member_name = data.member_name;

            if (pre_nick != undefined) {
                delete rooms[room].socket_ids[pre_nick];
            }
            rooms[room].socket_ids[member_name] = socket.id;
            socket.member_name = member_name;
            data = { msg: pre_nick + ' 님이' + member_name + '으로 대화명을 변경하였습니다.' }
            io.sockets.in(room).emit('broadcast_msg', data);
            io.sockets.in(room).emit('userlist', { users: Object.keys(rooms[room].socket_ids) });
        });

        socket.on('disconnect', function (data) {
            var room = socket.room;

            if (room != undefined && rooms[room] != undefined) {
                var member_name = socket.member_name;
                console.log('member_name ' + member_name + ' has been disconnected');

                if (member_name != undefined) {
                    if (rooms[room].socket_ids != undefined
                        && rooms[room].socket_ids[member_name] != undefined)
                        delete rooms[room].socket_ids[member_name];
                }

                data = { msg: member_name + ' 님이 나가셨습니다.' };

                io.sockets.in(room).emit('broadcast_msg', data);
                io.sockets.in(room).emit('userlist', { users: Object.keys(rooms[room].socket_ids) });
                io.sockets.in(room).emit('newuser', { new_user: member_name });
            }
        });

        socket.on('send_msg', function (data) {
            var room = socket.room;
            var member_name = socket.member_name;
            console.log('in send msg room is ' + room);
            console.log(member_name + ' | ' + data.msg + ' | ' + data.date);
            data.msg = member_name + ' : ' + data.msg;
            if (data.to == 'ALL') {
                socket.broadcast.to(room).emit('broadcast_msg', data);
            } else {
                socket_id = rooms[room].socket_ids[data.to];
                if (socket_id != undefined) {
                    data.msg = '귓속말 : ' + data.msg;
                    io.sockets.socket(socket_id).emit('broadcast_msg', data);
                }
            }
            socket.emit('broadcast_msg', data);
        });
    });
};

