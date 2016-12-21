
////// Initialize map using customer position //////
var map;
function initMap() {
  var position = { lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) };
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
  });
  let marker = new google.maps.Marker({
    position: position,
    map: map,
  });
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

////// Create markers from an array of customers //////
var markers = [];
var infowindows = [];
function makeMarkers(customers) {
  for (var i = 0; i < markers.length; i++) {  // Clear markers
    markers[i].setMap(null);
  }
  for (var i = 0; i < customers.length; i++) {  // Set new markers
    let content = `<h4>${customers[i].customer_name}</h4>
                    <p>${customers[i].customer_type} </p>
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
          content += `<p>${data[i].visit_type}: ${start} - ${end}, ${date}</p>`
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
      window.localStorage.search = JSON.stringify({ id: marker.id, type: "visit" });
    });
    markers.push(marker);
  }
}






//! SOLUTION FOR USE IN DASHBOARD !//

// getJobs().then(function(data) {
//   console.log(data);
// })

////// Get jobs from server //////
// var currentDate = Date.now();
// function getJobs() {
//   return $.ajax({
//     type: 'POST',
//     data: { date: currentDate, team: 1 },
//     dataType: 'json',
//     url: '/user/jobs'
//   }).then(function(jobs) {
//     console.log(jobs);
//     return jobs;
//     // setMarkers(jobs);
//   });
// }
