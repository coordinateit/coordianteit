// INITIALIZE MAP ON CURRENT POSITION
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

// GET JOBS FROM SERVER
function getJobs(bounds) {
  $.ajax({
    type: 'POST',
    data: {bounds: JSON.stringify(bounds)},
    dataType: 'json',
    url: '/user/jobs'
  }).then(function(jobs) {
    console.log(jobs);
    setMarkers(jobs);
  });
}

// DISPLAY JOBS ON MAP
function setMarkers(jobs) {
  // CLEAR MARKERS
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  // SET NEW MARKERS
  for (var i = 0; i < jobs.length; i++) {
    var marker = new google.maps.Marker({
      position: {lat: parseFloat(jobs[i].lat), lng: parseFloat(jobs[i].lng)},
      map: map,
      label: String.fromCharCode(jobs[i].id + 64),
      title: jobs[i].customer_name
    });
    markers.push(marker);
  }
}
