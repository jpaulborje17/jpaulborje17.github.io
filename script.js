console.log("update 16");

(function ($, window, document, undefined) {

    'use strict';
    // Get member sessionStorage from maestro
    var member_dataSession = JSON.parse(window.parent.sessionStorage.getItem("member_info"));
    var pageUrl = document.forms[0].elements["TaskSectionReference"].value;
    var householdIdSched;

    var activeTier1IframeId = window.parent.$('div[id^="PegaWebGadget"]').filter(
        function () {
            return this.id.match(/\d$/);
        }).filter(function () {
        return $(this).attr('aria-hidden') === "false";
    }).contents()[0].id;

    var ezcommButtonVar = setInterval(addEzcommCoreLauncherGPPPayment, 1500);

    function isAutodocMnrNotEmpty() {
        if (sessionStorage.getItem('autodocmnrgpp') !== null) {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');

            if(sessionStorage.getItem('optoutappt') !== null) {
                sessionStorage.removeItem('optoutappt');
            }

        } else if(sessionStorage.getItem('autodocmnrgpp') === null) {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');

            if(sessionStorage.getItem('optoutappt') !== null) {
                sessionStorage.removeItem('optoutappt');
            }
        }
        return false;
    }

    function checkIfReset(){
        if(sessionStorage.getItem('autodocmnrgpp') !== null) {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');
            reset = true;
        }
    }

    //TODO: remove?
    if (pageUrl == "MakeAPayment_GPSCC") {
        isAutodocMnrNotEmpty();
    }

    function launchWinMnR() {
        var appWindow = window.parent.open("/a4me/ezcomm-core-v2/", "a4meEZCommWindow", 'location=no,height=600,width=1000,scrollbars=1');
        isAutodocMnrNotEmpty();
        checkIfReset();

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
            id: "",
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

        plugin2.pluginId = "10";
        plugin2.name = "Autodoc";
        plugin2.params = {
            additionalAutoDoc: ""
        };

        pluginObject.push(plugin);
        pluginObject.push(plugin2);

        requestMetaDataMandRObj.epmp = epmpObj;
        requestMetaDataMandRObj.contact_info_settings = contact_info_setobj;
        requestMetaDataMandRObj.plugins = pluginObject;
        return requestMetaDataMandRObj;
    }



    function messagesMandR() {

        var objs;
        var objprov1 = {};
        var objprov2 = {};
        var msg_param = {};
        var filtersObject = [];

        objprov1.type = "EMAIL";
        objprov1.campaignId = 68;
        objprov1.template_name = "Provider_Appt_Info_EMAIL"; // TODO: Change template name
        objprov1.msg_parameters = [];

        objprov2.type = "SMS";
        objprov2.campaignId = 68;
        objprov2.template_name = "Provider_Appt_Info_SMS"; // TODO: Change template name
        objprov2.msg_parameters = [];

        filtersObject.push(objprov1);
        filtersObject.push(objprov2);
        return filtersObject;
    }


    var providerTierNotes = '';
    if (document.forms[0].elements["TaskSectionReference"].value == "Tier1CompletionDetails") {

        //TODO: ADD OPT_IN MESSAGE HERE..s
        if(sessionStorage.getItem('campaignName') === "MakeAPayment_GPSCC") { // TODO: change URL PAYMENT HEADER

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
                if (sessionStorage.getItem('autodocmnrappt') !== null) { // TODO: Storage name
                    providerTierNotes = sessionStorage.getItem('autodocmnrappt');

                    if(sessionStorage.getItem('QuestionRadioStatusAppt') === "OPT_IN"  ) { // // TODO: Storage name
                        sessionStorage.removeItem('QuestionRadioStatusAppt');
                        sessionStorage.removeItem('schedproviders');
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


  
    function getHouseHoldIdAppt() {
        householdIdSched = getAttributeValue("pyWorkPage", "MemberID");
        return householdIdSched;
    }

    if (pageUrl == "ScheduleAppointment") {
        getHouseHoldIdAppt();
        $(document).on('DOMSubtreeModified', '.sectionDivStyle', function() { // TODO: Change approach 
            sessionStorage.setItem('campaignName', 'AppointmentSched');
            getHouseHoldIdAppt();
        });

    }

  


  function addEzcommCoreLauncherGPPPayment() {
        if (window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("span:contains('None of the cases found are related to the current inquiry')").length > 0 &&
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("#gpppaymentheader").length === 0) {
                 $('#RULE_KEY > div:nth-child(1) > div > div > div > div > p').append('<div style="margin-bottom:10px"><button type="button" id="gpppaymentheader"><div class="pzbtn-rnd" ><div class="pzbtn-lft"><div class="pzbtn-rgt" ><div class="pzbtn-mid" ><img src="webwb/zblankimage.gif" alt="" class="pzbtn-i">EZComm</div></div></div></div></button></div>');
                //clearInterval(ezcommButtonVar); ToDo-Harish: look for better solution to clear interval or slow process if possible

                window.parent.document.getElementById('gpppaymentheader').addEventListener('click', function(){

                    var config = {
                        data: {
                            member: getMemberDataMandR(),
                            request_metadata: getRequestMetadata(),
                            message: messagesMandR()
                        }
                    }
                
                    ezcommCore.app.open(config);
                });
            

        }

  }

   
}(jQuery, window, document));

