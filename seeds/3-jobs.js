exports.seed = function(knex, Promise) {
  return knex('jobs').del()
    .then(function () {
      return Promise.all([
        knex('jobs').insert({customer_name: 'Juan Portillo', po_number: 'A1234567', email: 'juan@testing.com', phone_number: '1234567890', address: '2770 Pearl St', city: 'Boulder', state: 'CO', zip: 80302, job_type: 'Siding Installation', priority: 1, notes: 'Beware of dog, wait for owner to let you into backyard', lat: 40.0219546, lng: -105.2591322}),
        knex('jobs').insert({customer_name: 'Ian Strouse', po_number: 'A7654321', email: 'ian@test.com', phone_number: '0987654321', address: '1630 30th St', city: 'Boulder', state: 'CO', zip: 80303, job_type: 'Exterior Painting', priority: 2, notes: 'Key to locked gate under rock by the recycle bin', lat: 40.0152767, lng: -105.2532192}),
        knex('jobs').insert({customer_name: 'Erlich Bachman', po_number: 'A4539867', phone_number: '2223456712', address: '1085 S Public Rd', city: 'Lafayette', state: 'CO', zip: 80026, job_type: 'Interior Painting', priority: 3, notes: 'Beware of ferrets, neighbor keeps illegal ferrets', lat: 39.9887872, lng: -105.0911771}),
        knex('jobs').insert({customer_name: 'Gavin Belson', po_number: 'A2094857', phone_number: '5553948603', address: '6765 W 120th Ave A', city: 'Broomfield', state: 'CO', zip: 80020, job_type: 'flood damage', priority: 1, notes: 'Keep this man happy at all costs, tell him what he wants to hear', lat: 39.9152647, lng: -105.069651}),
        knex('jobs').insert({customer_name: 'Jared Dunn', po_number: 'A6352417', phone_number: '4443901937', address: '6650 W 120th Ave', city: 'Broomfield', state: 'CO', zip: 80020, job_type: 'fix garage drywall', priority: 3, notes: 'Beware of rodent infestation in garage',lat: 39.9128856, lng: -105.0695519})
      ]);
    });
};
