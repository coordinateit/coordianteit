
////// Initialize calendar and display visits //////
function initCalendar() {
  $('#calendar').fullCalendar({
    eventClick: function(event) {
      visitClick(event.id, event.index);
    },
    dayClick: function(date) {
      $('#calendar').fullCalendar('gotoDate', date);
      $('#calendar').fullCalendar('changeView', 'agendaDay');
      filter_by_team();
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
  date_range();
}

$('#calendar').click(function() {
  filter_by_team();
});

function date_range() {
  let start = $('#calendar').fullCalendar('getView').start._d;
  let end = $('#calendar').fullCalendar('getView').end._d;
  start = start.getTime();
  end = end.getTime();
  return { start: start, end: end }
}
