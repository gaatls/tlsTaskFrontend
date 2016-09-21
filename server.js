'use strict';

let express = require('express');
let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let _ = require('lodash');
let tlsAsana = require('tls-asana');
let tlsAsanaPromise = null;

server.listen(8001);


app.use(express.static('public'));
app.use(express.static('node_modules'));

io.on('connection', function (socket) {
    console.log("Successful socket connection");
  
    if(tlsAsana){
        tlsAsanaPromise = tlsAsana.connect('166216691534199').then(client => {
            console.log('Asana connected and setup');
        });
    }
  
    socket.emit('connected', "Successfully connected");

    socket.on('form-submission', data => {
        socketFormSubmission(data);  
    });
});



/**
 * Handles a submission to create a new task from the tls task input frontend form
 * 
 * param {object} data - Task data from the submitted form
 */
function socketFormSubmission(data){
    let taskName = generateTaskName(data);

    tlsAsanaPromise.then(function(){
        tlsAsana.createTask(taskName, data).then(response => {
            console.log(response);
            console.log('task inputted Successfully');

            socket.emit('task-input-success', response);
        });
    });
}



/**
 * Creates a task name when a task is to be created; title is made up of
 * various pieces of data from the use form submission, that can be editted by
 * changing the 'titleFields' var
 * 
 * param {Object} data - Task data from the submitted form
 */
function generateTaskName(data){
    let taskNameStr = "";

    //edit if we want to change the structure of the titles in asana
    let titleFields = ['type', 'date', 'courseID', 'nameRequester'];

    _.forEach(titleFields, function(x){
        if( data[x] ){
            //if else just adds space between fields in name after the first one
            if(taskNameStr === ""){
                taskNameStr = taskNameStr + data[x];
            }
            else{
                taskNameStr = taskNameStr + " - " + data[x];
            }
        }
    })

    return taskNameStr;
}
