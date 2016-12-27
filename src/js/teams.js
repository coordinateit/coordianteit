
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
$('#teams').change(function(clicked) {
  let team = $('#teams').find(":selected").val();
  getVisits(team);
  getCustomers(team);
  getListData(team);
});
