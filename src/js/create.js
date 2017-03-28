"use strict";

$("#create_job_button").click(function() {
  let data = {
    customer_name: $("#customer_name").val(),
    phone_1: $("#phone_1").val(),
    address: $("#address").val(),
    city: $("#city").val(),
    state: $("#state").val(),
    zip: $("#zip").val(),
  }
  if (!data.customer_name) {
    $("#error").remove();
    $("#create_form").prepend("<h4 id='error' style='color: red'>Please enter customer name.</h4>");
  } else {
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: data,
      url: '/user/newcustomer'
    }).then(function(data) {
      if (data.error) {
        $("#error").remove();
        $("#create_form").prepend(`<h4 id='error' style='color: red'>${data.error}</h4>`);
      } else {
        window.location = `/edit/${data.id}`;
      }
    })
  }
});
