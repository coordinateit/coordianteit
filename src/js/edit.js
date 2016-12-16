"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function(){
  // getListData();
  // getTeamList();
  initCalendar();
  // getVisits();
  $('#calendar').hide();
  $('#calendar').fullCalendar('refetchEvents');
  $('#visit_date').val(new Date().toDateInputValue()); // Make today's date default
});

////// Make today's date default with timezone support ///////
Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});

////// Initialize map using customer position //////
var map;
function initMap() {
  let position = { lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) };
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
  });
  let marker = new google.maps.Marker({
    position: position,
    map: map,
  });
}


////////////////////////////////////////////////////////////////////////////////
//                                    CUSTOMER                                //
////////////////////////////////////////////////////////////////////////////////


////// Update customer in database //////
  $('#update_customer_button').click(function() {
    let data = {
      id: customer.id,
      customer_name: $('#customer_name').val(),
      status: $('#status').val(),
      phone_1: $('#phone_1').val(),
      phone_2: $('#phone_2').val(),
      email: $('#email').val(),
      address: $('#address').val(),
      city: $('#city').val(),
      state: $('#state').val(),
      zip: $('#zip').val(),
      customer_type: $('#customer_type').val(),
      referral: $('#referral').val(),
      notes: $('#notes').val()
    }
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: data,
      url: '/user/updateCustomer',
      success: function(data) {
        if (data.error) {
          $('#create_form').prepend(`<h3 style="color: red">${data.error}</h3>`)
        } else {
          window.location.reload();
        }
      }
    });
  });

////// Delete customer from database //////
$('#deleteCustomer').click(function() {
  if(window.confirm('Are you sure you want to delete this customer?')) {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: `/user/deleteCustomer/${customer.id}`,
      success: function(data) {
        if (data.error) {
          $('#create_form').prepend(`<h3 style="color: red">${data.error}</h3>`)
        } else {
          window.location = '/dashboard';
        }
      }
    })
  };
});



////////////////////////////////////////////////////////////////////////////////
//                                    VISITS                                  //
////////////////////////////////////////////////////////////////////////////////


////// Show visit in visit form //////
$('.visitEdit').click(function(event) {
  let visit = visits[event.target.id];
  console.log(visit);
  let start = new Date(parseInt(visit.start));
  let end = new Date(parseInt(visit.end));
  let dd = start.getDate();
  let MM = start.getMonth() + 1;
  if (dd.toString().length < 2) {
    dd = "0" + dd;
  }
  if (MM.toString().length < 2) {
    MM = "0" + MM;
  }
  let yyyy = start.getFullYear();
  let date = yyyy + "-" + MM + "-" + dd;
  let startTime = setTime(start);
  let endTime = setTime(end);

  $('#visit_date').val(date);
  $('#visit_start').val(startTime);
  $('#visit_end').val(endTime);
  $('#visit_type').val(visit.visit_type);
  let team = document.getElementById('visit_team');
  team.value = visit.team_id;
  $('#visit_notes').val(visit.notes);

  $("#create_visit").show();
  // $("#visit_list").hide();
  $("#saveVisitSubmit").show();
  $("#visitSubmit").hide();
  $('#saveVisitSubmit').click(function() {
    saveVisit(visit.id);
  });
});

////// Return pretty time string //////
function setTime(time) {
  let hh = time.getHours();
  let mm = time.getMinutes();
  if (hh.toString().length < 2) {
    hh = "0" + hh;
  }
  if (mm.toString().length < 2) {
    mm = "0" + mm;
  }
  return hh + ":" + mm;
}

////// Update visit in database //////
function saveVisit(visitId) {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let end = $('#visit_end').val();
  let newEnd = Date.parse(date + ', ' + end);
  let data = {
    id: visitId,
    start: newStart,
    end: newEnd,
    visit_type: $('#visit_type').val(),
    team_id: $('#visit_team').val(),
    notes: $('#visit_notes').val()
  };
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/updateVisit",
    success: function() {
      window.location.reload();
    }
  });
}

////// Clear visit form //////
$('#clear_visit').click(function() {
    // $('#create_visit').find('input:text, select, textarea').val('');
    $('#visit_date').val(null);
    $('#visit_start').val(null);
    $('#visit_end').val(null);
    $('#visit_type').val(null);
    $('#visit_team').val(null);
    $('#visit_notes').val(null);
    $("#saveVisitSubmit").hide();
    $("#visitSubmit").show();
    // $("#create_visit").hide();
    $("#visit_list").show();
});

$('.visitDelete').click(function(event) {
  if(window.confirm("Are you sure you want to delete this visit?")) {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: `/user/deleteVisit/${event.target.id}`,
      success: function() {
        window.location.reload();
      }
    });
  }
});



////////////////////////////////////////////////////////////////////////////////
//                                    SWITCHES                                //
////////////////////////////////////////////////////////////////////////////////


////// Customer Profile / Visits Switch ///////
$(".switch_calendar_job").change(function() {
  let userinput = $(this);
  if (userinput.prop("checked")){
    $("#create_job").show();
    $("#create_visit_container").hide();
  } else {
    $("#create_job").hide();
    $("#create_visit_container").show();
  }
});

////// Map / Calendar Switch ///////
$(".switch_map_list").change(function() {
  let userinput = $(this);
  if (userinput.prop("checked")){
    $("#map").show();
    $("#calendar").hide();
  } else {
    $("#map").hide();
    $("#calendar").show();
  }
});
