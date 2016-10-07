$(document).ready(function(){

  // GET VISITS FROM SERVER
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

  // DISPLAY VISITS ON CALENDAR
  function initCalendar(visits) {
    $('#calendar').fullCalendar({
      events: visits
    });
  }
});
