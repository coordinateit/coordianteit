"use strict";

////// Invoke these functions when page loads //////
$(document).ready(function() {
  getTeamList();
  initCalendar();
  $('#calendar').hide();
  $('#visit_date').val(new Date().toDateInputValue()); // Make today's date default
  $('#calendar').fullCalendar('addEventSource', calendarVisits);
  $(`#state option[value="${customer.state}"]`).attr("selected", "selected");
  $(`#customer_type option[value="${customer.customer_type}"]`).attr("selected", "selected");
});

////// Make today's date default with timezone support ///////
Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});



////////////////////////////////////////////////////////////////////////////////
//                                    MAP                                     //
////////////////////////////////////////////////////////////////////////////////

////// Set position and marker to customer location //////
position = { lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) };
function mapReady() {
  makeMarker(position);
}

////// Lookup customer/visits same day by team //////
function getNearbyVisits() {
  let date = $('#visit_date').val();
  let start = Date.parse(date);
  let number_days = $('#number_days').val() || 1;
  let end = start + (number_days * 86400000); // Number of days * length of a day
  let teams = $('#team_filter').val();
  let radius = $('#visit_radius').val();
  getCustomersDateTeam(start, end, radius, teams);
  $('.visit-search-list').show();
  $('.maplist-container').hide();
}

// Search visits by team/date/location
  function get_first_available() {
    $('.visit-search-list').show();
    $('.maplist-container').hide();
    let date = $('#visit_date').val();
    let start = Date.parse(date);
    let number_days = $('#number_days').val() || 1;
    let end = start + (number_days * 86400000); // Number of days * length of a day
    let teams = $('#team_filter').val();
    let radius = $('#visit_radius').val();
    let lat = parseFloat(customer.lat);
    let lng = parseFloat(customer.lng);


    let search_params = { start: start, end: end, teams: JSON.stringify(teams), radius: radius, lat: lat, lng: lng};
    let url = '/user/get_first_available';
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: search_params,
      url: url
    }).then(function(visits) {
      visits.map(function(visit) {
        let x = Math.abs(lng - parseFloat(visit.lng));
        let y = Math.abs(lat - parseFloat(visit.lat));
        visit.coord_distance = Math.sqrt((x * x) + (y * y));
        // TODO: convert coord_distance to distance in miles & add radius
      });
      visits.sort(function(a, b) {
        return a.coord_distance - b.coord_distance;
      });
      for (var i = 0; i < visits.length; i++) {
        let schedule = visits.filter(function(visit) {
          let date = new Date(parseInt(visits[i].start));
          let start = date.setHours(0,0,0,0);
          let end = start + 86400000;
          return visit.team_id === visits[i].team_id && visit.start > start && visit.start < end;
        });
        // TODO: Join with teams to get team name, add team name below instead of ID
        $('#first_available_list').append(`
          <li id="li-visit${i}" data-toggle="collapse" data-target="#first_available_visit_${i}" class="collapsed">
            <h4>Team ${visits[i].team_id}</h4>
            <ul class="sub-menu collapse" id="first_available_visit_${i}">
              <li>
                <table id="first_available_table_${i}" class="table table-striped">
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
          $(`#first_available_table_${i}`).append(`
            <tr>
              <td>${parseDate(visits[i].start)}</td>
              <td>${parseTime(schedule[j].start)}</td>
              <td>${parseTime(schedule[j].end)}</td>
              <td>${visits[i].customer_name}</td>
              <td>${visits[i].address}, ${visits[i].city}</td>
              <td>${schedule[j].visit_type}</td>
              <td>${schedule[j].crew}</td>
            </tr>`);
        }
      }

      if (window.customer && !visits.error) {
        makeMarkers(visits.filter(function(localCustomer) {
          return localCustomer.id !== customer.id;
        }), customer);
      } else if (!visits.error) {
        makeMarkers(visits);
      } else {
        for (var i = 0; i < markers.length; i++) {  // Clear markers
          markers[i].setMap(null);
        }
      }
    });
  }



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
        window.location.reload();
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
$('#checkTeamSchedule').click(function() {
  checkTeamSchedule();
});

$('#get_first_available').click(function() {
  get_first_available();
});



////////////////////////////////////////////////////////////////////////////////
//                                    VISITS                                  //
////////////////////////////////////////////////////////////////////////////////


////// Show visit in visit form //////
function showVisit(visitIndex) {
  let visit = visits[visitIndex];
  let start = new Date(parseInt(visit.start));
  let end = new Date(parseInt(visit.end));
  let dd = start.getDate();
  let MM = start.getMonth() + 1;
  if (dd.toString().length < 2) {
    dd = "0" + dd;
  }
  if (MM.toString().length < 2) {
    MM = "0" + MM;
  }
  let yyyy = start.getFullYear();
  let date = yyyy + "-" + MM + "-" + dd;
  let startTime = setTime(start);
  let endTime = setTime(end);
  $('#visit_date').val(date);
  $('#visit_start').val(startTime);
  $('#visit_end').val(endTime);
  $('#visit_type').val(visit.visit_type);
  let team = document.getElementById('visit_team');
  team.value = visit.team_id;
  $('#visit_notes').val(visit.notes);
  $("#create_visit").show();
  $("#saveVisitSubmit").show();
  $("#visitSubmit").hide();
  $('#saveVisitSubmit').click(function() {
    saveVisit(visit.id);
  });
}

//////  //////
for (var i = 0; i < visits.length; i++) {
  let date = parseDate(parseInt(visits[i].start));
  let start = parseTime(parseInt(visits[i].start));
  let end = parseTime(parseInt(visits[i].end));
  let team = teams[visits[i]['team_id']]
  $('.visit_list').append(`<tr>
      <td>${date}</td>
      <td>${start}</td>
      <td>${end}</td>
      <td>${visits[i].visit_type}</td>
      <td>${team.team_name}</td>
      <td><button type="button" id=${i} class="btn btn-primary btn-xs visitEdit">Edit</button></td>
      <td><button type="button" id=${visits[i].id} class="btn btn-danger btn-xs visitDelete">Delete</button></td>
    </tr>`);
}

////// Return pretty time string //////
function setTime(time) {
  let hh = time.getHours();
  let mm = time.getMinutes();
  if (hh.toString().length < 2) {
    hh = "0" + hh;
  }
  if (mm.toString().length < 2) {
    mm = "0" + mm;
  }
  return hh + ":" + mm;
}

$('#visit_start').on('change', function() {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let newEnd = new Date(newStart + 1800000);
  let endTime = setTime(newEnd);
  $('#visit_end').val(endTime);
});

$('#visitSubmit').click(function() {
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
    notes: $('#visit_notes').val()
  };
  if ($('#visit_team').val()) {
    data.team_id = $('#visit_team').val()
  }
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/postVisit",
    success: function() {
      window.location.reload();
    }
  });
}

////// Update visit in database //////
function saveVisit(visitId) {
  let date = $('#visit_date').val();
  let start = $('#visit_start').val();
  let newStart = Date.parse(date + ', ' + start);
  let end = $('#visit_end').val();
  let newEnd = Date.parse(date + ', ' + end);
  let data = {
    id: visitId,
    start: newStart,
    end: newEnd,
    visit_type: $('#visit_type').val(),
    team_id: $('#visit_team').val(),
    notes: $('#visit_notes').val()
  };
  $.ajax({
    type: "POST",
    dataType: "json",
    data: data,
    url: "/user/updateVisit",
    success: function() {
      window.location.reload();
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
  $("#saveVisitSubmit").hide();
  $("#visitSubmit").show();
  $("#visit_list").show();
});

////// Click edit to display visit in form //////
$('.visitEdit').click(function(event) {
  showVisit(event.target.id);
});

/////// Prompts user for confirmation then deletes a visit //////
$('.visitDelete').click(function(event) {
  if (window.confirm("Are you sure you want to delete this visit?")) {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: `/user/deleteVisit/${event.target.id}`,
      success: function() {
        window.location.reload();
      }
    });
  }
});



////////////////////////////////////////////////////////////////////////////////
//                                    CALENDAR                                //
////////////////////////////////////////////////////////////////////////////////


var calendarVisits = visits.map(function(visit, i) {
  let start = new Date(parseInt(visit.start));
  let end = new Date(parseInt(visit.end));
  let team = teams[visit.team_id];
  return { id: visit.id, title: `${team.team_name} - ${visit.visit_type} - ${customer.customer_name} - ${customer.address} - ${customer.phone_1}`, start: start, end: end, index: i }
});

function visitClick(customerId, visitIndex) {
  showVisit(visitIndex);
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

////// Map / Calendar Switch ///////
$(".switch_map_calendar").change(function() {
  let userinput = $(this);
  if (userinput.prop("checked")){
    $("#map").show();
    $("#calendar").hide();
  } else {
    $("#map").hide();
    $("#calendar").show();
    $('#calendar').fullCalendar('refetchEvents');
  }
});

$('#close_list').click(function() {
  $('.visit-search-list').hide();
  $('.maplist-container').show();
});
