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
function makeList(visits) {
  for (var i = 0; i < visits.length; i++) {
    let date = parseDate(visits[i].start);
    let start = parseTime(visits[i].start);
    let end = parseTime(visits[i].end);
    $(".list").append(`<tr><td>${date}</td><td>${start}</td><td>${end}</td><td>${visits[i].customer_name}</td><td>${visits[i].address}</td><td>${visits[i].visit_type}</td><td>${visits[i].crew}</td></tr>`);
  }
}
