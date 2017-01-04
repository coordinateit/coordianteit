"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function() {
  getTeamList();
  initCalendar();
  $('#calendar').hide();
  $('#visit_date').val(new Date().toDateInputValue()); // Make today's date default
  $('#calendar').fullCalendar('addEventSource', calendarVisits);
  $(`#state option[value="${customer.state}"]`).attr("selected", "selected");
  $(`#customer_type option[value="${customer.customer_type}"]`).attr("selected", "selected");
});

////// Make today's date default with timezone support ///////
Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});



////////////////////////////////////////////////////////////////////////////////
//                                    MAP                                     //
////////////////////////////////////////////////////////////////////////////////

////// Set position and marker to customer location //////
position = { lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) };
function mapReady() {
  makeMarker(position);
}

//////  //////
function getNearbyCustomers() {
  let date = $('#visit_date').val();
  let time = $('#visit_start').val();
  let dateTime = Date.parse(date + ', ' + time);
  let start = dateTime - 302400000;
  let end = dateTime + 302400000;
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/customersByDates/' + start + '/' + end
  }).then(function(customers) {
    makeMarkers(customers);
  });
}

//////  //////
function checkTeamSchedule() {
  let date = $('#visit_date').val();
  let start = Date.parse(date);
  let end = start + 86400000; // Search today
  let team = $('#visit_team').val();
  getCustomersDateTeam(start, end, team);
}



////////////////////////////////////////////////////////////////////////////////
//                                    CUSTOMER                                //
////////////////////////////////////////////////////////////////////////////////


////// Update customer in database //////
  $('#update_customer_button').click(function() {
    let data = {
      id: customer.id,
      isactive: $('#status').val() ? true : false,
      customer_name: $('#customer_name').val(),
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
    console.log(data);
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: data,
      url: '/user/updateCustomer',
      success: function(data) {
        if (data.error) {
          $('#create_form').prepend(`<h3 style="color: red">${data.error}</h3>`)
        } else {
          // window.location.reload();
        }
      }
    });
  });



////////////////////////////////////////////////////////////////////////////////
//                                    VISITS                                  //
////////////////////////////////////////////////////////////////////////////////


////// Click edit to display visit in form //////
$('.visitEdit').click(function(event) {
  showVisit(event.target.id);
  console.log(event.target);
});

////// Show visit in visit form //////
function showVisit(visitIndex) {
  let visit = visits[visitIndex];
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
  $("#saveVisitSubmit").show();
  $("#visitSubmit").hide();
  $('#saveVisitSubmit').click(function() {
    saveVisit(visit.id);
  });
}

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

$('#visitSubmit').click(function() {
  visitSubmit();
});

////// Create visit in database //////
function visitSubmit() {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let end = $('#visit_end').val();
  let newEnd = Date.parse(date + ', ' + end);
  let data = {
    customers_id: customer.id,
    start: newStart,
    end: newEnd,
    visit_type: $('#visit_type').val(),
    notes: $('#visit_notes').val()
  };
  if ($('#visit_team').val()) {
    data.team_id = $('#visit_team').val()
  }
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/postVisit",
    success: function() {
      window.location.reload();
    }
  });
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
  $('#visit_date').val(null);
  $('#visit_start').val(null);
  $('#visit_end').val(null);
  $('#visit_type').val(null);
  $('#visit_team').val(null);
  $('#visit_notes').val(null);
  $("#saveVisitSubmit").hide();
  $("#visitSubmit").show();
  $("#visit_list").show();
});

/////// Prompts user for confirmation then deletes a visit //////
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

////// When Nearby Customers is clicked //////
$('#nearbyCustomers').click(function() {
  getNearbyCustomers();
});

////// When Check Team Schedule is clicked //////
$('#checkTeamSchedule').click(function() {
  checkTeamSchedule();
});



////////////////////////////////////////////////////////////////////////////////
//                                    CALENDAR                                //
////////////////////////////////////////////////////////////////////////////////


var calendarVisits = visits.map(function(visit, i) {
  let start = new Date(parseInt(visit.start));
  let end = new Date(parseInt(visit.end));
  return { id: visit.id, title: visit.visit_type, start: start, end: end, index: i }
});

function visitClick(customerId, visitIndex) {
  showVisit(visitIndex);
  $("#create_job").hide();
  $("#create_visit_container").show();
}



////////////////////////////////////////////////////////////////////////////////
//                                    SWITCHES                                //
////////////////////////////////////////////////////////////////////////////////


////// Customer Profile / Visits Switch ///////
$(".switch_visits_customer").change(function() {
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
$(".switch_map_calendar").change(function() {
  let userinput = $(this);
  if (userinput.prop("checked")){
    $("#map").show();
    $("#calendar").hide();
  } else {
    $("#map").hide();
    $("#calendar").show();
  }
});
