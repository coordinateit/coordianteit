"use strict";

$(document).ready(function(){
  getListData();
});


////// Get list data from server ///////
function getListData(){
  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: {list: window.localStorage.list},
    url: '/user/printlist',
    success: function(data) {
      makeList(data);
    }
  });
};


////// Add data to list ///////
function makeList(data) {
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
