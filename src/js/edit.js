"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function() {
  if (customer.is_vendor) {
    $('#is_vendor').attr('checked', true);
    filter_vendor_visits();
  }
  append_visits();
  let calendar_visits = map_calendar_visits();
  initCalendar();
  getTeamList();
  $('#search_date').val(new Date().toDateInputValue()); // Make today's date default
  $('#visit_date').val(new Date().toDateInputValue()); // Make today's date default
  $('#visit_start').val('12:00');
  $('#visit_end').val('13:00');
  $('#calendar').fullCalendar('addEventSource', calendar_visits);
  $(`#state option[value="${customer.state}"]`).attr("selected", "selected");
  $(`#customer_type option[value="${customer.customer_type}"]`).attr("selected", "selected");

});

////// Make today's date default with timezone support ///////
Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});

function teamsReady() {
  if (visit.id) {
    current_visit = visit.id;
    $(`#edit${current_visit}`).parent().parent().addClass('current_visit');
    showVisit(visit);
  }
}



////////////////////////////////////////////////////////////////////////////////
//                                    MAP                                     //
////////////////////////////////////////////////////////////////////////////////

////// Set position and marker to customer location //////
  if (!customer.address && !customer.city && !customer.zip) {
    position = default_position;
  } else {
    position = { lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) };
  }
  function mapReady() {
    let no_address;
    if (!customer.address && !customer.city && !customer.zip) {
      no_address = true;
    }
    makeMarker(position, no_address);
  }

// Use bounds variable to resize map when needed
  var bounds;

// Search visits by team/date/location
  function get_first_available() {
    $('#list_tab_button').tab('show');
    $('#first_available_list').empty();
    let date = $('#search_date').val();
    let start = Date.parse(date);
    let number_days = $('#number_days').val() || 1;
    let end = start + (number_days * 86400000); // Number of days * length of a day
    let teams = $('#team_filter').val();
    let radius = $('#visit_radius').val();
    let range = {};
    let lat = parseFloat(customer.lat);
    let lng = parseFloat(customer.lng);
    if (radius) {
      let r = radius / 29;
      range = { lat_hi: (lat + r/2), lat_lo: (lat - r/2), lng_hi: (lng + r/2), lng_lo: (lng - r/2) };
    }
    let search_params = { start: start, end: end, teams: JSON.stringify(teams), range: JSON.stringify(range) };
    let url = '/user/get_first_available';
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: search_params,
      url: url
    }).then(function(visits) {
      console.log(visits);
      // TODO: add radius
      visits.map(function(visit) {
        let x = Math.abs(lng - parseFloat(visit.lng));
        let y = Math.abs(lat - parseFloat(visit.lat));
        visit.coord_distance = Math.sqrt((x * x) + (y * y));
      });
      visits.sort(function(a, b) {
        return a.coord_distance - b.coord_distance;
      });
      let keys = [];
      let customers_arr = [];
      // Push unique instance of each customer id into keys array
      for (var i = 0; i < visits.length; i++) {
        if (!keys.includes(visits[i].id)) {
          keys.push(visits[i].id)
        }
      }
      console.log(keys);
      // For each in customer array, push all visits for that customer, then sort visits by time
      for (var i = 0; i < keys.length; i++) {
        let visits_arr = [];
        for (var j = 0; j < visits.length; j++) {
          if (visits[j].id === keys[i]) {
           visits_arr.push(visits[j])
          }
        }
        visits_arr.sort(function(a, b) {
         return a.start - b.start;
        });
        console.log(visits_arr);
        customers_arr.push(visits_arr);
      }
      if (customers_arr.length) {
        let search_date = parseDate(start);
        $('#first_available_list').append(`<h3>Showing within ${radius} miles of Customer Location</h3>`);
        // $('#first_available_list').append(`<h3>Searching visits within ${number_days} days of ${search_date} and within ${radius} miles.</h3>`);
        for (var h = 0; h < customers_arr.length; h++) {
          let visits_arr = customers_arr[h];
          let days = [];
          for (var i = 0; i < visits_arr.length; i++) {
            let date = new Date(parseInt(visits_arr[i].start));
            let start = date.setHours(0,0,0,0);
            let end = start + 86400000;
            let schedule = visits.filter(function(visit) {
              return visit.team_id === visits_arr[i].team_id && visit.start > start && visit.start < end;
            });
            let miles = (visits_arr[i].coord_distance * 56).toFixed(1);
            if (!days.includes(start)) {
              days.push(start);
              $('#first_available_list').append(`
                <li data-toggle="collapse" data-target="#first_available_visit_${i}${h}" class="collapsed">
                  <h4>${visits_arr[i].team_name} - ${miles} miles - ${parseDate(visits_arr[i].start)}</h4>
                  <ul class="sub-menu collapse" id="first_available_visit_${i}${h}">
                    <li>
                      <table id="first_available_table_${i}${h}" class="table table-striped">
                        <tr>
                          <th>Date</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Customer Name</th>
                          <th>Address</th>
                          <th>Visit Type</th>
                          <th>Crew</th>
                        </tr>
                      </table>
                    </li>
                  </ul>
                </li>`);
              for (var j = 0; j < schedule.length; j++) {
                let highlight = "";
                if (schedule[j].id === customers_arr[h][0].id) {
                  highlight = "highlight";
                }
                $(`#first_available_table_${i}${h}`).append(`
                  <tr class="${highlight}">
                    <td>${parseDate(schedule[j].start)}</td>
                    <td>${parseTime(schedule[j].start)}</td>
                    <td>${parseTime(schedule[j].end)}</td>
                    <td>${schedule[j].customer_name}</td>
                    <td>${schedule[j].address}, ${schedule[j].city}</td>
                    <td>${schedule[j].visit_type}</td>
                    <td>${schedule[j].crew}</td>
                  </tr>`);
              }
            }
          }
        }
      } else {
        $('#first_available_list').append('<h3>No Nearby Visits, Try Increasing Search Radius</h3>');
      }
      if (window.customer && !visits.error) {
        visits = visits.filter(function(localCustomer) {
          return localCustomer.id !== customer.id;
        });
        bounds = makeMarkers(visits, customer);
      } else if (!visits.error) {
        bounds = makeMarkers(visits);
      } else {
        for (var i = 0; i < markers.length; i++) {  // Clear markers
          markers[i].setMap(null);
        }
      }
    });
  }

  $('#map_tab').click(function() {
    setTimeout(function () {
      map.fitBounds(bounds);
    }, 10);
  });



////////////////////////////////////////////////////////////////////////////////
//                                    CUSTOMER                                //
////////////////////////////////////////////////////////////////////////////////


////// Update customer in database //////
$('#update_customer_button').click(function() {
  let data = {
    id: customer.id,
    isactive: $('#status').val() ? true : false,
    customer_name: $('#customer_name').val(),
    phone_1: $('#phone_1').val(),
    phone_2: $('#phone_2').val(),
    email: $('#email').val(),
    address: $('#address').val(),
    city: $('#city').val(),
    state: $('#state').val(),
    zip: $('#zip').val(),
    customer_type: $('#customer_type').val(),
    is_vendor: $('#is_vendor').prop('checked'),
    referral: $('#referral').val(),
    notes: $('#notes').val()
  }
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: data,
    url: '/user/updateCustomer',
    success: function(data) {
      if (data.error) {
        $('#create_form').prepend(`<h3 style="color: red">${data.error}</h3>`)
      } else {
        window.location.reload(true);
      }
    }
  });
});



////////////////////////////////////////////////////////////////////////////////
//                                    SEARCH                                  //
////////////////////////////////////////////////////////////////////////////////


////// When Nearby Customers is clicked //////
$('#nearbyVisits').click(function() {
  getNearbyVisits();
});

////// When Check Team Schedule is clicked //////
$('#check_team_schedule').click(function() {
  $('#map_tab').tab('show');
  let date = new Date($('#visit_date').val());
  let start = date.getTime();
  let end = start + 86400000; // + 24 hours
  let team = [$('#visit_team').val()];
  let team_name = $(`#visit_team option[value='${team[0]}']`).text();
  $('#map_message').empty();
  $('#map_message').append(`<h3>Showing schedule for ${team_name} on ${parseDate(start)}</h3>`);
  getCustomersDateTeam(start, end, team)
});

$('#get_first_available').click(function() {
  get_first_available();
});



////////////////////////////////////////////////////////////////////////////////
//                                    VISITS                                  //
////////////////////////////////////////////////////////////////////////////////

var current_visit;
////// Show visit in visit form //////
function showVisit(visit) {
  let start = new Date(parseInt(visit.start));
  let end = new Date(parseInt(visit.end));
  let date = htmlDate(start);
  let startTime = htmlTime(start);
  let endTime = htmlTime(end);
  $('#visit_date').val(date);
  $('#visit_start').val(startTime);
  $('#visit_end').val(endTime);
  $('#visit_type').val(visit.visit_type);
  $('#visit_team').val(visit.team_id);
  $('#visit_notes').val(visit.notes);
  $('#visit_crew').val(visit.crew);
  $("#visit_save").show();
  $("#visit_submit").hide();
  $('#edit_message').empty();
}

function duplicateVisit(visit) {
  let start = parseInt(visit.start);
  let newStart = new Date(start + 86400000);
  let end = new Date(parseInt(visit.end));
  let date = htmlDate(newStart);
  let startTime = htmlTime(newStart);
  let endTime = htmlTime(end);
  $('#visit_date').val(date);
  $('#visit_start').val(startTime);
  $('#visit_end').val(endTime);
  $('#visit_type').val(visit.visit_type);
  let team = document.getElementById('visit_team');
  team.value = visit.team_id;
  $('#visit_notes').val(visit.notes);
  $('#visit_crew').val(visit.crew);
  // $("#create_visit").show();
  $('#visit_submit').text('Confirm Duplicate');
  $("#visit_save").hide();
  $("#visit_submit").show();
  $('#edit_message').empty();
  $('#edit_message').append(`<h3>Creating duplicate of ${parseDate(start)}</h3>`);
}


$('#visit_save').click(function() {
  saveVisit(current_visit);
});

function filter_vendor_visits() {
  let date = new Date();
  date.setHours(0);
  visits = visits.filter(function(visit) {
    return parseInt(visit.start) > date;
  });
}

////// Display visit list //////
function append_visits() {
  for (var i = 0; i < visits.length; i++) {
    let date = parseDate(parseInt(visits[i].start));
    let start = parseTime(parseInt(visits[i].start));
    let end = parseTime(parseInt(visits[i].end));
    $('.visit_list').append(`<tr>
      <td>${date}</td>
      <td>${start}</td>
      <td>${end}</td>
      <td>${visits[i].visit_type}</td>
      <td>${visits[i].team_name}</td>
      <td><button type="button" id="edit${visits[i].id}" class="btn btn-primary btn-xs visitEdit">Edit</button></td>
      <td><button type="button" id="duplicate${visits[i].id}" class="btn btn-info btn-xs visitDuplicate">Duplicate</button></td>
      <td><button type="button" id="delete${visits[i].id}" class="btn btn-danger btn-xs visitDelete">Delete</button></td>
    </tr>`);
    $(`#edit${visits[i].id}`).data({ i: i, visit_id: visits[i].id });
    $(`#duplicate${visits[i].id}`).data({ i: i, visit_id: visits[i].id });
    $(`#delete${visits[i].id}`).data({ i: i, visit_id: visits[i].id });
  }


  ////// Click edit to display visit in form //////
  $('.visitEdit').click(function(event) {
    let i = $(event.target).data('i');
    let visit_id = $(event.target).data('visit_id');
    // Remove current visit highlight
    $(`#edit${current_visit}`).parent().parent().removeClass('current_visit');
    // Update current_visit
    current_visit = visit_id;
    // Add class to new current_visit
    $(event.target).parent().parent().addClass('current_visit');
    showVisit(visits[i]);
  });

  ////// Click duplicate to copy visit into form //////
  $('.visitDuplicate').click(function(event) {
    let i = $(event.target).data('i');
    // Remove current visit highlight
    $(`#edit${current_visit}`).parent().parent().removeClass('current_visit');
    duplicateVisit(visits[i]);
  });

  /////// Prompts user for confirmation then deletes a visit //////
  $('.visitDelete').click(function(event) {
    if (window.confirm("Are you sure you want to delete this visit?")) {
      let visit_id = $(event.target).data('visit_id');
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: `/user/deleteVisit/${visit_id}`,
        success: function() {
          window.location = `/edit/${customer.id}`;
        }
      });
    }
  });
}

$('#visit_start').on('change', function() {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let newEnd = new Date(newStart + 3600000);
  let endTime = htmlTime(newEnd);
  $('#visit_end').val(endTime);
});

$('#visit_submit').click(function() {
  visitSubmit();
});

////// Create visit in database //////
function visitSubmit() {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let end = $('#visit_end').val();
  let newEnd = Date.parse(date + ', ' + end);
  let data = {
    customers_id: customer.id,
    start: newStart,
    end: newEnd,
    visit_type: $('#visit_type').val(),
    notes: $('#visit_notes').val(),
    crew: $('#visit_crew').val()
  };
  if ($('#visit_team').val()) {
    data.team_id = $('#visit_team').val()
  }
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/postVisit",
    success: function(response) {
      let visit_id = response.visit_id;
      window.location = `/edit_visit/${visit_id}`;
    }
  });
}

////// Update visit in database //////
function saveVisit(visit_id) {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let end = $('#visit_end').val();
  let newEnd = Date.parse(date + ', ' + end);
  let data = {
    id: visit_id,
    start: newStart,
    end: newEnd,
    visit_type: $('#visit_type').val(),
    team_id: $('#visit_team').val(),
    notes: $('#visit_notes').val(),
    crew: $('#visit_crew').val()
  };
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/updateVisit",
    success: function(response) {
      window.location = `/edit_visit/${visit_id}`
    }
  });
}

////// Clear visit form //////
$('#clear_visit').click(function() {
  $('#visit_date').val(null);
  $('#visit_start').val(null);
  $('#visit_end').val(null);
  $('#visit_type').val(null);
  $('#visit_team').val(null);
  $('#visit_notes').val(null);
  $('#visit_crew').val(null);
  $("#saveVisitSubmit").hide();
  $("#visitSubmit").show();
  $("#visit_list").show();
  $("#visit_save").hide();
  $("#visit_submit").show();
  $('#visit_submit').text('Confirm');
  $('#edit_message').empty();
  // Remove current visit highlight
  $(`#edit${current_visit}`).parent().parent().removeClass('current_visit');
  // Update_current visit to null
  current_visit = null;
});



////////////////////////////////////////////////////////////////////////////////
//                                    CALENDAR                                //
////////////////////////////////////////////////////////////////////////////////


function map_calendar_visits() {
  return visits.map(function(visit, i) {
  let start = new Date(parseInt(visit.start));
  let end = new Date(parseInt(visit.end));
  return { id: visit.id, title: `${visit.team_name} - ${visit.visit_type} - ${customer.customer_name} - ${customer.address} - ${customer.phone_1}`, start: start, end: end, index: i }
  });
}

function visitClick(customerId, visitIndex) {
  showVisit(visits[visitIndex]);
  $("#create_job").hide();
  $("#create_visit_container").show();
}


////////////////////////////////////////////////////////////////////////////////
//                                    SWITCHES                                //
////////////////////////////////////////////////////////////////////////////////


////// Customer Profile / Visits Switch ///////
$(".switch_visits_customer").change(function() {
  let userinput = $(this);
  if (userinput.prop("checked")){
    $("#create_job").show();
    $("#create_visit_container").hide();
  } else {
    $("#create_job").hide();
    $("#create_visit_container").show();
  }
});

////////////////////////////////////////////////////////////////////////////////
//                                    Map Resize Fix                          //
////////////////////////////////////////////////////////////////////////////////

$('a[data-toggle="tab"]').on('shown.bs.tab', function(event) {
  var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);
});
