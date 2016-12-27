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
  console.log(team);
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: { team: team },
    url: '/user/visits'
    // url: `/user/visits/${team}`
  }).then(function(data) {
    var visits = data.map(function(visit) {
      let start = new Date(parseInt(visit.start));
      let end = new Date(parseInt(visit.end));
      return {id: visit.id, title: visit.visit_type, start: start, end: end}
    })
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', visits);
    $('#calendar').fullCalendar('refetchEvents');
  });
}



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
