'use strict';

var addFieldsToData = [
    {
        id: 'nameRequester',
        readName: null
    },
    {
        id: 'emailRequester',
        readName: null
    },
    {
        id: 'courseID',
        readName: null
    }
];
var addRadioToData = [];
var addCheckBoxToData = [
    {
        id:'type',
        readName: null
    }
];


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

    $('.tls-datepicker-input').datepicker({
        autoclose: true,
        todayHighlight: true,
        toggleActive: true
    });

    
    $('#tlsTaskForm').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
            // handle the invalid form...
            console.log('Form error');
        } else {
            e.preventDefault();
            handFormSubmission(e.target);
        }
    });


    $(document).on('click', '.btn-add', function(e){
        e.preventDefault();

        var controlForm = $(this).parents('.form-group'),
            lastEntry = controlForm.find('.entry:last'),
            newEntry = $(lastEntry.clone()).insertAfter(lastEntry);
                
            newEntry.find('input').val('');
            newEntry.append('<span class="input-group-btn tls-muliple-minus-btn">\
                                <button class="btn btn-danger btn-remove" type="button">\
                                    <span class="glyphicon glyphicon-minus"></span>\
                                </button>\
                            </span>\
                        ');

            console.log(lastEntry);
        //     

        // newEntry.find('input').val('');
        // controlForm.find('.entry:not(:last) .btn-add')
        //     .removeClass('btn-add').addClass('btn-remove')
        //     .removeClass('btn-success').addClass('btn-danger')
        //     .html('<span class="glyphicon glyphicon-minus"></span>');
    }).on('click', '.btn-remove', function(e){
		$(this).parents('.entry:first').remove();

		e.preventDefault();
		return false;
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
                    if( $(this).prop('checked') == true && $(this)[0] != $box[0] ){
                        handleAddedGroupDeselection( $(this).prop('id') );
                    }
                })
                
                // the checked state of the group/box on the other hand will change
                // and the current value is retrieved using .prop() method
                $(group).prop("checked", false);
                $box.prop("checked", true);

                $('#tls-type-custom-validate').prop('value','nonimportant value to make validate');
                $('#tlsTaskForm').validator('validate');

                //handle the rest of the form options that will appear after a type selection
                handleAddedGroupSelection($box.prop('id'));

            } else {
                $box.prop("checked", false);
                $('#tls-type-custom-validate').prop('value','');
                $('#tlsTaskForm').validator('validate');

                handleAddedGroupDeselection( $box.prop('id') );
            }
        });
    //-----end SO snippet

        // the selector will match all input controls of type :radio
        // and attach a click event handler 
        $("input:radio.requestProf").on('click', function() {
            // in the handler, 'this' refers to the box clicked on
            var $box = $(this);
            if ($box.prop("id") === "radio-adds-form") {
                handleAddedGroupSelection($box.prop('class'));
            } else {
                handleAddedGroupDeselection( $box.prop('class') );
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
    data = filterRadios(data);

    //send our form data to the server
    socket.emit('form-submission', data);
    taskInputPending();
}


/**
 * 
 */
function filterFields(fields, data){

    _.forEach(addFieldsToData, function(x){
        if(x.class){
            var valueArray = [];
            var els = $( '.' + x.class );

            if(els){
                els.each(function(){
                    valueArray.push( $(this)[0].value );
                })

                console.log(valueArray);
                data[x.class] = JSON.stringify( valueArray );
            }
            else {
                throw new TypeError("Field values not found");
            }

        }
        else {
            var el = $( '#' + x.id );
            
            if(el){
                if(el[0].value == ''){
                    return;
                }
                else{
                    data[x.id] = el[0].value;
                }
            }
            else {
                throw new TypeError("Field value not found");
            }
        }
    })

    return data;
}


/**
 * 
 */
function filterCheckboxes(data){
    _.forEach(addCheckBoxToData, function(x){
        var el = $( 'input[name=' + x.id + ']:checked' );
        
        if(el){
            data[x.id] = el[0].value;
        }
    })

    return data;
}


/**
 * 
 */
function filterRadios(data){
    _.forEach(addRadioToData, function(x){
        var el = $( 'input[name=' + x.id + ']:checked' );
        
        if(el){
            data[x.id] = el[0].value;
        }
    })

    return data;
}




/**
 * 
 */
function handleAddedGroupSelection(formGroupName){
    var formData = tlsTypeFormFields[formGroupName];
    
    if(formData){
        $( '.' + formData.divClassName ).removeClass('hidden')
        
        _.forEach(formData.requiredInputNames, function(inputName){
            var requiredInput = $( '.' + formData.divClassName ).find("input[name=" + inputName + "]");
           requiredInput.prop('required', true);
        });
        
        addFieldNamesToCollectedData(formData);

    } else {
        throw new TypeError('More details for that request type do not exist');
    }
}



/**
 * probably will not need this to be a separate function...if it just needs to be one line of jquery
 * than we can move it back up to where it is called--we will wait to see if we need to do more things
 * when the form group is removed.
 */
function handleAddedGroupDeselection(formGroupName){
    var formData = tlsTypeFormFields[formGroupName];

    if(formData){
        $( '.' + formData.divClassName ).addClass('hidden')
        
         _.forEach(formData.requiredInputNames, function(inputName){
            var requiredInput = $( '.' + formData.divClassName ).find("input[name=" + inputName + "]");
           requiredInput.prop('required', false);
        });

        removeFieldNamesFromCollectedData(formData);
    }
    else{
        throw new TypeError("Form group does not exist to be removed");
    } 
}


function addFieldNamesToCollectedData(formData){
    if(formData.addFieldsToData) addFieldsToData = _.unionWith(addFieldsToData, formData.addFieldsToData);
    if(formData.addCheckBoxToData) addCheckBoxToData = _.unionWith(addCheckBoxToData, formData.addCheckBoxToData);
    if(formData.addRadioToData) addRadioToData = _.unionWith(addRadioToData, formData.addRadioToData);
}


function removeFieldNamesFromCollectedData(formData){
    if(formData.addFieldsToData) _.pullAllWith(addFieldsToData, formData.addFieldsToData);
    if(formData.addCheckBoxToData) _.pullAllWith(addCheckBoxToData, formData.addCheckBoxToData);
    if(formData.addRadioToData) _.pullAllWith(addRadioToData, formData.addRadioToData);
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
    var combinedDataFields = _.unionWith(addFieldsToData, addCheckBoxToData, addRadioToData);

    var returnData = {
        'Task Name         ': taskData.name,
        'Requested by      ': parsedExternalData.nameRequester,
        'RIT Email         ': parsedExternalData.emailRequester,
        'Course ID         ': parsedExternalData.courseID,
        'Request Type      ': parsedExternalData.type,
        'Date/Time Created ': parsedExternalData.titleDate,
        '------------------':'------------------'
    }

    _.forEach(combinedDataFields, function(x){
        if(x.readName != null){
            //if fields are optional they can be bla
            if(parsedExternalData[x.class] || parsedExternalData[x.id]){
                if(x.class){
                    returnData[x.readName] = parsedExternalData[x.class];
                }
                else {
                    returnData[x.readName] = parsedExternalData[x.id];
                }
            }
        }
    })

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

        $('#tlsTaskForm').find("input[type=checkbox]").each(function(){
            if( $(this).prop('checked', true) ){
                handleAddedGroupDeselection( $(this).prop('id') );
                $(this).prop('checked', false).button('refresh');
            }
        });

        $('#requestMadeByProf-1').prop('checked',false).button('refresh');
        $('#requestMadeByProf-0').prop('checked',true).button('refresh');
    }
}


var tlsTypeFormFields = {
    requestProf: {
        addFieldsToData: [
                            {id:'nameProfessor', readName:"Professor Name    "},
                            {id:'emailProfessor',readName:"Professor Email   "}
                         ],
        divClassName: "requestProf-form-group",
        requiredInputNames: ['nameProfessor','emailProfessor']
    },
    
    
    typeStreamingCaptioning: {
        addFieldsToData: [
                            {id:'videoType',          readName:"Video Type        "},
                            {class:'videoTitleOrLink',readName:"Video Titles/URLs "},
                            {id:'deliverableDate',    readName:"Deliverable Date  "},
                            {id:'deliveryMethod',     readName:"Delivery Method   "},
                            {id:'notes',              readName:"Notes             "},      
                         ],
        addRadioToData:  [
                            {id:'captioningRequested',readName:"Captioning Req    "},
                            {id:'onlineCourse',       readName:"Online Course     "}
                         ],
        divClassName: "typeStreamingCaptioning-form-group",
        requiredInputNames: ['videoType','deliverableDate', 'videoTitleOrLink']
    },
    typeDVD: {

    }, 
    typeRecording: {

    }
}