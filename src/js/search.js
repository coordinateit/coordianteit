"use strict";

$(document).ready(function() {
  getTeamList();
  getList();
});

var position = JSON.parse(window.localStorage.position);

////// Code to execute when map loads //////
function mapReady() {} // Must exist even if empty

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
var list;
function getList() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/search/allCustomersVisits",
    // success: function(data) {
  }).then(function(data) {
    makeMarkers(data);
    visitList(data);
    list = data;
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



////////////////////////////////////////////////////////////////////////////////
//                                  SEARCH                                    //
////////////////////////////////////////////////////////////////////////////////


$('#searchSubmit').click(function(event) {
  event.preventDefault();
  if ($('#error')) {
    $('#error').remove();
  }
  searchCustomers();
});

////// Search by customer //////
function searchCustomers() {
  if ($('#customer').val()) {
    let customerName = $('#customer').val().toLowerCase();
    let newList = list.filter(function(item) {
      return item.customer_name.toLowerCase().includes(customerName);
    });
    searchTeam(newList);
  } else {
    searchTeam(list);
  }
}

////// Search by team //////
function searchTeam(list) { // List is now local, any error from above functions and it will default to the global list
  if ($('#team').val()) {
    let team = parseInt($('#team').val());
    let newList = list.filter(function(item) {
      return item.team_id === team;
    });
    searchRadius(newList);
  } else {
    searchRadius(list);
  }
}

////// Search by radius/coordinates (skip address fields) //////
function searchRadius(list) {
  if ($('#radius').val()) {
    let address = {
      address: $('#address').val(),
      city: $('#city').val(),
      state: $('#state').val(),
      zip: $('#zip').val()
    }
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: address,
      url: '/search/geocode'
    }).then(function(data) {
      if (data.error) {
        $('#advanced').prepend(`<h3 id="error" style="color: red">${data.error}</h3>`)
      } else {
        compareCoordinates(data.lat, data.lng);
      }
    });
    function compareCoordinates(lat, lng) {
      let radius = $('#radius').val();
      let newList = list.filter(function(item) {
        return (
                (parseFloat(item.lat) < lat + radius/200) &&
                (parseFloat(item.lat) > lat - radius/200) &&
                (parseFloat(item.lng) < lng + radius/200) &&
                (parseFloat(item.lng) > lng - radius/200)
              );
      });
      searchPhone(newList);
    }
  } else {
    searchAddress(list);
  }
}

////// Search by address //////
function searchAddress(list) {
  if ($('#address').val()) {
    let address = $('#address').val().toLowerCase();
    let newList = list.filter(function(item) {
      return item.address.toLowerCase().includes(address);
    });
    searchCity(newList);
  } else {
    searchCity(list);
  }
}

////// Search by city //////
function searchCity(list) {
  if ($('#city').val()) {
    let city = $('#city').val().toLowerCase();
    let newList = list.filter(function(item) {
      return item.city.toLowerCase().includes(city);
    });
    searchState(newList);
  } else {
    searchState(list);
  }
}

////// Search by state //////
function searchState(list) {
  if ($('#state').val()) {
    let state = $('#state').val();
    let newList = list.filter(function(item) {
      return item.state === state;
    });
    searchZip(newList);
  } else {
    searchZip(list);
  }
}

////// Search by zip //////
function searchZip(list) {
  if ($('#zip').val()) {
    let zip = parseInt($('#zip').val());
    let newList = list.filter(function(item) {
      return item.zip === zip;
    });
    searchPhone(newList);
  } else {
    searchPhone(list);
  }
}

////// Search by phone //////
function searchPhone(list) {
  if ($('#phone').val()) {
    let phone = $('#phone').val().toLowerCase();
    let newList = list.filter(function(item) {
      return item.phone_1.toLowerCase().includes(phone);
    });
    searchFrom(newList);
  } else {
    searchFrom(list);
  }
}

////// Search by date range //////
function searchFrom(list) {
  if ($('#from').val()) {
    let from = Date.parse($('#from').val());
    from += 25200000
    let newList = list.filter(function(item) {
      return parseInt(item.start) > from;
    });
    searchTo(newList);
  } else {
    searchTo(list);
  }
}

////// Search by date range //////
function searchTo(list) {
  if ($('#to').val()) {
    let to = Date.parse($('#to').val());
    to += 111600000
    let newList = list.filter(function(item) {
      return parseInt(item.start) < to;
    });
    displayResults(newList);
  } else {
    displayResults(list);
  }
}

/////// Update map/list to show results of search //////
function displayResults(list) {
  makeMarkers(list);
  visitList(list);
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
    $(".advancedDiv").hide();
  } else {
    $(".advancedDiv").show();
  }
});










////// Send search parameters to server //////
$('#').click(function(event) {
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
