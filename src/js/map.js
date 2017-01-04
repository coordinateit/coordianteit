
////// Initialize map using customer position //////
var map;
var editMarker;
var position;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
  });
  mapReady();
}

////// Create marker from position //////
function makeMarker(position) {
  let image = "../img/focus-marker.png"
  editMarker = new google.maps.Marker({
    position: position,
    map: map,
    icon: image
  });
}

////// Get customers by date range, with option for team filter //////
function getCustomersDateTeam(start, end, teams) {
  let url, data;
  if (teams) {
    data = { start: start, end: end, teams: JSON.stringify(teams) };
    url = '/user/customersByDatesAndTeams';
  } else {
    data = { start: start, end: end };
    url = '/user/customersByDates';
  }
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: data,
    url: url
  }).then(function(customers) {
    makeMarkers(customers);
  });
}

////// Create markers from an array of customers //////
var markers = [];
var infowindows = [];
function makeMarkers(customers) {
  for (var i = 0; i < markers.length; i++) {  // Clear markers
    markers[i].setMap(null);
  }
  for (var i = 0; i < customers.length; i++) {  // Set new markers
    let content = `<h4>${customers[i].customer_name}</h4>
                    <p>${customers[i].address}, ${customers[i].city}</p>
                    <p>${customers[i].customer_type}</p>
                    <a href='/edit/${customers[i].id}'>View Customer</a>
                    <br><br>
                    <h5>Visits:</h5>`
    let infowindow;
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "/user/jobVisits/" + customers[i].id,
      success: function(data) {
        for (var i = 0; i < data.length; i++) {
          let start = parseTime(data[i].start);
          let end = parseTime(data[i].end);
          let date = parseDate(data[i].start);
          content += `<p>${data[i].visit_type}: ${start} - ${end}, ${date} -- ${data[i].team_name}</p>`
        }
        infowindow = new google.maps.InfoWindow({
          content: content
        });
        infowindows.push(infowindow);
      }
    });
    let marker = new google.maps.Marker({
      position: { lat: parseFloat(customers[i].lat), lng: parseFloat(customers[i].lng) },
      map: map,
      id: customers[i].id,
      title: customers[i].customer_name
    });
    marker.addListener('click', function() {
      for (var i = 0; i < infowindows.length; i++) {
        infowindows[i].close();
      }
      infowindow.open(map, marker);
    });
    markers.push(marker);
  }
}
