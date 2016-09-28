'use strict';

var addFieldsToData = ['nameRequester','emailRequester','courseID', 'nameProfessor', 'emailProfessor'];
//list the group name to select with jquery to get checkbox form values

var addRadioToData = [];
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

    //-------SO snippet [http://stackoverflow.com/questions/9709209/html-select-only-one-checkbox-in-a-group]--------------
    //we want the type to not have a default value but behave like a radio, not a checkbox (at most one should be selected at a time)

    // the selector will match all input controls of type :checkbox
        // and attach a click event handler 
        $("input:checkbox.type").on('click', function() {
            // in the handler, 'this' refers to the box clicked on
            var $box = $(this);
            if ($box.is(":checked")) {
                // the name of the box is retrieved using the .attr() method
                // as it is assumed and expected to be immutable
                var group = "input:checkbox[name='" + $box.attr("name") + "']";
                
                //remove the additional form group that was visible from another 
                //active checkbox in the group - hayden added
                $(group).each(function(x){
                    if( $(this).prop('checked') == true ){
                        handleTypeCheckboxDeselection( $(this).prop('id') + "-form-group" );
                    }
                })
                
                // the checked state of the group/box on the other hand will change
                // and the current value is retrieved using .prop() method
                $(group).prop("checked", false);
                $box.prop("checked", true);
                
                $('#tls-type-custom-validate').prop('value','validated');
                $('#tlsTaskForm').validator('validate');

                //handle the rest of the form options that will appear after a type selection
                handleTypeCheckboxSelection($box.prop('id'));

            } else {
                $box.prop("checked", false);
                $('#tls-type-custom-validate').prop('value','');
                $('#tlsTaskForm').validator('validate');

                handleTypeCheckboxDeselection($box.prop('id') + "-form-group");
            }
        });
    //-----end SO snippet
    
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
    data = filterRadios(data);

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
        var el = $( 'input[name=' + x + ']:checked' );
        
        if(el){
            data[x] = el[0].value;
        }
    })

    return data;
}


/**
 * 
 */
function filterRadios(data){
    _.forEach(addRadioToData, function(x){
        var el = $( 'input[name=' + x + ']:checked' );
        
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
function handleTypeCheckboxSelection(typeName){
    console.log(typeName);

    if(tlsTypeFormFields[typeName]){
        var formData = tlsTypeFormFields[typeName];
        var appendAfterElement = formData.appendAfter;
        
        addFieldNamesToCollectedData(formData);
        $(appendAfterElement).after( formData.formHTMLString );
    } else {
        throw new TypeError('More details for that request type do not exist');
    }
}



/**
 * probably will not need this to be a separate function...if it just needs to be one line of jquery
 * than we can move it back up to where it is called--we will wait to see if we need to do more things
 * when the form group is removed.
 */
function handleTypeCheckboxDeselection(formGroupID){
    $( '#' + formGroupID ).remove();
}


function addFieldNamesToCollectedData(formData){
    if(formData.addFieldsToData) pushFieldNames(addFieldsToData, formData.addFieldsToData);
    if(formData.addCheckBoxToData) pushFieldNames(addCheckBoxToData, formData.addCheckBoxToData);
    if(formData.addRadioToData) pushFieldNames(addRadioToData, formData.addRadioToData);
    
    function pushFieldNames(arrayToPushTo, fieldNameArr){
        _.forEach(fieldNameArr, function(fieldName){
            arrayToPushTo.push( fieldName );
        });
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

    //check for, and add, optional return data --- may not be the best way but this is the quickest way right now 
    //i think in future I can have an optionalData object with the name that would get attached to 'parsedExternalData'
    //and the name I want to include in the user message (ex: Professor Name)..and I could loop/logic check to see if 
    //it was part of the task data and needs to be shown to the user.
    if(parsedExternalData.nameProfessor) returnData["Professor Name    "] = parsedExternalData.nameProfessor;
    if(parsedExternalData.emailProfessor) returnData["Professor Email   "] = parsedExternalData.emailProfessor;

    if(parsedExternalData.captioningRequested) returnData["Captioning Req    "] = parsedExternalData.captioningRequested.toUpperCase();
    if(parsedExternalData.onlineCourse) returnData["Online Course     "] = parsedExternalData.onlineCourse.toUpperCase();
    if(parsedExternalData.videoType) returnData["Video Type        "] = parsedExternalData.videoType;

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


var tlsTypeFormFields = {
    typeStreamingCaptioning: {
        appendAfter: '#tls-type-form-group',
        addFieldsToData: ['videoType'],
        addRadioToData: ['captioningRequested','onlineCourse'],
        formHTMLString: "\
        <div class='tls-hidden-group-large' id=''>\
            <!--Captioning Requested Radio Selection -->\
            <div class='form-group tls-indented' id='typeStreamingCaptioning-form-group'>\
                <label class='col-md-4 control-label' for='captioningRequested'>Captioning Service Requested?</label>\
                <div class='col-md-4'>\
                    <div class='radio'>\
                        <label for='captioningRequested'>\
                            <input type='radio' name='captioningRequested' value='true' checked='checked'>Yes\
                        </label>\
                    </div>\
                    \
                    <div class='radio'>\
                        <label for='captioningRequested'>\
                            <input type='radio' name='captioningRequested' value='false'>No\
                        </label>\
                    </div>\
                    \
                </div>\
            </div>\
            <!--Online Course Radio Selection -->\
            <div class='form-group tls-indented' id='typeStreamingCaptioning-form-group'>\
                <label class='col-md-4 control-label' for='onlineCourse'>Request for Online Course?</label>\
                <div class='col-md-4'>\
                    <div class='radio'>\
                        <label for='onlineCourse'>\
                            <input type='radio' name='onlineCourse' value='true'>Yes\
                        </label>\
                    </div>\
                    \
                    <div class='radio'>\
                        <label for='onlineCourse'>\
                            <input type='radio' name='onlineCourse' value='false' checked='checked'>No\
                        </label>\
                    </div>\
                    \
                </div>\
            </div>\
            <!--Video Type input -->\
            <div class='form-group tls-indented' id='typeStreamingCaptioning-form-group'>\
                <label class='col-md-4 control-label' for='videoType'>Video type</label>\
                <div class='col-md-4'>\
                    <input id='videoType' name='videoType' type='text' placeholder='ex. John Smith' class='form-control input-md' required>\
                    <div class='help-block'>Type of video</div>\
                </div>\
            </div>\
        </div>\
        "
    },
    typeDVD: {

    }, 
    typeRecording: {

    }
}
// var addFieldsToData = ['nameRequester','emailRequester','courseID', 'nameProfessor', 'emailProfessor'];
// //list the group name to select with jquery to get checkbox form values
// var addRadioToData = [];
// var addCheckBoxToData = ['type'];

//Text
//<input id="nameProfessor" name="nameProfessor" type="text" placeholder="ex. Sam Jackson" class="form-control input-md">

//Checkbox
//type="checkbox" class="type" name="type[1][]" id="typeDVD" value="DVD"

//radio
//<input type="radio" name="requestMadeByProf" id="requestMadeByProf-1" value="false" onclick="handleRadioRequestMadeByProf(this.value);">No