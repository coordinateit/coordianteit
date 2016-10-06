exports.seed = function(knex, Promise) {
  return knex('jobs').del()
    .then(function () {
      return Promise.all([
        knex('jobs').insert({id: 1, name: 'Black Pepper Pho', address: '2770 Pearl St', city: 'Boulder', zip: 80302, lat: '40.0219546', lng: '-105.2591322'}),
        knex('jobs').insert({id: 2, name: 'Vina Pho & Grill', address: '1630 30th St', city: '1630 30th St', zip: 80303, lat: '40.0152767', lng: '-105.2532192'}),
        knex('jobs').insert({id: 3, name: 'Pho Cafe', address: '1085 S Public Rd', city: 'Lafayette', zip: 80026, lat: '39.9887872', lng: '-105.0911771'}),
        knex('jobs').insert({id: 4, name: 'Pho Mai Vietnamese', address: '6765 W 120th Ave A', city: 'Broomfield', zip: 80020, lat: '39.9152647', lng: '-105.069651'}),
        knex('jobs').insert({id: 5, name: 'Pho 79', address: '6650 W 120th Ave', city: 'Broomfield', zip: 80020, lat: '39.9128856', lng: '-105.0695519'})
      ]);
    });
};
