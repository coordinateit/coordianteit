$(document).ready(function(){

  // GET VISITS FROM SERVER
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/visitsAll'
  }).then(function(data) {
    var visits = data.map(function(i) {
      let start = new Date(parseInt(i.start));
      let end = new Date(parseInt(i.start));
      return {title: i.visittype, start: start, end: end}
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
