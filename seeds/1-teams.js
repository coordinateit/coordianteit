exports.seed = function(knex, Promise) {
  return knex('teams').del()
    .then(function () {
      return Promise.all([
        knex('teams').insert({id: 1, team_name: 'Team 1', vehicle: 'F-150'}),
        knex('teams').insert({id: 2, team_name: 'Team 2', vehicle: 'Mini Cooper'}),
        knex('teams').insert({id: 3, team_name: 'Team 3', vehicle: 'Tacoma'}),
        knex('teams').insert({id: 4, team_name: 'Team 4', vehicle: 'Tundra'})
      ]);
    });
};
