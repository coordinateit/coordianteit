"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function() {
  getListData();
  getTeamList();
  initCalendar();
  getVisits();
  $('#calendar').fullCalendar('refetchEvents');
});



////////////////////////////////////////////////////////////////////////////////
//                                  CALENDAR                                  //
////////////////////////////////////////////////////////////////////////////////


////// Get visits from server //////
function getVisits(team) {
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: { team: team },
    url: '/user/visits'
    // url: `/user/visits/${team}`
  }).then(function(data) {
    var visits = data.map(function(visit) {
      let start = new Date(parseInt(visit.start));
      // Use timeslotLookup to determine if starttime is available, then adjust if need be
      start = schedulesLookup.lookup(start);
      let end = new Date(start.getTime() + 1800000);
      return { id: visit.id, title: visit.visit_type, start: start, end: end }
    })
    // console.log(schedulesLookup.schedules);
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', visits);
    $('#calendar').fullCalendar('refetchEvents');
  });
}

var schedulesLookup = {
  schedules: {},

  lookup: function(start) {
    let date = "date" + start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
    let startUTC = start.getTime();
    if (!this.schedules[date]) {
      this.schedules[date] = new Schedule;
    }
    if (startUTC % 1800000) {
      console.log("modulo");
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
function getCustomers(team) {
  let start = Date.now();
  let end = start + 604800000;
  // let team = $('#visit_team').val();
  getCustomersDateTeam(start, end, team);
}



////////////////////////////////////////////////////////////////////////////////
//                                    LIST                                    //
////////////////////////////////////////////////////////////////////////////////


////// Get list data from server ///////
function getListData(team) {
  var date = new Date(parseInt(Date.now()));
  var start = date.setHours(0,0,0,0);
  var end = date.setHours(24,0,0,0);
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: { team: team, start: start, end: end },
    url: '/user/list',
    success: function(data) {
      visitList(data);
    }
  });
}

////// Add data to list ///////
function visitList(data) {
  // Make an array of ids for list view
  var listIds = data.map(function(i) {
    return i.id;
  })
  window.localStorage.list = JSON.stringify(listIds);
  $(".list").empty();
  $(".list").append("<tr><th>Team</th><th>Start Time</th><th>Visit type</th><th>Address</th><th>Phone Number</th></tr>");
  for (var i = 0; i < data.length; i++) {
    let time = parseTime(data[i].start)
    $(".list").append("<tr><td>" + data[i].team_id + "</td><td>" + time + "</td><td>" + data[i].visit_type + "</td><td>" + data[i].address + "</td><td>" + data[i].phone_number + '</td></tr>');
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
