"use strict"

$(document).ready(function() {
  var browserSupportFlag;
  if (navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(data) {
      var position = {lat: data.coords.latitude, lng: data.coords.longitude}
      window.localStorage.position = JSON.stringify(position);
      $('#dummysignin').hide();
      $('#signin').show();
    });
  }
});
