
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
  let teams = $(this).val();
  if (teams) {
    if (teams[0] !== "") {
      teams = teams.map(function(team) {
        return parseInt(team);
      });
    } else {
      teams = null;
    }
  } else {
    teams = null;
  }
  getVisits(teams);
  getCustomers(teams);
  getListData(teams);
});
