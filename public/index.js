'use strict';

var addFieldsToData = ['nameRequester','emailRequester','courseID', 'nameProfessor', 'emailProfessor'];
//list the group name to select with jquery to get checkbox form values
var addCheckBoxToData = ['type'];


var socket = io.connect('http://localhost:8001');

socket.on('connected', function (data) {
    console.log(data);
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

    //loading screen test

    waitingDialog.show('Test task input loading screen');
    setTimeout(function () {
        waitingDialog.hide();
    }, 2500);

    // end loading screen test

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

    data = filterFields(fields, data);
    data = filterCheckboxes(data);

    console.log(data);

    //send our form data to the server
    socket.emit('form-submission', data);
}



function filterFields(fields, data){
    var filteredFormFields = _.filter(fields, function(x){
       return _.includes(addFieldsToData, x.id);
    });

    _.forEach(filteredFormFields, function(x){
        if(x.value){
            data[x.id] = x.value;
        }
    })

    return data;
}



function filterCheckboxes(data){
    _.forEach(addCheckBoxToData, function(x){
        var el = $( 'input[name="type"]:checked' );
        
        if(el){
            data[x] = el[0].value;
        }
    })

    return data;
}



var deletedFormValues = {};
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

       clearFormFields(['nameProfessor', 'emailProfessor']);
    }
    else{
       el = $('#professor-detail-input_hidden');

       el.attr('id','professor-detail-input_not-hidden');
       el.find('input').attr("required", true);

       if(deletedFormValues){
           restoreDeletedValues(['nameProfessor', 'emailProfessor'], deletedFormValues);
       } 
    }
}


/**
 * 
 */
function clearFormFields(fields){

    _.forEach(fields, function(x){
        var el = $('#' + x);

        if(el){
            deletedFormValues[x] = el[0].value;
            el[0].value = "";
        }
    })
}


/**
 * 
 */
function restoreDeletedValues(fields, values){
     _.forEach(fields, function(x){
        var el = $('#' + x);

        if(el && values[x]){
            el[0].value = values[x];
        }
    })
}