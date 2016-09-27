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
    taskInputSuccess(data);
    //do anything we need to do after a successful task input (notify user, give them next steps)
});

socket.on('task-input-failure', function(err, taskName, data){
    console.log(err);
    console.log(data);
    console.log(taskName);
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

    data = filterFields(fields, data);
    data = filterCheckboxes(data);

    //send our form data to the server
    socket.emit('form-submission', data);
    taskInputPending();
}


/**
 * 
 */
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


/**
 * 
 */
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


/**
 * 
 */
function taskInputPending(){
    $('.task-input-modal, .task-input-modal-backdrop').css('display','block');
}


/**
 * 
 */
function taskInputSuccess(taskData){
    var taskData = processAsanaData(taskData);
    var modalContainer = $('.task-input-modal');
    var taskInfoEl = modalContainer.find('#tim-task-info');

    modalContainer.find('#tim-progress').css('display','none');
    modalContainer.find('#tim-header').html('Task Successfully Created');//.css('color','#449d44');
    $(taskInfoEl).css('display', 'block');
    modalContainer.find('button').each(function(i){ $(this).css('display','block'); });

    _.forEach(taskData, function(val,key){
        $(taskInfoEl).append(key + ': ' + val + '<br>');
    })
}

/**
 * 
 */
function taskInputSuccessRevert(){
    var modalContainer = $('.task-input-modal');

    modalContainer.find('#tim-progress').css('display','block');
    modalContainer.find('#tim-header').html('Task Input Pending');//.css('color','#449d44');
    modalContainer.find('#tim-task-info').html("").css('display','none');
    modalContainer.find('button').each(function(i){ $(this).css('display','none'); });
}

/**
 * 
 */
function processAsanaData(taskData){
    var parsedExternalData = JSON.parse(taskData.external.data);
    
    var returnData = {
        'Task Name         ': taskData.name,
        'Requested by      ': parsedExternalData.nameRequester,
        'RIT Email         ': parsedExternalData.emailRequester,
        'Course ID         ': parsedExternalData.courseID,
        'Request Type      ': parsedExternalData.type,
        'Date/Time Created ': parsedExternalData.titleDate,
    }

    //check for, and add, optional return data
    if(parsedExternalData.nameProfessor){
        returnData["Professor Name    "] = parsedExternalData.nameProfessor;
    }
    if(parsedExternalData.emailProfessor){
        returnData["Professor Email   "] = parsedExternalData.emailProfessor;
    }

    return returnData;
}

/**
 * 
 */
function taskInputComplete(clear){
    $('.task-input-modal, .task-input-modal-backdrop').css('display','none');
    taskInputSuccessRevert();

    if(clear){
        $('#tlsTaskForm').find("input[type=text], input[type=email]").each(function(){
            $(this).val("").css('background-color', '#fff !important');
        });

        $('#requestMadeByProf-1').prop('checked',false).button('refresh');
        $('#requestMadeByProf-0').prop('checked',true).button('refresh');
        handleRadioRequestMadeByProf("true");
    }
}