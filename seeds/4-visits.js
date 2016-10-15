exports.seed = function(knex, Promise) {
  return knex('visits').del()
    .then(function () {
      return Promise.all([
        knex('visits').insert({jobs_id: 1, visit_type: 'get some pho', start: 1476721226549, end: 1476731226549}),
        knex('visits').insert({jobs_id: 1, visit_type: 'go back for more pho', start: 1476921226549, end: 1476931226549}),
        knex('visits').insert({jobs_id: 2, visit_type: 'try the stripe', start: 1476121226549, end: 1476131226549}),
        knex('visits').insert({jobs_id: 2, visit_type: 'get the really big bowl', start: 1476121226549, end: 1476231226549}),
        knex('visits').insert({jobs_id: 3, visit_type: 'order pho for takeout', start: 1476451226549, end: 1476461226549}),
        knex('visits').insert({jobs_id: 3, visit_type: 'run back for a mint', start: 1476421226549, end: 1476431226549}),
        knex('visits').insert({jobs_id: 4, visit_type: 'order some tea', start: 1476321226549, end: 1476331226549}),
        knex('visits').insert({jobs_id: 4, visit_type: 'drink the pho from the bowl', start: 1476651226549, end: 1476661226549}),
        knex('visits').insert({jobs_id: 5, visit_type: 'add jalepenos and sriracha', start: 1476621226549, end: 1476631226549}),
        knex('visits').insert({jobs_id: 5, visit_type: 'check please', start: 1476521226549, end: 1476531226549})
      ]);
    });
};
