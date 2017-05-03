exports.seed = function(knex, Promise) {
  return knex('teams').del()
    .then(function () {
      return Promise.all([
        knex('teams').insert({ team_name: 'Red Team', vehicle: 'F-150' }),
        knex('teams').insert({ team_name: 'Green Team', vehicle: 'Mini Cooper' }),
        knex('teams').insert({ team_name: 'Yellow Team', vehicle: 'Tacoma' }),
        knex('teams').insert({ team_name: 'Blue Team', vehicle: 'Tundra' })
      ]);
     });
};
