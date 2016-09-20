'use strict';

let express = require('express');
let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let tlsAsana = require('tls-asana');
let tlsAsanaPromise = null;

server.listen(8001);


app.use(express.static('public'));
app.use(express.static('node_modules'));

io.on('connection', function (socket) {
    console.log("Successfully connected");
  
    if(tlsAsana){
        tlsAsanaPromise = tlsAsana.connect(166216691534199).then(client => {
            console.log('Asana Connected and setup');
            //   tlsAsana.checkTagCache().then(res=>{
            //     console.log(res);
            //   })
        });
    }
  
  
    socket.emit('connected', "Successfully connected");
    
    socket.on('send back', function (data) {
        console.log(data);
    });

    socket.on('form-submission', function(data) {
        console.log(data);
        
        //tlsAsanaPromise.then(function(){
            tlsAsana.createTask('tester9', data).then(response => {
                console.log(res);
                console.log('task inputted Successfully');
            });
        //})
    });

  //------------
});
