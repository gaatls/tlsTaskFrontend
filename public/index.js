'use strict';
//let bootstrap = require('bootstrap');
//console.log(bootstrap);
var socket = io.connect('http://localhost:8001');

socket.on('connected', function (data) {
    console.log(data);
    socket.emit('send back', "alright");
});

$( document ).ready(function docReady(){

    $('#tlsTaskForm').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
            // handle the invalid form...
            console.log('Form error');
        } else {
            e.preventDefault();
            handFormSubmission(e.target);
        }
    });
    
});


/**
 * Handles the data submitted by a user through the tls form
 * 
 * @param {Array} form All form fields of submitted form
 */
function handFormSubmission(fields){
    var data = {};

    data.nameRequester = _.find(fields, function(x){return x.id === 'nameRequester';}).value;
    data.emailRequester = _.find(fields, function(x){return x.id === 'emailRequester';}).value;
    data.courseID = _.find(fields, function(x){return x.id === 'courseID';}).value;

    //send our form data to the server
    socket.emit('form-submission', data);
}



/**
 * Shows field when radio button is toggled...may be better/more efficient way to
 * do with bootstrap but I couldn't find it so I'm moving on.
 * 
 * @param {string} val String value stored on the toggled radio button
 */
function handleRadioRequestMadeByProf(val){
    var el;
    
    if(val === "true"){
       el = $('#professor-detail-input_not-hidden')
       
       el.attr('id','professor-detail-input_hidden');
       el.find('input').attr("required", false);
    }
    else{
       el = $('#professor-detail-input_hidden');

       el.attr('id','professor-detail-input_not-hidden');
       el.find('input').attr("required", true);
    }
}


