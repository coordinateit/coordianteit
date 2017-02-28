exports.seed = function(knex, Promise) {
  return knex('visits').del()
    .then(function () {
      return Promise.all([
        knex('visits').insert({ customers_id: 1, visit_type: 'Estimate', start: 1483470000000, end: 1483471800000, team_id: 1 }),
        knex('visits').insert({ customers_id: 1, visit_type: 'Start work', start: 1483556400000, end: 1483558200000, team_id: 2 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Estimate', start: 1483642800000, end: 1483644600000, team_id: 3 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Start work', start: 1483729200000, end: 1483731000000, team_id: 1 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Estimate', start: 1483815600000, end: 1483817400000, team_id: 2 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Start work', start: 1483902000000, end: 1483903800000, team_id: 3 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Estimate', start: 1483988400000, end: 1483990200000, team_id: 1 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Start work', start: 1484074800000, end: 1484076600000, team_id: 2 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Estimate', start: 1484161200000, end: 1482348600000, team_id: 3 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Start work', start: 1484247600000, end: 1484249400000, team_id: 1 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Complete work', start: 1484334000000, end: 1484335800000, team_id: 1 }),
        knex('visits').insert({ customers_id: 1, visit_type: 'Estimate', start: 1484420400000, end: 1484422200000, team_id: 1 }),
        knex('visits').insert({ customers_id: 1, visit_type: 'Start work', start: 1484506800000, end: 1484508600000, team_id: 2 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Estimate', start: 1486407600000, end: 1486407600000, team_id: 3 }),
        knex('visits').insert({ customers_id: 2, visit_type: 'Start work', start: 1484679600000, end: 1484681400000, team_id: 1 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Estimate', start: 1484766000000, end: 1484767800000, team_id: 2 }),
        knex('visits').insert({ customers_id: 3, visit_type: 'Start work', start: 1484852400000, end: 1484854200000, team_id: 3 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Estimate', start: 1484938800000, end: 1484940600000, team_id: 1 }),
        knex('visits').insert({ customers_id: 4, visit_type: 'Start work', start: 1485025200000, end: 1485027000000, team_id: 2 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Estimate', start: 1485111600000, end: 1485113400000, team_id: 3 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Start work', start: 1485198000000, end: 1485199800000, team_id: 1 }),
        knex('visits').insert({ customers_id: 5, visit_type: 'Complete work', start: 1485284400000, end: 1485286200000, team_id: 1 })
      ]);
    });
};
