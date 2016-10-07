'use strict';

var socket = io.connect('http://localhost:8001');



socket.on('connected', function (data) {
    console.log(data);
});

socket.on('login-failure', function(err){
    alert(err);
    $('#password').focus();
});



$(document).ready(function(){
    $('#tlsTaskAuth').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
            console.log('Form error');
        } 
    });
});



function handleLoginAttempt(pw){
    socket.emit('login', pw);
}