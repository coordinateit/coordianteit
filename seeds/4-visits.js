exports.seed = function(knex, Promise) {
  return knex('visits').del()
    .then(function () {
      return Promise.all([
        knex('visits').insert({ customers_id: 1, visit_type: 'Estimate', start: 1477321226549, end: 1477331226549, team_id: 1 }),
        knex('visits').insert({ customers_id: 1, visit_type: 'Start work', start: 1477521226549, end: 1477531226549, team_id: 2 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Estimate', start: 1476721226549, end: 1476731226549, team_id: 3 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Start work', start: 1476721226549, end: 1476831226549, team_id: 1 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Estimate', start: 1477051226549, end: 1477061226549, team_id: 2 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Start work', start: 1477021226549, end: 1477031226549, team_id: 3 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Estimate', start: 1476921226549, end: 1476931226549, team_id: 1 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Start work', start: 1477251226549, end: 1477261226549, team_id: 2 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Estimate', start: 1477221226549, end: 1477231226549, team_id: 3 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Start work', start: 1477121226549, end: 1477131226549, team_id: 1 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Complete work', start: 1477121226549, end: 1477131226549, team_id: 1 })
      ]);
    });
};
