$(function () {
    document.getElementById("cantFindID").addEventListener("click", function () {
        switchPages("login", "findID");
    });
    document.getElementById("fileChooser").addEventListener("change", setFaultImage, false);
    $('.main,#logo').click(function (e) {
        if (e.target.className !== "sideNav") {
            sideNavToggle('close');
        }
    })
    $('#otherCategoryTxt').on("change keyup paste", function () {
        charsRemaining('otherCategoryTxt');
    });
    $('#description').on("change keyup paste", function () {
        charsRemaining('description');
    });
});

var ngrokRan = '11417996';
var ngrok = 'http://' + ngrokRan + '.ngrok.io';

var localhost = 'http://localhost:3000';

var host = localhost;


//object of objects that can be used to populate 
var faultCategories = {
    wifi: {
        name: 'wifi',
        example_1: "Slow connection",
        example_2: "Cannot connect",
        example_3: "Cannot find wifi"
    },
    toilet: {
        name: 'toilet',
        example_1: "Toilet does not flush",
        example_2: "Sink does not work",
        example_3: "No toilet paper"
    },
    HVAC: {
        example_1: "Carriage too hot",
        example_2: "Carriage too cold",
        example_3: "Air smells weird"
    },
    door: {
        example_1: "Door will not open",
        example_2: "Door will not shut",
        example_3: "Door reaction slow"
    },
    window: {
        example_1: "Window scratched",
        example_2: "Window cracked",
        example_3: "Window too dirty"
    },
    seat: {
        example_1: "Seat dirty",
        example_2: "Hole in seat",
        example_3: "Ajoined table broken"
    },
    socket: {
        example_1: "Not charging",
        example_2: "Something stuck in socket",
        example_3: "Socket loose from wall"
    },
    displayPanel: {
        example_1: "Leds broken",
        example_2: "Not on",
        example_3: "Displaying wrong or old info"
    }
};

var noLocationFaults = ['wifi', 'toilet', 'displayPanel', 'HVAC'];

var noPhotoFaults = ['wifi', 'HVAC'];

function switchPages(from, to) {
    var classFrom = $("." + from);
    var classTo = $("." + to);

    setTimeout(function () {
        classFrom.removeClass("fade");
    }, 0);

    setTimeout(function () {
        classFrom.removeClass("current");
    }, 500);

    setTimeout(function () {
        classTo.addClass("current");
    }, 500);

    setTimeout(function () {
        classTo.addClass("fade");
    }, 1000);
}

function login(from) {
    if (from === "login") {
        checkStaffID();
        // switchPages function temporary
        //switchPages("login", "options");
    } else if (from === "findID") {
        // need to check staffID using name and ID
        // switchPages function temporary
        //switchPages("findID", "options");
        checkStaffDetails();
    }
}

function clearIssues() {
    setTimeout(function () {
        $(".issue").removeClass("show");
    }, 500);
}

//used by login page to get the server to query postgres for the staff 
//when the staff id is provided
function checkStaffID() {
    var userID = $("#idInputBox").val();
    if (userID === "") {
        console.log("invalid user id");
        $("#invalidStaffId").addClass("show");
    } else {
        var json = JSON.stringify(userID);
        var output = {};
        $.ajax({
            url: host + "/check_id",
            type: "POST",
            data: json,
            success: function (rt) {
                output = JSON.parse(rt);
                console.log(output.check_id);
                var id_exists = output.check_id;
                if (id_exists) {
                    setUserDetails(userID)
                    switchPages("login", "options");
                    $('.link').css('opacity', '1');
                } else {
                    console.log("invalid user id");
                    $("#invalidStaffId").addClass("show");
                }
            },
            error: function (xhr, status, error) {
                alert("Error - " + xhr.status + '\n---------\n' + xhr.statusText);
                console.log("error");
            }
        });
    }
}

function setUserDetails(userID) {
    var userDetails = new Object();
    userDetails.userID = userID;
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
    var filters = new Object();
    filters.carriageno = null;
    filters.category = null;
    filters.status = null;
    filters.datereported = null;
    localStorage.setItem('filters', JSON.stringify(filters));
}

function setPageElements() {

    // removes any error message shown from previous request.
    $(".issue").removeClass("show");

    var carDetails = JSON.parse(localStorage.getItem("carDetails"));

    // set page 2 options by iterating through features found in carriage and setting them to show

    // set all fault options to original state by removing hide class
    $('.faultOption').removeClass('hide');

    // iterate through carDetails object and if the value is of type boolean and it is false add hide class
    for (var key in carDetails) {
        if (typeof carDetails[key] === "boolean" && !carDetails[key]) {
            $("#" + key).addClass('hide');
        }
    }

    // set page 2 button height and span depending on number and parity of buttons
    var hiddenOptions = $('.faultOption.hide').length;
    var totalOptions = $('.faultOptions').children().length;
    var options = totalOptions - hiddenOptions;
    var optionParity = options % 2;

    if (options > 6) {
        $('.faultOption').css("height", "50px");
    }

    if (optionParity === 1) {
        $('#other').css("grid-column", "span 2");
    }

}

function setLocalStorage() {
    var userDetails = JSON.parse(localStorage.getItem("userDetails"));
    var reportFault = new Object();
    reportFault.user = userDetails.userID;
    reportFault.carriage = $('#carNum').val();
    localStorage.setItem('reportFault', JSON.stringify(reportFault));
}

function checkStaffDetails() {
    var staffDetails = new Object();
    staffDetails.fname = $("#fname").val();
    staffDetails.sname = $("#sname").val();
    staffDetails.dob = $("#dob").val();
    var json = JSON.stringify(staffDetails);
    $.ajax({
        url: host + "/check_staff",
        type: "POST",
        data: json,
        success: function (rt) {
            console.log(rt);
            output = JSON.parse(rt);
            console.log(output);
            var userID = output.staffid;
            console.log(userID);
            if (output.staffid !== false) {
                setUserDetails(userID)
                switchPages("findID", "options");
            } else {
                console.log("no id found");
            }
        },
        error: function () {
            console.log("error");
        }
    });
}

//used by rf page 1
//querys server/database for valid carriage number before proceeding. 
function getCarriageDetails() {
    var carriageNo = $("#carNum").val();
    if (carriageNo === "") {
        console.log("invalid - no carriage number provided");
        $("#invalidCarriageId").addClass("show");
    } else {
        var json = JSON.stringify(carriageNo);
        var output = {};
        $.ajax({
            url: host + "/get_carriage_details",
            type: "POST",
            data: json,
            success: function (rt) {
                output = JSON.parse(rt);
                if (output.car_exists) {
                    localStorage.setItem("carDetails", JSON.stringify(output));
                    setLocalStorage();
                    setPageElements();
                    switchPages('rf-1', 'rf-2');
                } else {
                    console.log("invalid - carriage id does not exist");
                    $("#invalidCarriageId").addClass("show");
                }
            },
            error: function () {
                console.log("error");
                alert("there has been an error contacting the server");
            }
        });
    }
}

// method to submit all of the data to the database at the end of the form
function submitForm() {
    // method to submit all of the data to the database at the end of the form
    var reportFault = JSON.parse(localStorage.getItem('reportFault'));
    var userDetails = JSON.parse(localStorage.getItem('userDetails'));
    reportFault.userID = userDetails.userID;
    console.log(reportFault);
    var json = JSON.stringify(reportFault);
    console.log(json);
    $.ajax({
        url: host + "/submit_form",
        type: "POST",
        data: json,
        success: function (rt) {
            console.log(rt);
            console.log("data submitted");
            var returnedData = JSON.parse(rt);
            if (returnedData.success) {
                localStorage.removeItem('reportFault');
                reset();
                switchPages('rf-5', 'rf-6');
            }
        },
        error: function () {
            alert("there has been an error contacting the server");
            console.log("data not submitted");
        }
    });
    // send fault object to server
}

function getUsersFaults() {
    var userDetails = localStorage.getItem('userDetails');
    $.ajax({
        url: host + "/get_users_faults",
        type: "POST",
        data: userDetails,
        success: function (rt) {
            var userFaults = JSON.parse(rt);
            localStorage.setItem('userFaults', rt);

            $('#viewUserFaults').empty();
            for (var i = 0; i < userFaults.length; i++) {
                $('#viewUserFaults').append("<a id='fault" + i + "' class='faultView' onclick='viewFaultDetails(" + i + ")'>"
                    + "<h3>" + userFaults[i].carriageno + " - " + userFaults[i].category + " </h3>"
                    + "<h4>" + userFaults[i].faultdesc + " </h4>"
                    + "</a>");
            }
        },
        error: function () {
            console.log("error")
        }
    });
}

function getFaultImage(faultNo, i) {
    //console.log(faultNo);
    var json = JSON.stringify(faultNo);
    console.log(json);
    $.ajax({
        url: host + "/get_fault",
        type: "POST",
        data: json,
        success: function (rt) {
            var fault = JSON.parse(rt);
            console.log(fault[0].img);
            var src = fault[0].img;
            $('#fault' + i).append("<img id='detImg' src='" + src + "' alt='fault image' />");
        },
        error: function () {
            console.log("error");
        }
    });
}
// gets all faults reported by the user 
// returns an array of objects with each fault as an object
function viewFaultDetails(i) {
    var json = localStorage.getItem('userFaults');
    var userFaults = JSON.parse(json);
    var fault = userFaults[i];
    $("#detImg").remove();
    getFaultImage(fault.faultno, i);
    //    $('#detCarNo').text(fault.carriageno);
    //    $('#detCat').text(fault.category);
    //    $('#detDes').text(fault.faultdesc);
    //    $('#detLoc').text(fault.location);
    //    switchPages('vf-1', 'vf-2');
}

function updateFaultDetails(faultNo) {
    var json = JSON.stringify(faultNo);
    $.ajax({
        url: host + "/get_fault",
        type: "POST",
        data: json,
        success: function (rt) {
            var fault = JSON.parse(rt);
            console.log(fault[0]);
        },
        error: function () {
            console.log("error");
        }
    });
    switchPages('uf-3b', 'uf-4');
}

function setFilters() {
    var filters = JSON.parse(localStorage.getItem('filters'));
    for (var filter in filters) {
        var value = $('#' + filter + 'Filter').val();
        console.log(value);
        if (value == 'none' || value == "") {
            filters[filter] = null;
        }
        else {
            filters[filter] = value;
        }

    }
    console.log(filters);
    localStorage.setItem('filters', JSON.stringify(filters));
    filterFaults(filters);
}
// stores all the filters set on the update fault page into local storage and calls filterFaults()

function resetFilters() {
    var filters = JSON.parse(localStorage.getItem('filters'));
    for (var filter in filters) {
        var value = $('#' + filter + 'Refilter').val();
        console.log(value);
        if (value == 'none' || value == "") {
            filters[filter] = null;
        }
        else {
            filters[filter] = value;
        }

    }
    console.log(filters);
    localStorage.setItem('filters', JSON.stringify(filters));
    filterFaults(filters);
    filtNav();
}

function filterFaults(filters) {
    var json = JSON.stringify(filters);
    $.ajax({
        url: host + "/filter_faults",
        type: "POST",
        data: json,
        success: function (rt) {
            var faults = JSON.parse(rt);
            $("#updateFaults").empty();
            for (var key in faults) {
                var fault = faults[key];
                switch (fault.status) {
                    case 'R':
                        fault.status = "Reported";
                        break;
                    case 'I':
                        fault.status = "In Progress";
                        break;
                    case 'C':
                        fault.status = "Completed";
                        break;
                }
                fault.datereported = fault.datereported.split('T')[0];
                var str = "<a class='filters' id='faultNo" + fault.faultno + "' onclick='updateFaultDetails(5)'>"
                    + "<h3>" + fault.carriageno + " - " + fault.category + " </h3>"
                    + "<h4>" + fault.faultdesc + " </h4>"
                    + "</a>";
                //console.log(str);
                $('#updateFaults').append(str);

            }
        },
        error: function () {
            console.log("error")
        }
    })
}

function filtNav() {
    var toggle = $('#filtNavBut').val();
    filtNavToggle(toggle);
}

function filtNavToggle(toggle) {
    if (toggle === 'open') {
        $('#filtNavBut').val('close');
        setTimeout(function () {
            $('#filtToggle').removeClass('hidden');
        }, 0);

        setTimeout(function () {
            $('#filtToggle').addClass('fade');
        }, 500);
    } else {
        setTimeout(function () {
            $('#filtToggle').removeClass('fade');
        }, 0);

        setTimeout(function () {
            $('#filtToggle').addClass('hidden');
        }, 500);
        $('#filtNavBut').val('open');
    }
}

function typeNum(num) {
    //get the maximum seat capacity for the carriage from the object in  local storage
    var carriage = JSON.parse(localStorage.getItem('carDetails'));
    var maxSeats = carriage.seats;

    //get the current number shown on the screen. second line removes the prepended text
    var seatNoStr = $("#seatNo").text();
    console.log(seatNoStr);
    var currentSeatStr = seatNoStr.split(": ").pop();

    //append new digit
    var newSeatStr = currentSeatStr + num;

    //parse to int to allow for comparison with max seat number
    var newSeatInt = parseInt(newSeatStr);

    //compare attempted input with max seat no. If new input is within valid range, 
    //continue and display new number. if the current string does not have any seat number,
    //do not delete anything. otherwise display error message.
    if (newSeatInt <= maxSeats) {
        console.log('valid seat');
        if (num === "-1") {
            $("#seatNo").text(function (_, txt) {
                return txt.slice(0, -1);
            });
        } else if (num === '0') {
            if (seatNoStr !== '') {
                $("#seatNo").append(num);
            }
        } else {
            $("#seatNo").append(num);
        }
    } else {
        $("#seatNoIssueMsg").text(" Seat number too large");
        $("#invalidSeatNo").addClass("show");
        console.log('seat number too large');
    }
}



// Called when the user selects any fault option button or when any change is made to the description panel. 
// Removes show class from all fault options and adds a show class to the selected button (used to change the css).
// If the selected button is not other, or it is other and the description is not empty, then set the switchPage 
// function for the next button. If other is selected and input is empty reset the onlclick function of the rf-2Next to 
// checkInput

function selectFault(type) {

    $(".faultOption").removeClass("show");
    $("#" + type).addClass('show');

    if (type === 'other') {
        $("#otherCategory").addClass('show');
        $('.rf-2SectionArea').animate({
            scrollTop: $('.rf-2SectionArea')[0].scrollHeight
        }, 400);
    } else {
        $('.rf-2SectionArea').animate({
            scrollTop: 0
        }, 300);

        setTimeout(function () {
            $("#otherCategory").removeClass('show');
        }, 250);
    }
}

// Called when the user selects 'Next'. Checks to ensure that an option has been selected in step 2 and if 'other' 
// is selected it checks to make sure a description is provided
function checkInput(page) {

    var reportFault = JSON.parse(localStorage.getItem('reportFault'));

    switch (page) {

        case 'rf-1':

            getCarriageDetails();
            break;

        case 'rf-2':

            var selectedFault = $('.faultOption.show').attr("id");
            var otherInput = $('#otherCategoryTxt').val();
            $(".example_faults").removeClass('hide');
            $("#rf-3StepDescription").empty();
            $("#rf-3StepDescription").text('Please add a short description of the fault by typing in the text field or press one of the common faults.');

            switch (selectedFault) {
                case 'wifi':
                    requiresImage(false);
                    step2ToStep3(selectedFault);
                    break;
                case 'toilet':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'HVAC':
                    requiresImage(false);
                    step2ToStep3(selectedFault);
                    break;
                case 'door':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'window':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'seat':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'socket':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'displayPanel':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'other':
                    requiresImage(true);
                    addFaultDetails('category', otherInput);
                    if (otherInput !== '') {
                        switchPages('rf-2', 'rf-3');
                    }
                    else {
                        alert('Please provide a description of the category');
                    }
                    if (selectedFault === 'other') {
                        $(".example_faults").addClass('hide');
                        $("#rf-3StepDescription").empty();
                        $("#rf-3StepDescription").text('Please add a description of the fault by typing in the text field.');
                    }
                    break;
                default:
                    //nothing selected.
                    if (selectedFault === undefined) {
                        alert('Please select a fault category');
                    }
            }

            break;

        case 'rf-3':

            var locationNotRequired = noLocationFaults.includes(reportFault.location);
            var description = $('#description').val();

            $("#region").removeClass("show");
            $("#seats").removeClass("show");

            if (description === '') {
                alert('please provide a description of the fault');
                break;
            } else {
                addFaultDetails('description', description);
            }

            if (locationNotRequired) {
                setSummaryPage();
                switchPages('rf-3', 'rf-5');
            } else {
                setRF4();
                switchPages('rf-3', 'rf-4');
            }
            break;

        case 'rf-3Popup':

            var locationNotRequired = noLocationFaults.includes(reportFault.location);
            var description = $('#description').val();

            $("#region").removeClass("show");
            $("#seats").removeClass("show");

            addFaultDetails('description', description);

            if (locationNotRequired) {
                setSummaryPage();
                closePopup();
                switchPages('rf-3', 'rf-5');
            } else {
                setRF4();
                closePopup();
                switchPages('rf-3', 'rf-4');
            }
            break;

        case 'rf-4':

            if ($('.faultLocator.seats.show').length === 1) {
                var seatNo = $('#seatNo').text();
                if (seatNo > 0) {
                    var seatNoStr = 'seat ' + seatNo;
                    addFaultDetails('location', seatNoStr);
                    switchPages('rf-4', 'rf-5');
                } else {
                    alert('Please enter a valid seat number');
                    break;
                }
            } else if ($('.faultLocator.region.show').length === 1) {
                // repeat something similar to above but for faults located using region
            }

            setSummaryPage();
            break;

        case 'rf-5':
            submitForm();
            break;

    }

}

//function added by ben.
//used when transitioning from rf page 2 to rf page 3 
function step2ToStep3(selectedFault) {

    if (noLocationFaults.includes(selectedFault)) {
        addFaultDetails('location', selectedFault);
    }

    //set up the detailed description examples on the next page
    $("#example_1").text(faultCategories[selectedFault].example_1);
    $("#example_2").text(faultCategories[selectedFault].example_2);
    $("#example_3").text(faultCategories[selectedFault].example_3);

    addFaultDetails('category', selectedFault);
    switchPages('rf-2', 'rf-3');

}

function setRF4() {

    var carDetails = JSON.parse(localStorage.getItem("carDetails"));

    if (carDetails.seats > 0) {
        var maxSeats = carDetails.seats;
        $("#seats").addClass("show");
        $("#maxSeatNo").text(maxSeats);
        $("#seats").addClass("show");
    } else {
        $("#region").addClass("show");
    }

}

function checkPhoto() {

    // checks if photo exists
    var reportFault = JSON.parse(localStorage.getItem('reportFault'));
    // if it does exist then the next button will run the regular checks and changes
    if (reportFault.img) {
        checkInput('rf-3');
    } else {

        var description = $('#description').val();

        if (description === '') {
            alert('please provide a description of the fault');
        } else {
            openPopup('camera');
        }

    }

    // if it doesn't exist it will open a popup menu that will have a next button that will execute the previous comment. The back button will open the file chooser and minimise the popup

}

//function added by ben.
//used when transitioning from rf page 2 to rf page 3 
//called with true if a category requires a photo to be added when on rf page 3
//called with false if not
function requiresImage(bool) {
    if (bool) {
        $('#addPhoto').addClass("show");
    } else {
        $('#addPhoto').removeClass("show");
    }
}

function addFaultDetails(key, value) {
    var reportFault = JSON.parse(localStorage.getItem('reportFault'));
    reportFault[key] = value;
    localStorage.setItem('reportFault', JSON.stringify(reportFault));
}

function removeFaultDetails(key) {
    var reportFault = JSON.parse(localStorage.getItem('reportFault'));
    delete reportFault[key];
    localStorage.setItem('reportFault', JSON.stringify(reportFault));
}

function exampleDescription(detail) {
    var description = $("#" + detail).text();
    $("#description").val(description);
    charsRemaining('description');
}

function storeDescription() {
    var description = $('#description').val();
    if (description !== "description") {
        var reportFault = JSON.parse(localStorage.getItem('reportFault'));
        reportFault.description = description;
        localStorage.setItem('reportFault', JSON.stringify(reportFault));
    }
}

function back(page) {
    switch (page) {
        case 'signOut':
            switchPages('section', 'login');
            break;
        case 'rf-1':
            reset();
            break;
        case 'rf-2':
            // empty local storage
            localStorage.removeItem('carDetails');
            localStorage.removeItem('reportFault');
            switchPages('rf-2', 'rf-1');
            break;
        case 'rf-3':
            // remove location and fault category from reportFault in local storage
            removeFaultDetails('location');
            removeFaultDetails('category');
            switchPages('rf-3', 'rf-2');
            break;
        case 'rf-4':
            // remove fault description
            removeFaultDetails('description');
            switchPages('rf-4', 'rf-3');
            break;

        case 'rf-5':
            // if a fault location method is not set in step 4 then remove description from reportFault in local storage and switch page to page 3
            // else remove location from report in local storage and switch page to page 4
            var seatsActive = $('.faultLocator.seats.show').length;
            var regionActive = $('.faultLocator.region.show').length;
            if (seatsActive === 0 && regionActive === 0) {
                removeFaultDetails('description');
                switchPages('rf-5', 'rf-3');
            } else {
                removeFaultDetails('location');
                switchPages('rf-5', 'rf-4');
            }
            break;
    }
}

function setSummaryPage() {

    var reportFaultDetails = JSON.parse(localStorage.getItem("reportFault"));

    for (var key in reportFaultDetails) {
        switch (key) {
            case 'carriage':
                $("#sumCarNo").empty();
                $("#sumCarNo").text(reportFaultDetails[key]);
                break;
            case 'category':
                $("#sumCat").empty();
                $("#sumCat").text(reportFaultDetails[key].charAt(0).toUpperCase() + reportFaultDetails[key].slice(1));
                break;
            case 'location':
                $("#sumLoc").empty();
                $("#sumLoc").text(reportFaultDetails[key].charAt(0).toUpperCase() + reportFaultDetails[key].slice(1));
                break;
        }
    }
}

// When an event listener’s event occurs it calls its associated function and passes a reference to the event object
// the function below picks up that event 
function setFaultImage(event) {

    // image
    var file = event.target.files[0];

    var reader = new FileReader();

    reader.onload = function (e) {
        addFaultDetails('img', e.target.result);
        $('#sumImg').attr('src', e.target.result);
        console.log(e.target.result);
    };

    reader.readAsDataURL(file);

    if (file) {
        $('#imgUploadStatus').removeClass('glyphicon-unchecked');
        $('#imgUploadStatus').addClass('glyphicon-checked');
        $('.addImageTitle').text('Change Photo');
    }

}

function showImage() {
    var json = JSON.stringify('carriageNo');
    $.ajax({
        url: host + "/show_image",
        type: "POST",
        data: json,
        success: function (rt) {

            var json = JSON.parse(rt);
            console.log(json);
            console.log(json[0].img);
            $('#imagetest').attr('src', json[0].img);

        },
        error: function () {
            alert("there has been an error contacting the server");
            console.log("data not submitted");
        }
    });
}

function sideNav(scenario) {

    var loginStatus = localStorage.getItem('userDetails');
    console.log(loginStatus);

    switch (scenario) {
        case 'toggle':
            sideNavToggle();
            break;
        case 'rf-1':
        case 'vf-1':
        case 'uf-1':
            // check login status. if legit switch pages and toggle
            if (loginStatus !== null) {
                reset();
                switchPages('section', scenario);
                sideNavToggle();
            }
            break;
        case 'signOut':
            if (loginStatus !== null) {
                localStorage.clear();
                switchPages('section', 'login');
                sideNavToggle();
                $('.link').css('opacity', '0.4');
                // empty #idInputBox input (on sign out not submission)
                // empty carriage number input (on sign out not submission)
                $('#idInputBox').val('');
                $('#carNum').val('');
                reset();
            }
            break;
    }

}

function sideNavToggle(task) {

    var sideNav = $('.sideNav.show').length;

    if (task === 'close' || sideNav === 1) {
        $('.sideNav').removeClass('show');
        $('header').css('margin-left', '0px');
        $('.section').css('margin-left', '10px');
    } else {
        $('.sideNav').addClass('show');
        $('header').css('margin-left', '250px');
        $('.section').css('margin-left', '250px');
    }

}

// called if the user clicks sign out from overlay or they report a fault successfully
function reset() {
    $('.faultOption').removeClass('show');
    $('#otherCategoryTxt').val('');
    $('#otherCategory').removeClass('show');
    $('#description').val('');
    $('#maxSeatNumber').empty('');
    $('#seatNo').empty('');
    $('.section').scrollTop(0);
    $('.issue').removeClass('show');
    $('#imgUploadStatus').removeClass('glyphicon-checked');
    $('#imgUploadStatus').addClass('glyphicon-unchecked');
    $('.addImageTitle').text('Add Photo');
    $('#sumImg').attr('src', '');


}

function changeFontSize() {

    var currentSize = $('html').css("font-size");

    switch (currentSize) {
        case '12px':
            $('html').css("font-size", "16px");
            break;
        case '16px':
            $('html').css("font-size", "20px");
            break;
        case '20px':
            $('html').css("font-size", "12px");
            break;
    }

}

function charsRemaining(from) {
    if (from === 'otherCategoryTxt') {
        var characters = $('#otherCategoryTxt').val().length + 1;
        var remainingCharacters = 51 - characters;
        $('#charsRemainingCat').text(remainingCharacters);
    }
    else if (from === 'description') {
        var characters = $('#description').val().length + 1;
        var remainingCharacters = 301 - characters;
        $('#charsRemainingDes').text(remainingCharacters);
    }

}

function openFileChooser() {
    document.getElementById('fileChooser').click();
}

function openPopup(page) {

    console.log(page);

    $('.popup').addClass('footless');
    $('#popupTitle').empty();
    $('#popupDescription').empty();
    $('.popupImg').remove();
    $('#popupFooter').removeClass('split');
    $('#popupLeftBtn').attr('onclick', 'closePopup()');
    $('#popupLeftBtn').text('Close');


    switch (page) {
        case 'rf-1':
            $('#popupTitle').text('Page Guidance');
            $('#popupDescription').text('This page requires you to enter the carriage number in which you found the fault. Please see some images below to help you locate the carriage number.');
            $("#popupDescription").after("<img class='popupImg' src='public/imgs/carNum1.png' alt=''><img class='popupImg' src='public/imgs/carNum2.png' alt=''><img class='popupImg' src='public/imgs/carNum3.png' alt=''>");
            $('.popup').removeClass('footless');
            break;
        case 'rf-2':
            $('#popupTitle').text('Page Guidance');
            $('#popupDescription').text('This page requires you to select a category that best suits the fault. If a suitable category is not present select other and input your own category.');
            break;
        case 'rf-3':
            $('#popupTitle').text('Page Guidance');
            $('#popupDescription').text('This page requires you to enter a short description of the fault. Here you can also add a photo if you think it is appropriate. Enter a description quickly by pressing one of the common faults or add your own description.');
            break;
        case 'camera':
            // call this when you hit next and no image is present. Remind them they haven't added an image and if they would like to they should hit close and add an image if not press next to continue
            $('#popupTitle').text('Page Guidance');
            $('#popupDescription').text('Would you like to add an image to the fault? If so, please select the camera button bottom left, otherwise proceed by selecting continue.');

            $('#popupFooter').addClass('split');
            $('#popupLeftBtn').empty().append("<span class='glyphicon glyphicon-camera'></span>");
            $('#popupLeftBtn').attr('onclick', "closePopup(); openFileChooser()");

            $('#popupRightBtn').empty().text('Continue');
            $('#popupRightBtn').attr("onclick", "checkInput('rf-3Popup'); closePopup()");

            break;

        case 'rf-4':

            var faultLocatorActive = $('.faultLocator.seats.show').length;

            if (faultLocatorActive === 1) {
                $('#popupTitle').text('Page Guidance');
                $('#popupDescription').text('This page requires you to use the key pad to input the closest seat to the fault. Please see some images below to help you locate your seat number.');
                $("#popupDescription").after("<img class='popupImg' src='public/imgs/Seat_1.png' alt=''><img class='popupImg' src='public/imgs/Seat_2.png' alt=''><img class='popupImg' src='public/imgs/Seat_3.png' alt=''>");
            } else {
                $('#popupTitle').text('Page Guidance');
                $('#popupDescription').text('This pages requires you to select the area on the carriage in which the fault was found.');
            }




            break;
    }

    $('.popup').addClass('show');

}

function closePopup() {
    $('.popup').removeClass('show');
}


function changeFaultStatus() {
    var data = new Object();
    data.faultNo = 4;
    data.status = 'I';
    data.staffID = 123456;
    var json = JSON.stringify(data);
    $.ajax({
        url: host + "/change_fault_status",
        type: "POST",
        data: json,
        success: function (rt) {
            console.log(rt);
        },
        error: function () {
            console.log("error");
        }
    });
}

function getAssignedFaults() {
    var userDetails = JSON.parse(localStorage.getItem('userDetails'));
    var json = JSON.stringify(userDetails);
    $.ajax({
        url: host + '/get_assigned_faults',
        type: 'POST',
        data: json,
        success: function (rt) {
            console.log(rt);
            var faults = JSON.parse(rt);
            $("#assignedFaults").empty();
            for (var key in faults) {
                var fault = faults[key];
                switch (fault.status) {
                    case 'R':
                        fault.status = "Reported";
                        break;
                    case 'I':
                        fault.status = "In Progress";
                        break;
                    case 'C':
                        fault.status = "Completed";
                        break;
                }
                fault.datereported = fault.datereported.split('T')[0];
                var str = "<a class='filters' id='" + fault.faultno + "' onclick='viewFaultDetails(" + fault.faultno + ")'>"
                    + "<h3>" + fault.carriageno + " - " + fault.category + " </h3>"
                    + "<h4>" + fault.faultdesc + " </h4>"
                    + "</a>";
                $('#assignedFaults').append(str);

            }
        },
        error: function () {
            console.log("error");
        }
    });
}
