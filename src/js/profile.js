"use strict";

////// Check credentials when page loads //////
$(document).ready(function(){
  authorize();
  getUsers();
  getTeamList();
  getListData();
});

////// Check for admin access and redirect //////
function authorize() {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/user/authorize",
    success: function(data) {
      if (data && window.location.pathname === "/admin") {
        return;
      } else if (data) {
        window.location = "/admin"
      } else {
        $(".credentials").show();
      }
    }
  })
}



////////////////////////////////////////////////////////////////////////////////
//                                    USERS                                   //
////////////////////////////////////////////////////////////////////////////////


////// Get all users //////
function getUsers() {
  $('#allUsers').empty();
  $('#allUsers').append('<tr><th>Name</th><th>E-mail</th><th>Phone</th><th>Admin</th><th></th><th></th></tr>');
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/admin/users",
    success: function(data) {
      for (var i = 0; i < data.length; i++) {
        $('#allUsers').append(`<tr><td>${data[i].name}</td><td>${data[i].email}</td><td>${data[i].phone || ''}</td><td>${data[i].isadmin}</td><td><button type="button" id="${data[i].id}edit" class="btn btn-primary btn-xs userEdit">Edit</button></td><td><button type="button" id="${data[i].id}delete" class="btn btn-danger btn-xs userDelete">Delete</button></td></tr>`)
      }
      userEditListen();
      userDeleteListen();
    }
  })
}

////// Listen for edit user click //////
function userEditListen() {
  $('.userEdit').click(function() {
    let userId = parseInt(event.target.id.split().pop());
    getUser(userId);
  })
}

////// Get user from database //////
function getUser(id) {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/admin/user/" + id,
    success: function(data) {
      showUser(data);
    }
  });
}

////// Listen for delete user click //////
function userDeleteListen() {
  $('.userDelete').click(function() {
    let userId = parseInt(event.target.id.split().pop());
    deleteUser(userId);
  });
}

////// Delete user from database //////
function deleteUser(userId) {
  if (window.confirm("Are you sure you want to delete this user?")) {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/admin/deleteUser/' + userId
    }).then(function() {
      window.location = '/admin';
    });
  }
}

////// Populate user form //////
function showUser(user) {
  $('#user_name').val(user.name);
  $('#user_phone').val(user.phone);
  $('#user_email').val(user.email);
  let team = document.getElementById('user_team_id');
  team.value = user.team_id;
  let isadmin = document.getElementById('user_isadmin');
  isadmin.value = user.isadmin;
  $('#create_user').hide();
  $('#save_user').show();

  ////// Update user //////
  $('#save_user').click(function() {
    let data = {
      name: $('#user_name').val(),
      email: $('#user_email').val(),
      password: $('#user_password').val(),
      phone: $('#user_phone').val(),
      team_id: $('#user_team_id').val(),
      isadmin: $('#user_isadmin').val(),
    }
    $.ajax({
      type: "POST",
      datatype: "json",
      data: data,
      url: "/admin/updateUser/" + user.id,
      success: function() {
        window.location = '/admin';
      }
    })
  });
}



////////////////////////////////////////////////////////////////////////////////
//                                    TEAMS                                   //
////////////////////////////////////////////////////////////////////////////////


//////  //////
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

//////  //////
function teamList(teams) {
  for (var i = 0; i < teams.length; i++) {
    $('.teams').append(`<option value="${teams[i].id}">${teams[i].team_name}</option>`);
  };
}

////// Filter page by team //////
var teamFilter;
$('#teamselect').change(function(clicked) {
  teamFilter = $('#teamselect').find(":selected").val();
  getTeam();
});

//////  //////
function getTeam() {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/admin/team/" + teamFilter,
    success: function(data) {
      $('#team-name').val(data.team_name)
      $('#truck').val(data.vehicle)
      $('#submitTeam').hide();
      $('#saveTeam').show();
      $('#clearForm').show();
      getTeamMembers(data.id)
    }
  });
}

//////  //////
function getTeamMembers(team) {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/admin/teamMembers/" + team,
    success: function(data) {
      showTeamMembers(data);
    }
  });
}

//////  //////
function showTeamMembers(teamMembers) {
  $('#teamMembers').empty();
  $('#teamMembers').append('<tr><th>Name</th><th>Phone</th></tr>');
  for (var i = 0; i < teamMembers.length; i++) {
    $('#teamMembers').append(`<tr><td>${teamMembers[i].name}</td><td>${teamMembers[i].phone}</td></tr>`);
  }
}

//////  //////
$('#submitTeam').click(function(e) {
  e.preventDefault();
  let data = {
    team_name: $('#team-name').val(),
    vehicle: $('#truck').val()
  }
  console.log(data);
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: data,
    url: '/admin/postTeam'
  }).then(function(data) {
      window.location = '/admin';
  });
});

//////  //////
$('#saveTeam').click(function(e) {
  e.preventDefault();
  let data = {
    id: teamFilter,
    team_name: $('#team-name').val(),
    vehicle: $('#truck').val()
  }
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: data,
    url: '/admin/saveTeam'
  }).then(function() {
    window.location = '/admin';
  });
});

$('#clearForm').click(function() {
  $('#team-name').val(null);
  $('#truck').val(null);
  $('#submitTeam').show();
  $('#saveTeam').hide();
  $('#clearForm').hide();
  $('#team_error').empty();
});

$('#teamselect').on('change', function() {
  $('#team_error').empty();
});

$('#delete-team').click(function() {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/admin/deleteTeam/" + teamFilter,
    success: function(data) {
      if (data.error) {
        $('#team_error').empty();
        $('#team_error').append(`<h3 style="color: red">${data.error}</h3>`)
      } else {
        window.location = "/admin";
      }
    }
  });
});

//////  //////
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


function getListData() {
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: { team: teamFilter },
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
    $(".list").append("<tr><td>" + data[i].team_id + "</td><td>" + time + "</td><td>" + data[i].job_type + "</td><td>" + data[i].address + "</td><td>" + data[i].phone_1 + "</td></tr>");
  }
}
