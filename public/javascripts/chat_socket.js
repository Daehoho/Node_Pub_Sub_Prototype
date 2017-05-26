
var chat_id = "";
var cnt = 0;
var socket = null;
var channel = '<%=group_name%>';
var member = {
    member_no : '<%=member_no%>',
    member_name : '<%=member_name%>'
};

$(document).ready(function() {
    var socket = io.connect('http://localhost:3002');
    var member_list = [];

    //Enroll Chatting info
    socket.emit('chat_join', { member: member, channel : channel});

    //Succes Chatting Joint
    socket.on('chat_connect', function(data) {
        data = JSON.parse(data);
        cnt = data.length;
        $('#chat_member_list').empty();
        for (var i = 0; i < cnt; i++) {
            var member_name = data[i].member_name;
        }
    });

    socket.on('connected_member', function(data) {
        data = JSON.parse(data);
        cnt = data.length;
        $("#now_member_cnt").html(cnt);
    });

    socket.on('chat_log_info', function(data) {
        data = JSON.parse(data);
        $("#chat_logs").empty();
        for(var i = 0; i < data.length; i++) {
            $("#chat_logs").append('<li>'+data[i].log 
            + '(' + data[i].date + ')' +'</li>')
        }
        $('.chat_history_list').scrollTop($("#chat_logs").heights());
    });


    socket.on('chat_fail', function(data) {
        date = JSON.parse(data);
        alert(data + 'already joined member');
    });

    socket.on('memeber_disconnectd', function(data) {
    });

    // msg input and enter key
    $('#chat_input').keyup(function (event) {
        if (event.which == 13) {
            chat_input($('#chat_input').val());
            $('#chat_input').val(''); // clear input msg in chat_input area
        }
    });
    chat_user();
});
function chat_input(data) {
    var encodedMsg = encodeURIComponent(data);
    socket.emit('send_message', { channel: channel, member: member, message: encodedMsg });
};

function chat_in() {

}

function chat_member() {

}

function connection() {

}
function chat_user() {
    // socket.emit('chat_user', '{"channel": "workspace"}');
}
