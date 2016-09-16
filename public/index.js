'use strict';
//let bootstrap = require('bootstrap');
//console.log(bootstrap);
var socket = io.connect('http://localhost:8001');

socket.on('connected', function (data) {
    console.log(data);
    socket.emit('send back', "alright");
});
