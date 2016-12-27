"use strict";

$(document).ready(function() {
  getTeamList();
  getList();
});

var position = JSON.parse(window.localStorage.position);

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

//////  //////
function mapReady() {

}



////////////////////////////////////////////////////////////////////////////////
//                                  SEARCH                                    //
////////////////////////////////////////////////////////////////////////////////


function getList() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/search/allCustomersVisits",
    // success: function(data) {
  }).then(function(data) {
    console.log(data);
    makeMarkers(data);
    visitList(data);
  });
}

////// Add data to list ///////
function visitList(data) {
  $(".list").empty();
  $(".list").append("<tr><th>Customer</th><th>Team</th><th>Start Time</th><th>Job Type</th><th>Address</th><th>Phone</th></tr>");
  for (var i = 0; i < data.length; i++) {
    let time = parseTime(data[i].start);
    $(".list").append(`<tr><td>${data[i].customer_name}
                        <td>${data[i].team_id}</td>
                        <td>${time}</td>
                        <td>${data[i].customer_type}</td>
                        <td>${data[i].address}</td>
                        <td>${data[i].phone_1}</td></tr>`
                      );
  }
}

function searchAndSortAllOfTheThings() {
  console.log("DOOO IIIIIIIT!!!");
}



////////////////////////////////////////////////////////////////////////////////
//                                  SWITCHES                                  //
////////////////////////////////////////////////////////////////////////////////


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
    data: { search: JSON.stringify(search) },
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
  var listIds = data.map(function(i) {
    return i.id;
  })
  window.localStorage.list = JSON.stringify(listIds);
};


////// Initialize map //////
// var map;
// var markers = [];
// var infowindows = [];
// var position = JSON.parse(window.localStorage.position);
// function initMap() {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: position,
//     zoom: 11,
//     fullscreenControl: true
//   });
// }


////// Display jobs on map //////
// function setMarkers(data) {
//   let coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lng) };
//   for (var i = 0; i < markers.length; i++) {  // Clear markers
//     markers[i].setMap(null);
//   }
//   markers = [];
//   for (var i = 0; i < data.length; i++) {  // Set new markers
//     let content = `<h5>${data[i].customer_name}</h5>
//                     <p>Job Type: ${data[i].customer_type}</p>
//                     <p>Visit Type: ${data[i].visit_type}</p>
//                     <p>Team: ${data[i].team_id}</p>
//                     <a href="dashboard.html">View Job/Visits</a>`
//     let infowindow = new google.maps.InfoWindow({
//       content: content
//     });
//     let marker = new google.maps.Marker({
//       position: { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lng) },
//       map: map,
//       id: data[i].id,
//       title: data[i].customer_name
//     });
//     marker.addListener('click', function() {
//       for (var i = 0; i < infowindows.length; i++) {
//         infowindows[i].close();
//       }
//       infowindow.open(map, marker);
//       // window.localStorage.search = JSON.stringify({id: marker.id, type: type});
//     });
//     markers.push(marker);
//     infowindows.push(infowindow);
//   }
// }
