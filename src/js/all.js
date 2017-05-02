////// Logout route //////
$('#logout').click(function(event) {
  event.preventDefault;
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/logout",
    success: function() {
      window.location = "/";
    }
  })
});

////// Get customer by ID //////
function getCustomer(visitId) {
  var customer = {}

}

////// Set time to 1:00 pm format //////
function parseTime(input) {
  let date = new Date(parseInt(input));
  let meridiem = 'am';
  let hours = date.getHours();
  let minutes = date.getMinutes();
  if (hours === 12) {
    meridiem = 'pm';
  } else if (hours > 12) {
    meridiem = 'pm';
    hours -= 12;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  return hours + ":" + minutes + " " + meridiem;
}

////// Set date to Sat, Oct 10 format //////
function parseDate(input) {
  let date = new Date(parseInt(input));
  let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate().toString();
}

// Parse time and date for html format
function htmlTime(time) {
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

function htmlDate(input) {
  let dd = input.getDate();
  let MM = input.getMonth() + 1;
  if (dd.toString().length < 2) {
    dd = "0" + dd;
  }
  if (MM.toString().length < 2) {
    MM = "0" + MM;
  }
  let yyyy = input.getFullYear();
  return yyyy + "-" + MM + "-" + dd;
}
