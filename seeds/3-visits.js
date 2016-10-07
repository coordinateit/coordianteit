exports.seed = function(knex, Promise) {
  return knex('visits').del()
    .then(function () {
      return Promise.all([
        knex('visits').insert({id: 1, jobs_id: 1, visittype: 'get some pho', start: '1476721226549', end: '1476731226549'}),
        knex('visits').insert({id: 2, jobs_id: 1, visittype: 'go back for more pho', start: '1476921226549', end: '1476931226549'}),
        knex('visits').insert({id: 3, jobs_id: 2, visittype: 'try the stripe', start: '1476121226549', end: '1476131226549'}),
        knex('visits').insert({id: 4, jobs_id: 2, visittype: 'get the really big bowl', start: '1476121226549', end: '1476231226549'}),
        knex('visits').insert({id: 5, jobs_id: 3, visittype: 'order pho for takeout', start: '1476451226549', end: '1476461226549'}),
        knex('visits').insert({id: 6, jobs_id: 3, visittype: 'run back for a mint', start: '1476421226549', end: '1476431226549'}),
        knex('visits').insert({id: 7, jobs_id: 4, visittype: 'order some tea', start: '1476321226549', end: '1476331226549'}),
        knex('visits').insert({id: 8, jobs_id: 4, visittype: 'drink the pho from the bowl', start: '1476651226549', end: '1476661226549'}),
        knex('visits').insert({id: 9, jobs_id: 5, visittype: 'add jalepenos and sriracha', start: '1476621226549', end: '1476631226549'}),
        knex('visits').insert({id: 10, jobs_id: 5, visittype: 'check please', start: '1476521226549', end: '1476531226549'})
      ]);
    });
};
