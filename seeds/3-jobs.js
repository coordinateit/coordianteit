exports.seed = function(knex, Promise) {
  return knex('jobs').del()
    .then(function () {
      return Promise.all([
        knex('jobs').insert({customer_name: 'Black Pepper Pho', phone_number: '1234567890', address: '2770 Pearl St', city: 'Boulder', state: 'CO', zip: 80302, job_type: 'Blue', team_id: 1, lat: 40.0219546, lng: -105.2591322}),
        knex('jobs').insert({customer_name: 'Vina Pho & Grill', phone_number: '1234567890', address: '1630 30th St', city: '1630 30th St', state: 'CO', zip: 80303, job_type: 'Red', team_id: 2, lat: 40.0152767, lng: -105.2532192}),
        knex('jobs').insert({customer_name: 'Pho Cafe', phone_number: '1234567890', address: '1085 S Public Rd', city: 'Lafayette', state: 'CO', zip: 80026, job_type: 'Orange', team_id: 3, lat: 39.9887872, lng: -105.0911771}),
        knex('jobs').insert({customer_name: 'Pho Mai Vietnamese', phone_number: '1234567890', address: '6765 W 120th Ave A', city: 'Broomfield', state: 'CO', zip: 80020, job_type: 'Green', team_id: 1, lat: 39.9152647, lng: -105.069651}),
        knex('jobs').insert({customer_name: 'Pho 79', phone_number: '1234567890', address: '6650 W 120th Ave', city: 'Broomfield', state: 'CO', zip: 80020, job_type: 'Blue', team_id: 2, lat: 39.9128856, lng: -105.0695519})
      ]);
    });
};
