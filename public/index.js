'use strict';

var addToTaskData = ['nameRequester','emailRequester','courseID'];


var socket = io.connect('http://localhost:8001');

socket.on('connected', function (data) {
    console.log(data);
    socket.emit('send back', "alright");
});

socket.on('task-input-success', function(data){
    console.log(data);
    //do anything we need to do after a successful task input (notify user, give them next steps)
});

socket.on('task-input-failure', function(data){
    console.log(data);
    //do anything we need to do after a failed task input (notify user, give them next steps to retry entry or give error status telling them what went wrong????)
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

    var filteredFormFields = _.filter(fields, function(x){
       return _.includes(addToTaskData, x.id);
    });

    _.each(filteredFormFields, function(x){
        data[x.id] = x.value;
    })

    console.log(data);

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


