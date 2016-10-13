$(document).ready(function(){
  getListData();
  getTeamList();
  getVisits();
  testLogin();
});


////// Get team data from server ///////

function getTeamList() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/teams',
    success: function(data) {
      teamList(data);
    }
  });
}


////// Populate team lists //////

function teamList(teams) {
  for (var i = 0; i < teams.length; i++) {
    $('.teams').append(`<option value=${teams[i].id}>${teams[i].team_name}</option>`);
  }
}



////// Get list data from server ///////

function getListData(){
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/listView',
    success: function(data) {
      visitList(data);
    }
  });
}


////// Get visits from server //////

function getVisits() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/visitsAll'
  }).then(function(data) {
    var visits = data.map(function(visit) {
      let start = new Date(parseInt(visit.start));
      let end = new Date(parseInt(visit.end));
      return {id: visit.id, title: visit.visit_type, start: start, end: end}
    })
    initCalendar(visits);
  });
}


////// Initialize calendar and display visits //////

function initCalendar(visits) {
  $('#calendar').fullCalendar({
    events: visits,
    eventClick: function(event) {
      getVisit(event._id);
    },
    eventMouseover: function() {
      document.body.style.cursor = "pointer";
    },
    eventMouseout: function() {
      document.body.style.cursor = "default";
    }
  });
}


////// Get visit and associated job //////

function getVisit(id) {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/visit/' + id,
    success: function(data) {
      showJob(data);
    }
  });
}


////// Initialize map using current position //////

var map;
var markers = [];
var position = JSON.parse(window.localStorage.position);
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11
  });
  map.addListener('tilesloaded', function() {
    var bounds = map.getBounds();
    getJobs(bounds);
  });
}


////// Get jobs from server //////

function getJobs(bounds) {
  $.ajax({
    type: 'POST',
    data: {bounds: JSON.stringify(bounds)},
    dataType: 'json',
    url: '/user/jobs'
  }).then(function(jobs) {
    setMarkers(jobs);
  });
}


////// Display jobs on mpa //////

function setMarkers(jobs) {
  for (var i = 0; i < markers.length; i++) {  // Clear markers
    markers[i].setMap(null);
  }
  markers = [];
  for (var i = 0; i < jobs.length; i++) {  // Set new markers
    let marker = new google.maps.Marker({
      position: {lat: parseFloat(jobs[i].lat), lng: parseFloat(jobs[i].lng)},
      map: map,
      id: jobs[i].id,
      label: String.fromCharCode(jobs[i].id + 64),
      title: jobs[i].customer_name
    });
    marker.addListener('click', function() {
      getJob(marker.id)
    });
    markers.push(marker);
  }
}


////// Get data for a specific job //////

function getJob(id) {
  var url = '/user/job/' + id;
  $.ajax({
    type: 'GET',
    datatype: 'json',
    url: url
  }).then(function(data) {
    showJob(data);
  });
}


////// Show job in form //////

function showJob(job) {
  // Toggle calendar / job form
  $("#calendar").hide();
  $("#create_form").show();
  $(".switch_calendar_job").prop("checked", false);
  // Populate job form
  $('#customer_name').attr('value', job.customer_name);
  $('#po_number').attr('value', job.po_number);
  $('#email').attr('value', job.email);
  $('#po_number').attr('value', job.po_number);
  $('#phone_number').attr('value', job.phone_number);
  $('#address').attr('value', job.address);
  $('#city').attr('value', job.city);
  let state = document.getElementById('state');
  state.value = job.state;
  $('#zip').attr('value', job.zip);
  let team = document.getElementById('team');
  team.value = job.team_id;
  let priority = document.getElementById('priority');
  priority.value = job.priority;
  $('#notes').attr('value', job.notes);
}


////// Map List Switch ///////

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


////// Calendar - Create Job Switch ///////

$(".switch_calendar_job").change(function() {
  var userinput = $(this);
  if (userinput.prop("checked")){
    $("#calendar").show();
    $("#create_form").hide();
  } else {
    $("#calendar").hide();
    $("#create_form").show();
  }
});


////// Add data to list ///////

function visitList(data) {
  for (var i = 0; i < data.length; i++) {
    let date = new Date(parseInt(data[i].start));
    let meridiem = 'am';
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if (hours > 12) {
      meridiem = 'pm';
      hours -= 12;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    let time = hours + ":" + minutes + " " + meridiem;
    $(".list").append("<tr><td>" + data[i].team_id + "</td><td>" + time + "</td><td>" + data[i].job_type + "</td><td>" + data[i].address + "</td><td>" + data[i].phone_number + "</td></tr>");
  }
}

////// Profile Button Div Switch /////

$(".menu button").on("click", function(){
  var button_id = "." + $(this).attr("id");
  $(".credentials").hide();
  $(".team_management").hide();
  $(".user_management").hide();
  $(button_id).show();
});

function testLogin() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/test',
    success: function(user) {
      $('#testLogin').text(user.email);
    }
  });
}
