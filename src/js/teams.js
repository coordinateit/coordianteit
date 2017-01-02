
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
$("#teams").on('change', function () {
  var teams = $(this).val();
  if (teams) {
    teams = teams.map(function(team) {
      return parseInt(team);
    });
  }
  getVisits(teams);
  getCustomers(teams);
  getListData(teams);
});
