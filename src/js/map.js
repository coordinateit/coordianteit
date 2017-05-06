
////// Initialize map using customer position //////
var map;
var editMarker;
var position;
const default_position = { lat: 40.016733, lng: -105.281430 };
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    maxZoom: 18,
    fullscreenControl: true
  });
  mapReady();
}

////// Create marker from position //////
function makeMarker(position, no_address) {
  let image;
  if (no_address) {
    image = "/../img/question_mark.png";
  } else {
    image = "/../img/focus-marker.png"
  }
  editMarker = new google.maps.Marker({
    position: position,
    map: map,
    icon: image
  });
}

////// Get customers by date range, with option for team filter //////
function getCustomersDateTeam(start, end, radius, teams) {
  let url, data;
  if (teams) {
    data = { start: start, end: end, radius: radius, teams: JSON.stringify(teams) };
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
    if (window.customer && !customers.error) {
      makeMarkers(customers.filter(function(localCustomer) {
        return localCustomer.id !== customer.id;
      }), customer);
    } else if (!customers.error) {
      makeMarkers(customers);
    } else {
      for (var i = 0; i < markers.length; i++) {  // Clear markers
        markers[i].setMap(null);
      }
    }
  });
}

////// Create markers from an array of customers //////
var markers = [];
var infowindows = [];
function makeMarkers(customers, currentCustomer) {
  let bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {  // Clear markers
    markers[i].setMap(null);
  }
  for (var i = 0; i < customers.length; i++) {  // Set new markers
    let customer = customers[i];
    let content = `<h4>${customer.customer_name}</h4>
                    <p>${customer.address}, ${customer.city}</p>
                    <p>${customer.customer_type}</p>
                    <a href='/edit/${customer.id}'>View Customer</a>
                    <br><br>
                    <h5>Visits:</h5>
                    <table class='info-window'>`
    let infowindow;
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "/user/jobVisits/" + customer.id,
      success: function(data) {
        // Filter out vendor visits before today
        if (customer.is_vendor) {
          let date = new Date();
          date.setHours(0);
          data = data.filter(function(visit) {
            return (parseInt(visit.start) > date);
          });
        }
        for (var i = 0; i < data.length; i++) {
          let start = parseTime(data[i].start);
          let end = parseTime(data[i].end);
          let date = parseDate(data[i].start);
          content += `<tr><td><a href="/edit_visit/${data[i].id}">${date}</a></td><td>${start}</td><td> ${data[i].visit_type}</td><td>${data[i].team_name}</td></tr>`
          if (i == data.length - 1){
            content += "</table>";
          }
        }
        infowindow = new google.maps.InfoWindow({
          content: content
        });
        infowindows.push(infowindow);
      }
    });
    let position = { lat: parseFloat(customers[i].lat), lng: parseFloat(customers[i].lng) };
    bounds.extend(position);
    let marker = new google.maps.Marker({
      position: position,
      map: map,
      id: customers[i].id,
      title: customers[i].customer_name,
    });
    marker.addListener('click', function() {
      for (var i = 0; i < infowindows.length; i++) {
        infowindows[i].close();
      }
      infowindow.open(map, marker);
    });
    markers.push(marker);
  }
  if (currentCustomer) {
    bounds.extend({ lat: parseFloat(currentCustomer.lat), lng: parseFloat(currentCustomer.lng) });
  }
  if (!customers.length) {
    bounds.extend(position);
  }
  map.fitBounds(bounds);
}
