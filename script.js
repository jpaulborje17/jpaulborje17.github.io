console.log("hello world1111111");

(function ($, window, document, undefined) {

    'use strict';
    // Get member sessionStorage from maestro
    var member_dataSession = JSON.parse(window.parent.sessionStorage.getItem("member_info"));
    var houseHoldNum;
    var ezcommCommunications;
    var pageUrl = document.forms[0].elements["TaskSectionReference"].value;
    var reset = false;
    var householdIdSched;

    var activeTier1IframeId = window.parent.$('div[id^="PegaWebGadget"]').filter(
        function () {
            return this.id.match(/\d$/);
        }).filter(function () {
        return $(this).attr('aria-hidden') === "false";
    }).contents()[0].id;

    function isAutodocMnrNotEmpty() {
        if (sessionStorage.getItem('autodocmnrgpp') !== null && sessionStorage.getItem('QuestionRadioStatusAppt') !== 'OPT_IN') {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');

            if(sessionStorage.getItem('optoutappt') !== null) {
                sessionStorage.removeItem('optoutappt');
            }

        } else if(sessionStorage.getItem('autodocmnrgpp') === null && sessionStorage.getItem('QuestionRadioStatusAppt') !== 'OPT_IN') {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');

            if(sessionStorage.getItem('optoutappt') !== null) {
                sessionStorage.removeItem('optoutappt');
            }
        }
        return false;
    }

    function checkIfReset(){
        if(sessionStorage.getItem('autodocmnrgpp') !== null && sessionStorage.getItem('QuestionRadioStatusAppt') === 'OPT_IN') {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');
            reset = true;
        }
    }

    //TODO: remove?
    if (pageUrl == "ScheduleAppointment") {
        isAutodocMnrNotEmpty();
    }

    function launchWinMnR() {
        var appWindow = window.parent.open("/a4me/ezcomm-core-v2/", "a4meEZCommWindow", 'location=no,height=600,width=1000,scrollbars=1');
        isAutodocMnrNotEmpty();
        checkIfReset();
        var detail = '';


        var configappt = false;
        var myObj = requestMetaDataMandRAppt().plugins;
        Object.keys(myObj).forEach(function (key) {
            if (myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                configappt = true;
                console.log('config is ON');
            }
        });


        var loop = setInterval(function () {
            if (appWindow.closed) {
                if (sessionStorage.getItem('messageSuccess') === null && configappt) {
                    window.parent.sessionStorage.removeItem("QuestionRadioStatusAppt");
                    document.getElementById('ezcomm-mnr-mail-question-yes').checked = false;
                    window.parent.sessionStorage.removeItem("autodocmnrgpp");
                }

                clearInterval(loop);
            }
        }, 1000);
    }

    function getMemberDataMandR() {
        var ezcommMandRMemObj = {};

        var memberDob = member_dataSession.member_dob;
        var year = memberDob.substring(0, 4);
        var month = memberDob.substring(4, 6);
        var day = memberDob.substring(6, 8);
        memberDob = month + "/" + day + "/" + year;

        ezcommMandRMemObj.firstName = member_dataSession.member_first_name;
        ezcommMandRMemObj.lastName = member_dataSession.member_last_name;
        ezcommMandRMemObj.dateOfBirth = memberDob;
        ezcommMandRMemObj.subscriberId = member_dataSession.member_id.split('-')[0];
        ezcommMandRMemObj.idTypeCode = "20202";
        ezcommMandRMemObj.policyId = "0";
        ezcommMandRMemObj.encryptedFlag = false;
        ezcommMandRMemObj.additionalIdentifiers = [{
            id: getHouseHoldIdAppt(),
            type: "GPSHID"
        }];
        return ezcommMandRMemObj;
    }


    function requestMetaDataMandRAppt() {
        var requestMetaDataMandRObj = {};
        var pluginObject = [];
        var plugin = {};
        var plugin2 = {};
        var epmpObj = {};
        var contact_info_setobj = {};

        requestMetaDataMandRObj.agentId = pega.d.pyUID;
        requestMetaDataMandRObj.applicationName = "MAESTRO-EZCOMM";
        requestMetaDataMandRObj.lineOfBusiness = "M&R";

        epmpObj.enabled = true;
        epmpObj.retrieveAllStatus = true;
        epmpObj.allowUpdate = false;

        contact_info_setobj.enable_email = true;
        contact_info_setobj.enable_sms = true;
        contact_info_setobj.enable_fax = false;

        plugin.name = "";
        plugin.defaultCampaign = "";
        plugin.pluginId = "9";

        if (pageUrl == "ScheduleAppointment") {

            var msgprov = messagesMandR()[0].msg_parameters;
            var detail = '';

            if (Object.keys(msgprov).length) {
                Object.keys(msgprov).forEach(function (key) {
                    detail = msgprov.doctor + "\n" + msgprov.location + " " + msgprov.phone + "\n" + msgprov.date + " " + msgprov.time + "\n";
                });
            }
        }

        plugin2.pluginId = "10";
        plugin2.name = "Autodoc";
        plugin2.params = {
            additionalAutoDoc: detail
        };

        sessionStorage.setItem('schedproviders', detail);

        pluginObject.push(plugin);
        pluginObject.push(plugin2);

        requestMetaDataMandRObj.epmp = epmpObj;
        requestMetaDataMandRObj.contact_info_settings = contact_info_setobj;
        requestMetaDataMandRObj.plugins = pluginObject;
        return requestMetaDataMandRObj;
    }


    function callChangeProviderV2(row) {
        var scheduleAppointment;
        if (pageUrl == "ScheduleAppointment") {
            scheduleAppointment = {
                providerId: ($(row).closest('tr').find('td:eq(1) span input').length > 0 ? $(row).closest('tr').find('td:eq(1) span input').val() : $(row).closest('tr').find('td:eq(1)').text()),
                providerName: ($(row).closest('tr').find('td:eq(2) span input').length > 0 ? $(row).closest('tr').find('td:eq(2) span input').val() : $(row).closest('tr').find('td:eq(2)').text()),
                address: ($(row).closest('tr').find('td:eq(3) span input').length > 0 ? $(row).closest('tr').find('td:eq(3) span input').val() : $(row).closest('tr').find('td:eq(3)').text()),
                providerPhoneNumber: ($(row).closest('tr').find('td:eq(10) span input').length > 0 ? $(row).closest('tr').find('td:eq(10) span input').val() : $(row).closest('tr').find('td:eq(10)').text()),
                specialty: ($(row).closest('tr').find('td:eq(4) span input').length > 0 ? $(row).closest('tr').find('td:eq(4) span input').val() : $(row).closest('tr').find('td:eq(4)').text()),
                date: $('#AppointmentDate').val(),
                time: $('#AppointmentTime').val()
            };
        }

        return scheduleAppointment;
    };


    function messagesMandR() {

        var objs;
        var objprov1 = {};
        var objprov2 = {};
        var msg_param = {};
        var filtersObject = [];
        var scheduleAppointment = callChangeProviderV2($("#bodyTbl_right tr td input[type=radio]:checked"));

        objprov1.type = "EMAIL";
        objprov1.campaignId = 68;
        objprov1.template_name = "Provider_Appt_Info_EMAIL";

        objprov2.type = "SMS";
        objprov2.campaignId = 68;
        objprov2.template_name = "Provider_Appt_Info_SMS";

        if (pageUrl == "ScheduleAppointment") {

            objs = {
                doctor: scheduleAppointment.providerName,
                location: scheduleAppointment.address,
                phone: scheduleAppointment.providerPhoneNumber,
                date: scheduleAppointment.date,
                time: scheduleAppointment.time
            };
        }

        objprov1.msg_parameters = objs;
        objprov2.msg_parameters = objs;

        filtersObject.push(objprov1);
        filtersObject.push(objprov2);
        return filtersObject;
    }


    function getCurrentDateTime() {
        var d = new Date();
        var day = d.getDate();
        var hr = d.getHours();
        var min = d.getMinutes();
        if (min < 10) {
            min = "0" + min;
        }
        var ampm = "am";
        if (hr > 12) {
            hr -= 12;
            ampm = "pm";
        }
        else if (hr == 12) {
            ampm = "pm";
        }

        if (hr < 10) {
            hr = "0" + hr;
        }

        var date = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        var month = d.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }

        var year = d.getFullYear();
        var sec = d.getSeconds();
        if (sec < 10) {
            sec = "0" + sec;
        }

        var dateTimeString = month + "/" + date + "/" + year + " " + hr + ":" + min + ":" + sec + " " + ampm;
        return dateTimeString;
    }


    var providerTierNotes = '';
    if (document.forms[0].elements["TaskSectionReference"].value == "Tier1CompletionDetails") {

        //TODO: ADD OPT_IN MESSAGE HERE..s
        if(sessionStorage.getItem('campaignName') === "AppointmentSched") {

            var configuration = false;
            var myObj = requestMetaDataMandRAppt().plugins;
            Object.keys(myObj).forEach(function (key) {
                console.log(myObj[key].pluginId); // the value of the current key.
                if (myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                    configuration = true;
                    console.log('config is ON');
                }
            });

            if (configuration) {
                if (sessionStorage.getItem('autodocmnrappt') !== null) {
                    providerTierNotes = sessionStorage.getItem('autodocmnrappt');

                    if(sessionStorage.getItem('QuestionRadioStatusAppt') === "OPT_IN"  ) {
                        sessionStorage.removeItem('QuestionRadioStatusAppt');
                        sessionStorage.removeItem('schedproviders');
                    }
                }
                else {
                    var tier1Comments = window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#Comments').val();
                    if (tier1Comments === undefined || tier1Comments === '' || !tier1Comments.contains("Opt-in: Yes")) {

                        if(sessionStorage.getItem('optoutappt') !== null) {
                            providerTierNotes = "***Appointment Schedule Email Message Opt-in: No, " + getCurrentDateTime() + "***\n" +
                                "***Appointment Schedule SMS Message Opt-in: No, " + getCurrentDateTime() + "***\n";
                            sessionStorage.removeItem('QuestionRadioStatusAppt');
                        }
                    }
                }
            }  else {
                if(sessionStorage.getItem('QuestionRadioStatusAppt') === "OPT_IN" || sessionStorage.getItem('QuestionRadioStatusAppt') === "OPT_OUT") {
                    sessionStorage.removeItem('QuestionRadioStatusAppt');
                    sessionStorage.removeItem('schedproviders');
                }
            }
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#Comments').val(providerTierNotes);
        }
    }

    var ezcommCore = {
        app: {

            appWindow: null,

            open: function (config) {
                window.parent.localStorage.setItem('EzcommCommunicationsPayload', JSON.stringify(config));

                if (localStorage.getItem("EzcommWindowOpen") === 'true') {
                    window.open("", "a4meEZCommWindow").close();
                }
                launchWinMnR();
            },

            get: function () {
                return this.appWindow;
            }
        }
    };


    function messageEventAppt(msg) {
        if(msg.data) {
            var additionalAutoDoc = sessionStorage.getItem('schedproviders') + "\n";
            console.log('msg');
            sessionStorage.setItem('messageSuccess', 'success');
            var data = msg.data.replace("Preference ", "").replace("Override ", "").replace(additionalAutoDoc, "");
            var isNull = false;
            if(window.parent.sessionStorage.getItem('autodocmnrappt') === null) {
                window.parent.sessionStorage.setItem('autodocmnrappt', data + additionalAutoDoc);
                isNull = true;
            }
            else {
                appendToStorage('autodocmnrappt', data, additionalAutoDoc);

            }
            return false;
        }
    }


    function appendToStorage(name, data, additionalAutoDoc){
        var old = window.parent.sessionStorage.getItem(name);
        var oldContainer = "";
        if(old === null) {
            old = "";
            oldContainer = old;
        } else {
            oldContainer = old.replace(additionalAutoDoc,"");
        }
        var newAuto = data + additionalAutoDoc;
        console.log(newAuto);
        window.parent.sessionStorage.setItem(name, oldContainer += newAuto);
    }


    window.parent.$(document).on('change', '.ezcomm-mnr-mail-question-buttonappt', function () {
        if(window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find(".subheaderFieldSetStyle").length > 0) {
            if (this.value == "yes") {

                window.parent.removeEventListener("message", messageEventAppt, false);      // Succeeds

                window.parent.sessionStorage.setItem("QuestionRadioStatusAppt", "OPT_IN");

                ezcommCommunications = {
                    config: {
                        data: {
                            member: {},
                            request_metadata: {},
                            message: messagesMandR()

                        }
                    }
                };

                ezcommCommunications.config.data.member = getMemberDataMandR();
                ezcommCommunications.config.data.request_metadata = requestMetaDataMandRAppt();
                ezcommCommunications.config.data.message;
                ezcommCore.app.open(ezcommCommunications.config);


                var iframe = window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents();

                if(iframe) {
                    window.parent.addEventListener("message", messageEventAppt, false);
                }
            }
            else {
                if (sessionStorage.getItem('autodocmnrappt') === null) {
                    window.parent.sessionStorage.setItem('optoutappt', 'optoutautodoc')
                    window.parent.sessionStorage.setItem("QuestionRadioStatusAppt", "OPT_OUT");
                }
            }
        }
    });


    var EmailCheckRadioButtonContentYes = '<span class="dataValueWrite" style="height:38px;width:193px;">\
            <span class="col-3"><input name="optradio" type="radio" value="yes" id="ezcomm-mnr-mail-question-yes" class="Radio ezcomm-mnr-mail-question-buttonappt" style="vertical-align: middle;" checked><label class="rb_ rb_standard radioLabel">Yes</label></span>\<span class="col-3"><input name="optradio" type="radio" value="no" id="ezcomm-mnr-mail-question-no" class="ezcomm-mnr-mail-question-buttonappt" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">No</label></span>\
    <span/>';

    var EmailCheckRadioButtonContentNo = '<span class="dataValueWrite" style="height:38px;width:193px;">\
            <span class="col-3"><input name="optradio" type="radio" value="yes" id="ezcomm-mnr-mail-question-yes" class="Radio ezcomm-mnr-mail-question-buttonappt" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">Yes</label></span>\<span class="col-3"><input name="optradio" type="radio" value="no" id="ezcomm-mnr-mail-question-no" class="ezcomm-mnr-mail-question-buttonappt" style="vertical-align: middle;" checked><label class="rb_ rb_standard radioLabel">No</label></span>\
    <span/>';

    var EmailCheckRadioButtonContent = '<span class="dataValueWrite" style="height:38px;width:193px;">\
            <span class="col-3"><input name="optradio" type="radio" value="yes" id="ezcomm-mnr-mail-question-yes" class="Radio ezcomm-mnr-mail-question-buttonappt" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">Yes</label></span>\<span class="col-3"><input name="optradio" type="radio" value="no" id="ezcomm-mnr-mail-question-no" class="ezcomm-mnr-mail-question-buttonappt" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">No</label></span>\
    <span/>';


    $(document).on('DOMSubtreeModified', '#pyFlowActionHTML div ', function () {

        if ($('#pyWorkPageIsProviderScheduledYes').prop('checked')) {
            if ($("#newlyAddedQuestionEmail").length == 0) {

                if(window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find(".subheaderFieldSetStyle").length > 0) {

                    if (window.parent.sessionStorage.getItem("QuestionRadioStatusAppt") == "OPT_IN") {
                        $('.subheaderFieldSetStyle').append('<span id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContentYes + '</span>');
                    }
                    else if (window.parent.sessionStorage.getItem("QuestionRadioStatusAppt") == "OPT_OUT") {
                        $('.subheaderFieldSetStyle').append('<span id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContentNo + '</span>');
                    }
                    else {
                        $('.subheaderFieldSetStyle').append('<span id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContent + '</span>');
                    }

                }
            }
        }
    });


    if ($('#pyWorkPageIsProviderScheduledYes').prop('checked')) {
        if ($("#newlyAddedQuestionEmail").length == 0) {

            if(window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find(".subheaderFieldSetStyle").length > 0) {

                if (window.parent.sessionStorage.getItem("QuestionRadioStatusAppt") == "OPT_IN") {
                    $('.subheaderFieldSetStyle').append('<span id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContentYes + '</span>');
                }
                else if (window.parent.sessionStorage.getItem("QuestionRadioStatusAppt") == "OPT_OUT") {
                    $('.subheaderFieldSetStyle').append('<span id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContentNo + '</span>');
                }
                else {
                    $('.subheaderFieldSetStyle').append('<span id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContent + '</span>');
                }

            }
        }
    }

    function getHouseHoldIdAppt() {
        householdIdSched = getAttributeValue("pyWorkPage", "MemberID");
        return householdIdSched;
    }

    if (pageUrl == "ScheduleAppointment") {
        getHouseHoldIdAppt();
        $(document).on('DOMSubtreeModified', '.sectionDivStyle', function() {
            sessionStorage.setItem('campaignName', 'AppointmentSched');
            getHouseHoldIdAppt();
        });

    }

}(jQuery, window, document));

