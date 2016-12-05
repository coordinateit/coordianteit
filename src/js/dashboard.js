"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function(){
  getListData();
  getTeamList();
  initCalendar();
  getVisits();
  $('#calendar').fullCalendar('refetchEvents');
});


////// Calendar / Create Switch ///////
$(".switch_calendar_job").change(function() {
  var userinput = $(this);
  if (userinput.prop("checked")){
    $("#calendar").show();
    $('#calendar').fullCalendar('refetchEvents');
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
var infowindows = [];
var lookupMarker;
var newJobMarker;
var bounds;
var currentDate = Date.now();
var position = JSON.parse(window.localStorage.position);
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
  });
  map.addListener('tilesloaded', function() {
    bounds = map.getBounds();
    getJobs();
  });
}


////// Get jobs from server //////
function getJobs() {
  $.ajax({
    type: 'POST',
    data: {bounds: JSON.stringify(bounds), date: currentDate, team: teamFilter},
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
    let content = `<h4>${jobs[i].customer_name}</h4>
                    <p>${jobs[i].job_type} </p>
                    <a href="dashboard.html">View / Edit</a>
                    <br><br>
                    <h5>Visits:</h5>`
    let infowindow;
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "/user/jobVisits/" + jobs[i].jobs_id,
      success: function(data) {
        for (var i = 0; i < data.length; i++) {
          let start = parseTime(data[i].start);
          let end = parseTime(data[i].end);
          let date = parseDate(data[i].start);
          content += `<p>${data[i].visit_type}: ${start} - ${end}, ${date}</p>`
        }
        infowindow = new google.maps.InfoWindow({
          content: content
        });
        infowindows.push(infowindow);
      }
    });
    let marker = new google.maps.Marker({
      position: {lat: parseFloat(jobs[i].lat), lng: parseFloat(jobs[i].lng)},
      map: map,
      id: jobs[i].id,
      title: jobs[i].customer_name
    });
    marker.addListener('click', function() {
      for (var i = 0; i < infowindows.length; i++) {
        infowindows[i].close();
      }
      infowindow.open(map, marker);
      window.localStorage.search = JSON.stringify({id: marker.id, type: "visit"});
    });
    markers.push(marker);
  }
}


////// Displays job location //////
$('#job_lookup').click(function() {
  let address = $('#address').val();
  let city = $('#city').val();
  let state = $('#state').val();
  let zip = $('#zip').val();
  if (address && city && state && zip) {
    let data = {address: address, city: city, state: state, zip: zip}
    $.ajax({
      type: "POST",
      datatype: "json",
      data: data,
      url: "/user/geocode",
      success: function(coords) {
        let image = "../img/focus-marker.png"
        lookupMarker = new google.maps.Marker({
          position: coords,
          map: map,
          icon: image,
          title: "New job",
          animation: google.maps.Animation.DROP
        });
        map.panTo(coords);
      }
    })
  }
});


////// Displays visit time //////
$('#visit_lookup').click(function() {
  let date = new Date($('#visit_date').val());
  currentDate = date.getTime();
  currentDate -= 345600000;
  getJobs();
});



////////////////////////////////////////////////////////////////////////////////
//                                    LIST                                    //
////////////////////////////////////////////////////////////////////////////////


////// Get list data from server ///////
function getListData() {
  var date = new Date(parseInt(Date.now()));
  var start = date.setHours(0,0,0,0);
  var end = date.setHours(24,0,0,0);
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: {team: teamFilter, start: start, end: end},
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


////// Set time to 1:00 pm format //////
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


////// Set date to Sat, Oct 10 format //////
function parseDate(input) {
  let date = new Date(parseInt(input));
  let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate().toString();
}


////////////////////////////////////////////////////////////////////////////////
//                                    FORM                                    //
////////////////////////////////////////////////////////////////////////////////


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


////// Post job //////
$('#create_job_button').click(function() {
  let data = {
    customer_name: $('#customer_name').val(),
    email: $('#email').val(),
    phone_1: $('#phone_1').val(),
    phone_2: $('#phone_2').val(),
    address: $('#address').val(),
    city: $('#city').val(),
    state: $('#state').val(),
    zip: $('#zip').val(),
    job_type: $('#job_type').val(),
    notes: $('#notes').val()
  }
  console.log(data);
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/postJob",
    success: function(data) {
      console.log(data);
      showJob(data);
      $('#create_job_button').hide();
      $('#update_job_button').show();
      newJobMarker = new google.maps.Marker({
        position: {lat: parseFloat(data.lat), lng: parseFloat(data.lng)},
        map: map,
        title: data.customer_name,
        animation: google.maps.Animation.DROP
      });
      if (lookupMarker) {
        lookupMarker.setMap(null);
      }
    }
  });
});


////// Update job //////
function updateJobListen(jobId) {
  $('#update_job_button').click(function() {
    let data = {
      id: jobId,
      customer_name: $('#customer_name').val(),
      email: $('#email').val(),
      phone_1: $('#phone_1').val(),
      phone_2: $('#phone_2').val(),
      address: $('#address').val(),
      city: $('#city').val(),
      state: $('#state').val(),
      zip: $('#zip').val(),
      job_type: $('#job_type').val(),
      notes: $('#notes').val()
    }
    $.ajax({
      type: "POST",
      dataType: "json",
      data: data,
      url: "/user/updateJob",
      success: function(data) {
        showJob(data);
      }
    });
  });
}


////// Show job in form //////
var currentJob;
function showJob(job) {
  // Toggle calendar / job form
  $("#calendar").hide();
  $("#create_form").show();
  $(".switch_calendar_job").prop("checked", false);
  // Populate job form
  $('#customer_name').val(job.customer_name);
  $('#email').val(job.email);
  $('#phone_1').val(job.phone_1);
  $('#phone_2').val(job.phone_2);
  $('#address').val(job.address);
  $('#city').val(job.city);
  let state = document.getElementById('state');
  state.value = job.state;
  $('#zip').val(job.zip);
  $('#job_type').val(job.job_type);
  $('#notes').val(job.notes);
  let coords = {lat: parseFloat(job.lat), lng: parseFloat(job.lng)};
  map.panTo(coords);
  if (job.jobs_id) {
    getJobVisits(job.jobs_id);
    currentJob = job.jobs_id;
  } else {
    getJobVisits(job.id);
    currentJob = job.id;
  }
}


$('#visitSubmit').click(function() {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let end = $('#visit_end').val();
  let newEnd = Date.parse(date + ', ' + end);
  let data = {
    jobs_id: currentJob,
    visit_type: $('#visit_type').val(),
    start: newStart,
    end: newEnd,
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
      getListData();
      clearVisit();
      currentDate = Date.now();
      getJobs();
      $('#calendar').fullCalendar('refetchEvents');
    }
  });
});


function getJobVisits(jobId) {
  // Toggle visit list / visit form, get visits for job
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/user/jobVisits/" + jobId,
    success: function(data) {
      $('#create_visit').hide();
      $('#visit_list').show();
      $('#create_job_button').hide();
      $('#update_job_button').show();
      $('.visit_list').empty();
      $('.visit_list').append('<tr><th>Date</th><th>Start Time</th><th>End Time</th><th>Visit Type</th><th>Team</th><th></th><th></th></tr>');
      for (var i = 0; i < data.length; i++) {
        visitAppend(data[i]);
      }
      visitEditListen();
      updateJobListen(jobId);
    }
  })
}


function visitAppend(visit) {
  let date = parseDate(visit.start);
  let startTime = parseTime(visit.start);
  let endTime = parseTime(visit.end);
  $('.visit_list').append(
    `<tr>
      <td>${date}</td>
      <td>${startTime}</td>
      <td>${endTime}</td>
      <td>${visit.visit_type}</td>
      <td>${visit.team_id}</td>
      <td><button type="button" id="${visit.id}" class="btn btn-primary btn-xs visitEdit">Edit</button></td>
      <td><a href="/user/deleteVisit/${visit.id}"><button type="button" id="visitDelete" class="btn btn-danger btn-xs">Delete</button></a></td>
    </tr>`
  );
  visitEditListen();
}


////// Listen for visit edit click //////
function visitEditListen() {
  $('.visitEdit').click(function(event) {
    editVisit(parseInt(event.target.id));
  });
}


////// Send for visit //////
function editVisit(id) {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/user/visit/" + id,
    success: function(data) {
      showVisit(data);
    }
  })
}


////// Show visit in visit form //////
function showVisit(visit) {
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
  $('#visit_type').val(visit.visit_type);
  $('#visit_notes').val(visit.notes);
  $('#visit_date').val(date);
  $('#visit_start').val(startTime);
  $('#visit_end').val(endTime);
  let team = document.getElementById('visit_team');
  team.value = visit.team_id;
  $("#create_visit").show();
  $("#visit_list").hide();
  $("#saveVisitSubmit").show();
  $("#visitSubmit").hide();

  $('#saveVisitSubmit').click(function() {
    let date = $('#visit_date').val();
    let start = $('#visit_start').val();
    let newStart = Date.parse(date + ', ' + start);
    let end = $('#visit_end').val();
    let newEnd = Date.parse(date + ', ' + end);
    let data = {
      id: visit.id,
      visit_type: $('#visit_type').val(),
      start: newStart,
      end: newEnd,
      team_id: $('#visit_team').val(),
      notes: $('#visit_notes').val()
    };
    $.ajax({
      type: "POST",
      dataType: "json",
      data: data,
      url: "/user/updateVisit",
      success: function(jobId) {
        $("#create_visit").hide();
        $("#visit_list").show();
        currentDate = Date.now();
        getJobs();
        getJobVisits(jobId[0]);
        clearVisit();
        $('#calendar').fullCalendar('refetchEvents');
      }
    });
  });
}


////// Clear job form //////
$('#clear_job').click(function(){
  $('#create_job').find('input:text, select, textarea').val('');
  $('#create_job_button').show();
  $('#update_job_button').hide();
  $("#create_visit").show();
  $("#visit_list").hide();
  if (lookupMarker) {
    lookupMarker.setMap(null);
  }
});


////// Clear visit form //////
$('#clear_visit').click(function(){
  clearVisit();
});

function clearVisit() {
  $('#create_visit').find('input:text, select, textarea').val('');
  $('#visit_date').val(null);
  $('#visit_start').val(null);
  $('#visit_end').val(null);
  $("#saveVisitSubmit").hide();
  $("#visitSubmit").show();
  $("#create_visit").hide();
  $("#visit_list").show();
}


////// Add visit //////
$('#addVisit').click(function() {
  $("#create_visit").show();
  $("#visit_list").hide();
});


////// Display search results //////
if (window.localStorage.search) {
  let search = JSON.parse(window.localStorage.search);
  if (search.type === "visit") {
    getVisit(search.id);
  } else if (search.type === "job") {
    getJob(search.id);
  }
  localStorage.removeItem('search');
}


$('#logout').click(function(event) {
  event.preventDefault;
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/user/logout",
    success: function() {
      window.location = "/";
    }
  })
});
