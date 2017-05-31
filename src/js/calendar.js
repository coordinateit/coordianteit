var current_cal_event, doubleclickTimeout, slotMoment;
////// Initialize calendar and display visits //////
function initCalendar() {
  let clickTimer, popover_element;
  $('#calendar').fullCalendar({
    eventClick: function(event, jsEvent) {
      visitClick(event.customers_id, event.index)
      if (current_page == 'dashboard') {
        $('.popover').not(this).popover('hide');
        $(this).popover({
          html:true,
          content:`<button class='btn btn-primary calendar_edit' id='visit${event.visit_id}'>Edit</button>`, // <a href="/edit_visit/${event.visit_id}"></a>
          placement:'bottom',
          trigger: 'manual',
          container:'.fc-scroller'
        });
        if ($('.popover').length === 0) { // Open popover initially
          $(this).popover('show');
          current_cal_event = event.visit_id;
          $(`#visit${event.visit_id}`).data('visit_id', event.visit_id || event.id);
          edit_popover_click();
        } else if (current_cal_event !== event.visit_id) { // Open new popover, close old one
          $(this).popover('show');
          current_cal_event = event.visit_id;
          $(`#visit${event.visit_id}`).data('visit_id', event.visit_id || event.id);
          edit_popover_click();
        } else { // Click on same popover to close
          $(this).popover('hide');
          current_cal_event = null;
        }
      } else if (current_page == 'edit') {
        $.ajax({
          type: 'GET',
          dataType: 'json',
          url: `/user/visit/${event.id}`
        }).then(function(visit) {
          // Remove current visit highlight
          $(`#edit${current_visit}`).parent().parent().removeClass('current_visit');
          // Update current_visit
          current_visit = visit.id;
          // Add class to new current_visit
          showVisit(visit);
        });
      }
    },

    dayClick: function(date) {
      if(doubleclickTimeout){
        clearTimeout(doubleclickTimeout);
        doubleclickTimeout = null;
      }
      slotMoment = date;
      $("#calendar").on("mousemove", forgetSlot);
      doubleclickTimeout = window.setTimeout(showDay, 300);
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
    defaultView: 'agendaWeek',
    displayEventTime: false
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

// On single click, show day
function showDay(date) {
  $('#calendar').fullCalendar('gotoDate', date);
  $('#calendar').fullCalendar('changeView', 'agendaDay');
  filter_by_team();
}

function forgetSlot(){
    slotMoment = null;
    $("#calendar").off("mousemove", forgetSlot);
}

$("#calendar").dblclick(function() {
    if(slotMoment){
      window.clearTimeout(doubleclickTimeout);
      doubleclickTimeout = null;
      let dateObj = slotMoment._d;
      showVisitCreate(dateObj);
    }
});


// On double click, create visit
function showVisitCreate(date) {
  date.setHours(date.getHours() + 6);
  $('#visit-quick-create').modal();
  $('#visit_date').val(htmlDate(date));
  $('#visit_start').val(htmlTime(date));
  date.setHours(date.getHours() + 1);
  $('#visit_end').val(htmlTime(date));
}
