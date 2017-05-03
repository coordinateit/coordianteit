
////// Initialize calendar and display visits //////
function initCalendar() {
  let clickTimer;
  $('#calendar').fullCalendar({
    eventClick: function(event, jsEvent) {
      // Event handler for click vs double click
      let element = $(jsEvent.target), eventClicker = element.data('eventClicker');
      if (eventClicker) { // Double click
        clearTimeout(eventClicker);
        element.data('eventClicker', '');

      } else { // Single click

        $(this).popover({
          html:true,
          content:"<button class='btn btn-primary'>Edit</button>",
          placement:'right',
          container:'body'
        }).popover('toggle');

        element.data('eventClicker', setTimeout(function() {
          element.data('eventClicker', '');
          visitClick(event.id, event.index);
        }, 300));
      }
    },
    dayClick: function(date, jsEvent) {
      // Event handler for click vs double click
      let element = $(jsEvent.target), dayClicker = element.data('dayClicker');
      if (dayClicker) {
        clearTimeout(dayClicker);
        element.data('dayClicker', '');
        let dateObj = date._d;
        showVisitCreate(dateObj);
      } else {
        element.data('dayClicker', setTimeout(function() {
          element.data('dayClicker', '');
          showDay();
        }, 300));
      }
      // On single click, show day
      function showDay() {
        $('#calendar').fullCalendar('gotoDate', date);
        $('#calendar').fullCalendar('changeView', 'agendaDay');
        filter_by_team();
      }
      // On double click, create visit
      function showVisitCreate(date) {
        date.setHours(date.getHours() + 6);
        $('#visit-quick-create').modal();
        $('#visit_date').val(htmlDate(date));
        $('#visit_start').val(htmlTime(date));
        date.setHours(date.getHours() + 1);
        $('#visit_end').val(htmlTime(date));

      }
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


function date_range() {
  let start = $('#calendar').fullCalendar('getView').start._d;
  let end = $('#calendar').fullCalendar('getView').end._d;
  start = start.getTime();
  end = end.getTime();
  return { start: start, end: end }
}
