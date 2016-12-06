exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({ email: 'user@user.com', password: '$2a$08$VwhrnReCzAL4jXn9ZrPPJeRveY5VEsrTkL2bhbFe3X0REDTaVXgoK', name: 'Juan Portillo', team_id: 1, isadmin: false }),
        knex('users').insert({ email: 'admin@admin.com', password: '$2a$08$VwhrnReCzAL4jXn9ZrPPJeRveY5VEsrTkL2bhbFe3X0REDTaVXgoK', name: 'Ian Strouse', team_id: 2, isadmin: true })
      ]);
    });
};
