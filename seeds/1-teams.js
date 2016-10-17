exports.seed = function(knex, Promise) {
  return knex('teams').del()
    .then(function () {
      return Promise.all([
        knex('teams').insert({team_name: 'Team 1', vehicle: 'F-150'}),
        knex('teams').insert({team_name: 'Team 2', vehicle: 'Mini Cooper'}),
        knex('teams').insert({team_name: 'Team 3', vehicle: 'Tacoma'}),
        knex('teams').insert({team_name: 'Team 4', vehicle: 'Tundra'})
      ]);
    });
};
