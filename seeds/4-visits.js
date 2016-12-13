exports.seed = function(knex, Promise) {
  return knex('visits').del()
    .then(function () {
      return Promise.all([
        knex('visits').insert({ customers_id: 1, visit_type: 'Estimate', start: 1481655600000, end: 1481657400000, team_id: 1 }),
        knex('visits').insert({ customers_id: 1, visit_type: 'Start work', start: 1481742000000, end: 1481743800000, team_id: 2 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Estimate', start: 1481828400000, end: 1481830200000, team_id: 3 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Start work', start: 1481914800000, end: 1481916600000, team_id: 1 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Estimate', start: 1482001200000, end: 1482003000000, team_id: 2 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Start work', start: 1482087600000, end: 1482089400000, team_id: 3 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Estimate', start: 1482174000000, end: 1482175800000, team_id: 1 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Start work', start: 1482260400000, end: 1482262200000, team_id: 2 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Estimate', start: 1482346800000, end: 1482348600000, team_id: 3 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Start work', start: 1482433200000, end: 1482435000000, team_id: 1 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Complete work', start: 1482519600000, end: 1482521400000, team_id: 1 }),
        knex('visits').insert({ customers_id: 1, visit_type: 'Estimate', start: 1482606000000, end: 1482607800000, team_id: 1 }),
        knex('visits').insert({ customers_id: 1, visit_type: 'Start work', start: 1482692400000, end: 1482694200000, team_id: 2 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Estimate', start: 1482778800000, end: 1482780600000, team_id: 3 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Start work', start: 1482865200000, end: 1482867000000, team_id: 1 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Estimate', start: 1482951600000, end: 1482953400000, team_id: 2 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Start work', start: 1483038000000, end: 1483039800000, team_id: 3 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Estimate', start: 1483124400000, end: 1483126200000, team_id: 1 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Start work', start: 1483210800000, end: 1483212600000, team_id: 2 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Estimate', start: 1483297200000, end: 1483299000000, team_id: 3 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Start work', start: 1483383600000, end: 1483385400000, team_id: 1 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Complete work', start: 1483470000000, end: 1483471800000, team_id: 1 })
      ]);
    });
};
