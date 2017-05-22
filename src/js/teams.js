
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
  teamsReady();
}

////// Filter page by team //////
$("#teams").on('change', function () {
  filter_by_team();
  displayTeams();
});

function displayTeams(){
  let teams = $('#teams').val();
  if (teams){
    teams = teams.map(function(team_id) {
      return parseInt(team_id);
    });

    let team_names = [];
    $.ajax({
      type: 'POST',
      dataType: 'json',
      data: { teams: JSON.stringify(teams) },
      url: '/user/teams_by_ids'
    }).then(function(response) {
      for (var i = 0; i < response.length; i++) {
        team_names.push(" " + response[i].team_name);
      }
        $('#display_teams').text("Displaying data for " + team_names + ".");
      });
  } else {
    $('#display_teams').text("Displaying data for all teams.");
  }

}

function filter_by_team() {
  let teams = $('#teams').val();
  if (teams) {
    if (teams[0] !== "") {
      teams = teams.map(function(team) {
        return parseInt(team);
      });
      getListData(teams);

    } else {
      getListData();
      teams = null;
    }
  } else {
    getListData();
    teams = null;
  }
  getVisits(teams);
  getCustomers(teams);
}
