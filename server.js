'use strict';

let express = require('express');
let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let tlsAsana = require('tls-asana');
let asanaConnection = null;

server.listen(8001);


app.use(express.static('public'));
app.use(express.static('node_modules'));

io.on('connection', function (socket) {
  console.log("Successfully connected");
  socket.emit('connected', "Successfully connected");
  
  socket.on('send back', function (data) {
      console.log(data);
  });

  //------------
  if(tlsAsana){
      tlsAsana.connect(166216691534199).then(client => {
          //asanaConnection = client;
          console.log('Asana Connected and setup');
          tlsAsana.checkTagCache().then(res=>{
            console.log(res);
          })
      });
  }
});