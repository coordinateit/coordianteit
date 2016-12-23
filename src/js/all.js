
////// Logout route //////
$('#logout').click(function(event) {
  event.preventDefault;
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/user/logout",
    success: function() {
      window.location = "/";
    }
  })
});

////// Set time to 1:00 pm format //////
function parseTime(input) {
  let date = new Date(parseInt(input));
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
  return hours + ":" + minutes + " " + meridiem;
}

////// Set date to Sat, Oct 10 format //////
function parseDate(input) {
  let date = new Date(parseInt(input));
  let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate().toString();
}
