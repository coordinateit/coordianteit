"use strict";

$(document).ready(function() {
  getTeamList();
});

/////// Toggle map / list //////
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

////// Toggle basic / advanced //////
$(".switch_basic_advanced").change(function() {
  var userinput = $(this);
  if (userinput.prop("checked")){
    $("#basic").show();
    $("#advanced").hide();
  } else {
    $("#basic").hide();
    $("#advanced").show();
  }
});


////// Send search parameters to server //////
$('#searchSubmit').click(function(event) {
  event.preventDefault();
  let search = {};
  if ($('#customer').val()) {
    search.customer_name = $('#customer').val();
  }
  if ($('#po').val()) {
    search.po = $('#po').val();
  }
  if ($('#priority').val()) {
    search.priority = $('#priority').val();
  }
  if ($('#team').val()) {
    search.team_id = $('#team').val();
  }
  if ($('#from').val()) {
    search.from = $('#from').val();
  }
  if ($('#to').val()) {
    search.to = $('#to').val();
  }
  if ($('#address').val()) {
    search.address = $('#address').val();
  }
  if ($('#city').val()) {
    search.city = $('#city').val();
  }
  if ($('#state').val()) {
    search.state = $('#state').val();
  }
  if ($('#zip').val()) {
    search.zip = $('#zip').val();
  }
  if ($('#radius').val()) {
    search.radius = $('#radius').val();
  }
  if ($('#notes').val()) {
    search.notes = $('#notes').val();
  }
  getSearch(search);
});


////// Query database for search items //////
function getSearch(search) {
  $.ajax({
    type: "POST",
    dataType: "json",
    data: {search: JSON.stringify(search)},
    url: "/user/search",
    success: function(data) {
      setMarkers(data);
      visitList(data);
      setIdArray(data);
    }
  })
}


////// Make an array of ids for list view //////
function setIdArray(data) {
  var listIds = data.data.map(function(i) {
    return i.id;
  })
  window.localStorage.list = JSON.stringify(listIds);
};


////// Initialize map //////
var map;
var markers = [];
var infowindows = [];
var position = JSON.parse(window.localStorage.position);
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
  });
}


////// Display jobs on map //////
function setMarkers(data) {
  let coords = {lat: parseFloat(data.data[0].lat), lng: parseFloat(data.data[0].lng)};
  map.panTo(coords);
  for (var i = 0; i < markers.length; i++) {  // Clear markers
    markers[i].setMap(null);
  }
  markers = [];
  for (var i = 0; i < data.data.length; i++) {  // Set new markers
    let content = `<h5>${data.data[i].customer_name}</h5>
                    <p>Job Type: ${data.data[i].job_type}</p>
                    <p>Visit Type: ${data.data[i].visit_type}</p>
                    <p>Team: ${data.data[i].team_id}</p>
                    <a href="dashboard.html">View Job/Visits</a>`
    let infowindow = new google.maps.InfoWindow({
      content: content
    });
    let marker = new google.maps.Marker({
      position: {lat: parseFloat(data.data[i].lat), lng: parseFloat(data.data[i].lng)},
      map: map,
      id: data.data[i].id,
      title: data.data[i].customer_name
    });
    marker.addListener('click', function() {
      for (var i = 0; i < infowindows.length; i++) {
        infowindows[i].close();
      }
      infowindow.open(map, marker);
      window.localStorage.search = JSON.stringify({id: marker.id, type: data.type});
    });
    markers.push(marker);
    infowindows.push(infowindow);
  }
}


///// Get team data from server ///////
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
    $('#team').append(`<option value=${teams[i].id}>${teams[i].team_name}</option>`);
  }
}


////// Add data to list ///////
function visitList(data) {
  $(".list").empty();
  $(".list").append("<tr><th>Team</th><th>Start Time</th><th>Job Type</th><th>Address</th><th>Phone</th></tr>");
  for (var i = 0; i < data.data.length; i++) {
    let date = new Date(parseInt(data.data[i].start));
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
    $(".list").append("<tr><td>" + data.data[i].team_id + "</td><td>" + time +
                        "</td><td>" + data.data[i].job_type + "</td><td>" + data.data[i].address +
                        "</td><td>" + data.data[i].phone_number + "</td></tr>"
                      );
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
  return time = hours + ":" + minutes + " " + meridiem;
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
