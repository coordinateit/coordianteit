////// Check credentials when page loads //////

$(document).ready(function(){
  authenticate();
  getUsers();
  getTeamList();
  getListData()
});


////// Check for admin access and redirect //////

function authenticate() {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/user/authorize",
    success: function(data) {
      if (data && window.location.pathname === "/admin.html") {
        return;
      } else if (data) {
        window.location = "/admin.html"
      } else {
        $(".credentials").show();
      }
    }
  })
}


////// Get all users //////

function getUsers() {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/admin/users",
    success: function(data) {
      for (var i = 0; i < data.length; i++) {
        $('#teamMembers').append(`<tr><td>${data[i].name}</td><td>${data[i].phone_number}</td></tr>`)
        $('#allUsers').append(`<tr><td>${data[i].name}</td><td>${data[i].email}</td><td>${data[i].phone_number}</td><td>${data[i].isadmin}</td></tr>`)
      }
    }
  })
}



////// Profile Button Div Switch /////

$(".menu button").on("click", function(){
  var button_id = "." + $(this).attr("id");
  $(".credentials").hide();
  $(".team_management").hide();
  $(".user_management").hide();
  $(button_id).show();
});


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


function teamList(teams) {
  for (var i = 0; i < teams.length; i++) {
    $('#teams').append(`<option value=${teams[i].id}>${teams[i].team_name}</option>`);
  }
}


////// Filter page by team //////

var teamFilter;
$('#teams').change(function(clicked) {
  teamFilter = $('#teams').find(":selected").val();
  getJobs();
  getListData();
  getTeam();
});


function getTeam() {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/admin/team/" + teamFilter,
    success: function(data) {
      $('#truck').text(data.vehicle)
    }
  })
}


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
//                                    MAP                                     //
////////////////////////////////////////////////////////////////////////////////


function getListData() {
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: {team: teamFilter},
    url: '/user/list',
    success: function(data) {
      visitList(data);
    }
  });
}


////// Add data to list ///////

function visitList(data) {
  $(".list").empty();
  $(".list").append('<tr><th>Team</th><th>Start Time</th><th>Job Type</th><th>Address</th><th>Phone</th></tr>')
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
