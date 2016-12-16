////// Initialize calendar and display visits //////
function initCalendar() {
  $('#calendar').fullCalendar({
    eventClick: function(event) {
      getVisit(event._id);
    },
    dayClick: function(date) {
      $('#calendar').fullCalendar('gotoDate', date);
      $('#calendar').fullCalendar('changeView', 'agendaDay');
      // Set currentDate to date clicked
      // currentDate = date._d.getTime();
    },
    eventMouseover: function() {
      document.body.style.cursor = "pointer";
    },
    eventMouseout: function() {
      document.body.style.cursor = "default";
    },
    header: {
        left: 'title',
        center: 'month,agendaWeek,agendaDay',
        right: 'prev,next today myCustomButton'
    },
    views: {
        agendaDay: {
            titleFormat: 'MMMM Do'
        }
    },
    defaultView: 'agendaWeek'
  });
}
