"use strict";

////// Invoke these functions when page loads //////

$(document).ready(function(){
  getListData();
  getTeamList();
  initCalendar();
  getVisits();
});


////// Calendar / Create Switch ///////

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



////////////////////////////////////////////////////////////////////////////////
//                                    TEAMS                                   //
////////////////////////////////////////////////////////////////////////////////


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


////// Filter page by team //////

var teamFilter;
$('#teams').change(function(clicked) {
  teamFilter = $('#teams').find(":selected").val();
  getVisits();
  getJobs();
  getListData();
  $("#calendar").show();
  $("#create_form").hide();
  $(".switch_calendar_job").prop("checked", true);
});



////////////////////////////////////////////////////////////////////////////////
//                                  CALENDAR                                  //
////////////////////////////////////////////////////////////////////////////////


////// Initialize calendar and display visits //////

function initCalendar() {
  $('#calendar').fullCalendar({
    eventClick: function(event) {
      getVisit(event._id);
    },
    eventMouseover: function() {
      document.body.style.cursor = "pointer";
    },
    eventMouseout: function() {
      document.body.style.cursor = "default";
    },
    header: {
        left: 'title',
        center: 'month,agendaDay',
        right: 'prev,next today myCustomButton'
    },
    views: {
        agendaDay: {
            titleFormat: 'MMMM Do'
        }
    }
  });
}


////// Get visits from server //////

function getVisits() {
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: {team: teamFilter},
    url: '/user/visits'
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



////////////////////////////////////////////////////////////////////////////////
//                                    MAP                                     //
////////////////////////////////////////////////////////////////////////////////


////// Initialize map using current position //////

var map;
var markers = [];
var bounds;
var position = JSON.parse(window.localStorage.position);
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
  });
  map.addListener('tilesloaded', function() {
    bounds = map.getBounds();
    getJobs(bounds);
  });
}


////// Get jobs from server //////

function getJobs() {
  $.ajax({
    type: 'POST',
    data: {bounds: JSON.stringify(bounds), team: teamFilter},
    dataType: 'json',
    url: '/user/jobs'
  }).then(function(jobs) {
    setMarkers(jobs);
  });
}


////// Display jobs on map //////

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
      title: jobs[i].customer_name
    });
    marker.addListener('click', function() {
      getJob(marker.id)
    });
    markers.push(marker);
  }
}



////////////////////////////////////////////////////////////////////////////////
//                                    LIST                                    //
////////////////////////////////////////////////////////////////////////////////


////// Get list data from server ///////

function getListData() {
  var today = Date.now();
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: {team: teamFilter, day: today},
    url: '/user/list',
    success: function(data) {
      visitList(data);
      setIdArray(data);
    }
  });
}


////// Make an array of ids for list view //////

function setIdArray(data) {
  var listIds = data.map(function(i) {
    return i.id;
  })
  window.localStorage.list = JSON.stringify(listIds);
};


////// Add data to list ///////

function visitList(data) {
  $(".list").empty();
  $(".list").append("<tr><th>Team</th><th>Start Time</th><th>Visit type</th><th>Address</th><th>Phone Number</th></tr>");
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

function parseTime(input) {
  let date = new Date(parseInt(input));
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
  return hours + ":" + minutes + " " + meridiem;
}


////////////////////////////////////////////////////////////////////////////////
//                                    FORM                                    //
////////////////////////////////////////////////////////////////////////////////


////// Get data for a specific job //////
var currentJob;
function getJob(id) {
  var url = '/user/job/' + id;
  $.ajax({
    type: 'GET',
    datatype: 'json',
    url: url
  }).then(function(data) {
    currentJob = data.id;
    showJob(data);
  });
}


////// Post job //////

$('#update_job_button').click(function(event) {
  event.preventDefault();
  let data = {
    id: currentJob,
    customer_name: $('#customer_name').val(),
    po_number: $('#po_number').val(),
    email: $('#email').val(),
    po_number: $('#po_number').val(),
    phone_number: $('#phone_number').val(),
    address: $('#address').val(),
    city: $('#city').val(),
    state: $('#state').val(),
    zip: $('#zip').val(),
    priority: $('#priority').val(),
    job_type: $('#job_type').val(),
    notes: $('#notes').val()
  }
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/updateJob",
    success: function() {
      window.location = '/dashboard.html';
    }
  });
});


////// Show job in form //////

function showJob(job) {
  // Toggle calendar / job form
  $("#calendar").hide();
  $("#create_form").show();
  $(".switch_calendar_job").prop("checked", false);
  // Populate job form
  $('#customer_name').val(job.customer_name);
  $('#po_number').val(job.po_number);
  $('#email').val(job.email);
  $('#po_number').val(job.po_number);
  $('#phone_number').val(job.phone_number);
  $('#address').val(job.address);
  $('#city').val(job.city);
  let state = document.getElementById('state');
  state.value = job.state;
  $('#zip').val(job.zip);
  let priority = document.getElementById('priority');
  priority.value = job.priority;
  $('#job_type').val(job.job_type);
  $('#notes').val(job.notes);

  // Toggle visit list / visit form, get visits for job
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/user/jobVisits/" + job.id,
    success: function(data) {
      $("#create_visit").hide();
      $("#visit_list").show();
      $('#create_job_button').hide();
      $('#update_job_button').show();
      $('.visit_list').empty();
      $('.visit_list').append('<tr><th>Date</th><th>Start Time</th><th>End Time</th><th>Visit Type</th><th>Team</th></tr>');
      for (var i = 0; i < data.length; i++) {
        visitAppend(data[i]);
      }
    }
  })
}

function visitAppend(visit) {
  let start = new Date(parseInt(visit.start));
  let startTime = parseTime(visit.start);
  let endTime = parseTime(visit.end);
  $('.visit_list').append(
    `<tr>
      <td>${start.toDateString()}</td>
      <td>${startTime}</td>
      <td>${endTime}</td>
      <td>${visit.visit_type}</td>
      <td>${visit.team_id}</td>
    </tr>`);
}

////// Clear job form //////

$('#clear_job').click(function(){
  $('#create_job').find('input:text, select, textarea').val('');
  $('#create_job_button').text('Create Job');
  $("#create_visit").show();
  $("#visit_list").hide();
});

////// Clear visit form //////

$('#clear_visit').click(function(){
  $('#create_visit').find('input:text, select, textarea').val('');
});


////// Add visit //////

$('#addVisit').click(function() {
  $("#create_visit").show();
  $("#visit_list").hide();
});

$('#visitSubmit').click(function(event) {
  event.preventDefault();
  let data = {
    jobs_id: currentJob,
    visit_type: $('#visit_type').val(),
    date: $('#visit_date').val(),
    start: $('#visit_start').val(),
    end: $('#visit_end').val(),
    team_id: $('#visit_team').val(),
    notes: $('#visit_notes').val()
  };
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/postVisit",
    success: function(visit) {
      $("#create_visit").hide();
      $("#visit_list").show();
      visitAppend(visit);
    }
  });
});


////// Display search results //////

if (window.localStorage.search) {
  let id = JSON.parse(window.localStorage.search);
  getVisit(id);
  localStorage.removeItem('search');
}


$('#logout').click(function(event) {
  event.preventDefault;
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/user/logout"
  })
});
