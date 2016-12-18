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
  if (!data.customer_name || !data.phone_1 || !data.address || !data.city || !data.state || !data.zip) {
    $("#create_form").append("<h4>Please fill out all fields.</h4>");
  } else {
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: data,
      url: '/user/newcustomer',
      success: function(customerId) {
        window.location = `/edit/${customerId}`;
      }
    })
  }
});
