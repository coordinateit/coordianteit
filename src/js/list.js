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
      let visits = data.sort(function(a, b) {
        return a.start - b.start;
      });
      makeList(visits);
    }
  });
};

////// Add data to list ///////
function makeList(visits) {
  let start = parseDate(visits[0].start), end = parseDate(visits[visits.length - 1].start);
  $('#date_range').append(`<h3>Schedule: ${start} - ${end}</h3>`)
  for (var i = 0; i < visits.length; i++) {
    let date = parseDate(visits[i].start);
    let start = parseTime(visits[i].start);
    let end = parseTime(visits[i].end);
    $(".list").append(`<tr><td>${date}</td><td>${start}</td><td>${end}</td><td>${visits[i].customer_name}</td><td>${visits[i].address || ''}</td><td>${visits[i].visit_type || ''}</td><td>${visits[i].crew || ''}</td>td>${visits[i].notes || ''}</td></tr>`);
  }
}
