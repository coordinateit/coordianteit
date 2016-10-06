exports.seed = function(knex, Promise) {
  return knex('visits').del()
    .then(function () {
      return Promise.all([
        knex('visits').insert({id: 1, description: 'get some pho', datetime: '1476721226549'}),
        knex('visits').insert({id: 2, description: 'go back for more pho', datetime: '1476921226549'}),
        knex('visits').insert({id: 3, description: 'try the stripe', datetime: '1476121226549'}),
        knex('visits').insert({id: 4, description: 'get the really big bowl this time', datetime: '1476221226549'}),
        knex('visits').insert({id: 5, description: 'order all of the pho for takeout', datetime: '1476351226549'}),
        knex('visits').insert({id: 6, description: 'run back for a mint', datetime: '1476421226549'}),
        knex('visits').insert({id: 7, description: 'order some tea', datetime: '1476321226549'}),
        knex('visits').insert({id: 8, description: 'drink the pho straight from the bowl', datetime: '1476651226549'}),
        knex('visits').insert({id: 9, description: 'add all the jalepenos and sriracha', datetime: '1476621226549'}),
        knex('visits').insert({id: 10, description: 'check please', datetime: '1476521226549'})
      ]);
    });
};
