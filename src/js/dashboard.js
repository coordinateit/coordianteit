"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function() {
  initCalendar();
  getListData();
  getTeamList();
  getVisits(null);
  getCustomerList();
  $('#calendar').fullCalendar('refetchEvents');
});

function filter_vendor_visit(visits) {
  let date = new Date();
  date.setHours(0);
  return visits.filter(function(visit) {
    return !visit.is_vendor || (parseInt(visit.start) > date);
  });
}



////////////////////////////////////////////////////////////////////////////////
//                                  CALENDAR                                  //
////////////////////////////////////////////////////////////////////////////////


////// Get visits from server to display on calendar //////
function getVisits(teams) {
  // TODO: filter by date range
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: { teams: JSON.stringify(teams) },
    url: '/user/visits'
  }).then(function(data) {
    data = filter_vendor_visit(data);
    schedulesLookup.schedules = {};
    let visits = data.map(function(visit) {
      let start = new Date(parseInt(visit.start));
      let newStart = schedulesLookup.lookup(start); // Determines if start time is available, then adjusts if need be
      let end = new Date(newStart.getTime() + 1800000);
      return { visit_id: visit.visit_id, customers_id: visit.customers_id, title: `${parseTime(visit.start)} - ${visit.team_name} - ${visit.visit_type} - ${visit.customer_name} - ${visit.address} - ${visit.phone_1}`, start: newStart, end: end }
    });
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', visits);
    $('#calendar').fullCalendar('refetchEvents');
  });
}

////// When user clicks a visit //////
function visitClick(customerId, index) {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: `/dashboard/customerVisit/${customerId}`
  }).then(function(customer) {
    setTimeout(function() {
      makeMarkers([customer], customer);
      click_marker();
      function click_marker() {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i].id == customerId) {
            return google.maps.event.trigger(markers[i], 'click');
          }
        }
      }
    }, 300);
  });
}

////// Schedules object contains timeslot objects for every day with visits //////
////// Lookup function checks for available timeslots and increments until finding one available //////
var schedulesLookup = {
  schedules: {},
  lookup: function(start) {
    let date = "date" + start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
    let startUTC = start.getTime();
    if (!this.schedules[date]) {
      this.schedules[date] = new Schedule;
    }
    if (startUTC % 1800000) {
      let remainder = startUTC % 1800000;
      startUTC = startUTC - remainder;
    }
    lookupLoop();
    function lookupLoop() {
      let newStart = new Date(startUTC);
      let time = "time" + newStart.getHours() + "-" + newStart.getMinutes();
      if (schedulesLookup.schedules[date][time]) {
        startUTC += 1800000;
        lookupLoop();
      } else {
        schedulesLookup.schedules[date][time] = true;
      }
      return;
    }
    start = new Date(startUTC)
    return start;
  }
}

////// Prototype for daily schedule used above //////
var Schedule = class {
  // this['timeX-X'] refers to timeslot in military time. So time8-0 = 8am. time13-30 = 1:30pm.
  constructor() {
    this['time7-0'] = false,
    this['time7-30'] = false,
    this['time8-0'] = false,
    this['time8-30'] = false,
    this['time9-0'] = false,
    this['time9-30'] = false,
    this['time10-0'] = false,
    this['time10-30'] = false,
    this['time11-0'] = false,
    this['time11-30'] = false,
    this['time12-0'] = false,
    this['time12-30'] = false,
    this['time13-0'] = false,
    this['time13-30'] = false,
    this['time14-0'] = false,
    this['time14-30'] = false,
    this['time15-0'] = false,
    this['time15-30'] = false,
    this['time16-0'] = false,
    this['time16-30'] = false,
    this['time17-0'] = false,
    this['time17-30'] = false,
    this['time18-0'] = false,
    this['time18-30'] = false
  }
};

$('#calendar').click(function() {
  filter_by_team();
});

////// Populate customer list //////
var customers = [];
var customer_select;
function getCustomerList() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/customer_list'
  }).then(function(response) {
    customers = response;
  });
}

$('#visit_customer').keyup(function() {
  let customer_input = $('#visit_customer').val();
  let customer_search = customers.filter(function(customer) {
    return customer.customer_name.toLowerCase().includes(customer_input.toLowerCase());
  });
  $('#customer_list').empty();
  // Search array
  for (var i = 0; i < customer_search.length; i++) {
    $('#customer_list').append(`<tr><td id='customer${customer_search[i].id}' class="customer_list_item">${customer_search[i].customer_name}</td></tr>`);
    // Bind customer id and name to appended element
    $(`#customer${customer_search[i].id}`).data('customer_id', customer_search[i].id);
    $(`#customer${customer_search[i].id}`).data('customer_name', customer_search[i].customer_name);
  }

  $('.customer_list_item').click(function(event) {
    let customer_id = event.target.id;
    let customer_name = $(`#${customer_id}`).data('customer_name');
    customer_select = $(`#${customer_id}`).data('customer_id');
    $('#visit_customer').val(customer_name);
    $('#customer_list').empty();
  });
});


$('#visit_start').on('change', function() {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let newEnd = new Date(newStart + 3600000);
  let endTime = htmlTime(newEnd);
  $('#visit_end').val(endTime);
});

$('#visit_submit').click(function() {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let end = $('#visit_end').val();
  let visit = {
    customers_id: customer_select,
    visit_type: $('#visit_type').val(),
    start: Date.parse(date + ', ' + start),
    end: Date.parse(date + ', ' + end),
    team_id: $('#visit_team').val(),
    notes: $('#visit_notes').val(),
    crew: $('#visit_crew').val()
  }
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: visit,
    url: '/user/postVisit'
  }).then(function(response) {
    window.location = `/edit/${visit.customers_id}/visit/${response.visit_id}`
  });
});

////////////////////////////////////////////////////////////////////////////////
//                                    MAP                                     //
////////////////////////////////////////////////////////////////////////////////


////// Initialize map using current position //////
var lookupMarker;
var newJobMarker;
var bounds;
var currentDate = Date.now();
var position = JSON.parse(window.localStorage.position);

/////// Callback to invoke when map is ready //////
function mapReady() {
  getCustomers();
}

////// Get customers for coming week, option for filter by team //////
function getCustomers(teams) {
  let dates = date_range();
  let start = dates.start;
  let end = dates.end;
  getCustomersDateTeam(start, end, teams);
}



////////////////////////////////////////////////////////////////////////////////
//                                    LIST                                    //
////////////////////////////////////////////////////////////////////////////////


////// Get list data from server ///////
function getListData(teams) {
  let dates = date_range();
  let start = dates.start;
  let end = dates.end;
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: { teams: JSON.stringify(teams), start: start, end: end },
    url: '/user/list',
    success: function(visits) {
      visits = filter_vendor_visit(visits);
      visits.sort(function(a, b) {
        return a.start - b.start;
      });
      visitList(visits);
    }
  });
}

////// Add data to list ///////
function visitList(visits) {
  // Make an array of ids for list view
  var listIds = visits.map(function(visit) {
    return visit.id;
  })
  window.localStorage.list = JSON.stringify(listIds);
  $(".list").empty();
  $(".list").append("<tr><th>Date</th><th>Start Time</th><th>Team</th><th>Customer Name</th><th>Address</th><th>Visit type</th><th>Crew</th><th>Notes</th></tr>");
  for (var i = 0; i < visits.length; i++) {
    let date = parseDate(visits[i].start);
    let start = parseTime(visits[i].start);
    let end = parseTime(visits[i].end);
    $(".list").append(`<tr><td>${date}</td><td>${start}</td><td>${visits[i].team_id}<td>${visits[i].customer_name}</td><td>${visits[i].address}</td><td>${visits[i].visit_type}</td><td>${visits[i].crew}</td><td>${visits[i].notes}</td></tr>`);
  }
}



////////////////////////////////////////////////////////////////////////////////
//                                    SWITCHES                                //
////////////////////////////////////////////////////////////////////////////////


////// Map / List Switch ///////
$(".switch_map_list").change(function() {
  var userinput = $(this);
  if (userinput.prop("checked")){
    $("#map").show();
    $("#list").hide();
  } else {
    $("#map").hide();
    $("#list").show();
  }
});
