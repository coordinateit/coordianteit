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
  console.log(search);
  getSearch(search);
});


function getSearch(search) {
  $.ajax({
    type: "POST",
    dataType: "json",
    data: {search: JSON.stringify(search)},
    url: "/user/search",
    success: function(data) {
      setMarkers(data);
    }
  })
}


////// Initialize map //////

var map;
var markers = [];
var position = JSON.parse(window.localStorage.position);
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
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

  });
}


////// Display jobs on map //////

function setMarkers(visits) {
  for (var i = 0; i < markers.length; i++) {  // Clear markers
    markers[i].setMap(null);
  }
  markers = [];
  for (var i = 0; i < visits.length; i++) {  // Set new markers
    let content = `<h5>${visits[i].customer_name}</h5>
                    <p>Job Type: ${visits[i].job_type}</p>
                    <p>Visit Type: ${visits[i].visit_type}</p>
                    <p>Team: ${visits[i].team_id}</p>
                    <a href="dashboard.html">View Visit</a>`
    let infowindow = new google.maps.InfoWindow({
      content: content
    });
    let marker = new google.maps.Marker({
      position: {lat: parseFloat(visits[i].lat), lng: parseFloat(visits[i].lng)},
      map: map,
      id: visits[i].id,
      title: visits[i].customer_name
    });
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
    marker.addListener('click', function() {
      window.localStorage.search = JSON.stringify(marker.id)
    });
    markers.push(marker);
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
