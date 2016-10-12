$(document).ready(function(){
  getListData();
  getTeamList();
  getVisits();
});


////// Get team data from server ///////

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


////// Get list data from server ///////

function getListData(){
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/listView',
    success: function(data) {
      visitList(data);
    }
  });
}


////// Get visits from server //////

function getVisits() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/visitsAll'
  }).then(function(data) {
    var visits = data.map(function(visit) {
      let start = new Date(parseInt(visit.start));
      let end = new Date(parseInt(visit.end));
      return {title: visit.visittype, start: start, end: end}
    })
    initCalendar(visits);
  });
}


////// Display visits on calendar //////

function initCalendar(visits) {
  $('#calendar').fullCalendar({
    events: visits
  });
}


////// Initialize map using current position //////

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


////// Get jobs from server //////

function getJobs(bounds) {
  $.ajax({
    type: 'POST',
    data: {bounds: JSON.stringify(bounds)},
    dataType: 'json',
    url: '/user/jobs'
  }).then(function(jobs) {
    setMarkers(jobs);
  });
}


////// Display jobs on mpa //////

function setMarkers(jobs) {

  // Clear markers
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  // Set new markers
  for (var i = 0; i < jobs.length; i++) {
    let marker = new google.maps.Marker({
      position: {lat: parseFloat(jobs[i].lat), lng: parseFloat(jobs[i].lng)},
      map: map,
      id: jobs[i].id,
      label: String.fromCharCode(jobs[i].id + 64),
      title: jobs[i].customer_name
    });
    marker.addListener('click', function() {
      getJob(marker.id)
      $('#viewModal').modal('show');
    });
    markers.push(marker);
  }
}


////// Get data for a specific job //////

function getJob(id) {
  var url = '/user/job/' + id;
  $.ajax({
    type: 'GET',
    datatype: 'json',
    url: url
  }).then(function(job) {
    $('#customer_name').attr('value', job.customer_name);
    $('#po_number').attr('value', job.po_number);
    $('#email').attr('value', job.email);
    $('#po_number').attr('value', job.po_number);
    $('#phone_number').attr('value', job.phone_number);
    $('#address').attr('value', job.address);
    $('#city').attr('value', job.city);
    let state = document.getElementById('state');
    state.value = job.state;
    $('#zip').attr('value', job.zip);
    $('#job_date').attr('value', job.job_date);
    $('#job_type').attr('value', job.job_type);
    let team = document.getElementById('team');
    console.log(job.team_id);
    team.value = job.team_id;
    // let priority = document.getElementById('priority');
    // priority.value = job.priority;
    $('#notes').attr('value', job.notes);
  });
}


////// Map List Switch ///////

$(".switch").change(function() {
    var userinput = $(this);
    if (userinput.prop("checked")){
      $("#map").show();
      $("#list").hide();
    } else {
      $("#map").hide();
      $("#list").show();
    }
  });





////// Add data to list ///////

function visitList(data) {
  for (var i = 0; i < data.length; i++) {
    let date = new Date(parseInt(data[i].start));
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
    let time = hours + ":" + minutes + " " + meridiem;
    $(".list").append("<tr><td>" + data[i].team_id + "</td><td>" + time + "</td><td>" + data[i].job_type + "</td><td>" + data[i].address + "</td><td>" + data[i].phone_number + "</td></tr>");
  }
}
