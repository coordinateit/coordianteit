////// Initialize map using current position //////
var map;
function initMap() {
  // let position = JSON.parse(window.localStorage.position);
  map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 11,
    fullscreenControl: true
  });
  mapReady();
}



//! SOLUTION FOR USE IN DASHBOARD !//

// getJobs().then(function(data) {
//   console.log(data);
// })

////// Get jobs from server //////
// var currentDate = Date.now();
// function getJobs() {
//   return $.ajax({
//     type: 'POST',
//     data: { date: currentDate, team: 1 },
//     dataType: 'json',
//     url: '/user/jobs'
//   }).then(function(jobs) {
//     console.log(jobs);
//     return jobs;
//     // setMarkers(jobs);
//   });
// }
