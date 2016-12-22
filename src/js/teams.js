
////// Get team data from server ///////
function getTeamList() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/teams',
    success: function(data) {
      teamList(data);
    }
  });
}


////// Populate team lists //////
function teamList(teams) {
  for (var i = 0; i < teams.length; i++) {
    $('.teams').append(`<option value=${teams[i].id}>${teams[i].team_name}</option>`);
  }
}


////// Filter page by team //////
var teamFilter;
$('#teams').change(function(clicked) {
  teamFilter = $('#teams').find(":selected").val();
  getVisits();
  getJobs();
  getListData();
  $("#calendar").show();
  $("#create_form").hide();
  $(".switch_calendar_job").prop("checked", true);
});
