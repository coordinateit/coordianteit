"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function() {
  initCalendar();
  getListData();
  getTeamList();
  getVisits(null);
  $('#calendar').fullCalendar('refetchEvents');
});



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
    schedulesLookup.schedules = {};
    let visits = data.map(function(visit) {
      let start = new Date(parseInt(visit.start));
      start = schedulesLookup.lookup(start); // Determines if start time is available, then adjusts if need be
      let end = new Date(start.getTime() + 1800000);
      return { id: visit.id, title: `${visit.team_name} - ${visit.visit_type} - ${visit.customer_name} - ${visit.address} - ${visit.phone_1}`, start: start, end: end }
    })
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', visits);
    $('#calendar').fullCalendar('refetchEvents');
  });
}

////// When user clicks a visit //////
function visitClick(customerId, index) {
  var customers = [];
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: `/dashboard/customerVisit/${customerId}`
  }).then(function(customer) {
    customers.push(customer)
    makeMarkers(customers);
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
  // let date = new Date(Date.now());
  // let start = date.setHours(0,0,0,0);
  // let end = start + 604800000;
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
  // var date = new Date(parseInt(Date.now()));
  // let start = date.setHours(0,0,0,0);
  // let end = date.setHours(24,0,0,0);
  let dates = date_range();
  let start = dates.start;
  let end = dates.end;
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: { teams: JSON.stringify(teams), start: start, end: end },
    url: '/user/list',
    success: function(visits) {
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
  $(".list").append("<tr><th>Date</th><th>Start Time</th><th>End Time</th><th>Customer Name</th><th>Address</th><th>Visit type</th><th>Crew</th></tr>");
  for (var i = 0; i < visits.length; i++) {
    let date = parseDate(visits[i].start);
    let start = parseTime(visits[i].start);
    let end = parseTime(visits[i].end);
    $(".list").append(`<tr><td>${date}</td><td>${start}</td><td>${end}</td><td>${visits[i].customer_name}</td><td>${visits[i].address}</td><td>${visits[i].visit_type}</td><td>${visits[i].crew}</td></tr>`);
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
