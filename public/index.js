'use strict';
//let bootstrap = require('bootstrap');
//console.log(bootstrap);
var socket = io.connect('http://localhost:8001');

socket.on('connected', function (data) {
    console.log(data);
    socket.emit('send back', "alright");
});

function handleRadioRequestMadeByProf(val){
    var el;
    
    if(val === "true"){
       el = $('#professor-detail-input_not-hidden')
       
       el.attr('id','professor-detail-input_hidden');
       //el.attr("required", false);
       el.find('input').attr("required", false);
    }
    else{
       el = $('#professor-detail-input_hidden');

       el.attr('id','professor-detail-input_not-hidden');
       //el.attr("required", true);
       el.find('input').attr("required", true);
    }
}