// INITIALIZE MAP ON CURRENT POSITION
var map;
var position = JSON.parse(window.localStorage.position);
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 10
  });
}

// GET JOBS FROM SERVER
$(document).ready(function() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/jobsAll'
  }).then(function(jobs) {
    setMarkers(jobs);
  });
});

// DISPLAY JOBS ON MAP
function setMarkers(jobs) {
  for (var i = 0; i < jobs.length; i++) {
    var marker = new google.maps.Marker({
      position: {lat: parseFloat(jobs[i].lat), lng: parseFloat(jobs[i].lng)},
      map: map
    });
  }
}
