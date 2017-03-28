exports.seed = function(knex, Promise) {
  return knex('customers').del()
    .then(function () {
      return Promise.all([
        knex('customers').insert({ customer_name: 'Juan Portillo', email: 'juan@testing.com', phone_1: '1234567890', address: '2770 Pearl St', city: 'Boulder', state: 'CO', zip: '80302', customer_type: 'EI', notes: 'Beware of dog, wait for owner to let you into backyard', lat: 40.0219546, lng: -105.2591322 }),
        knex('customers').insert({ customer_name: 'Ian Strouse', email: 'ian@test.com', phone_1: '0987654321', address: '1630 30th St', city: 'Boulder', state: 'CO', zip: '80303', customer_type: 'EI_W', notes: 'Key to locked gate under rock by the recycle bin', lat: 40.0152767, lng: -105.2532192 }),
        knex('customers').insert({ customer_name: 'Erlich Bachman', phone_1: '2223456712', address: '1085 S Public Rd', city: 'Lafayette', state: 'CO', zip: '80026', customer_type: 'EI_WM', notes: 'Beware of ferrets, neighbor keeps illegal ferrets', lat: 39.9887872, lng: -105.0911771 }),
        knex('customers').insert({ customer_name: 'Gavin Belson', phone_1: '5553948603', address: '6765 W 120th Ave A', city: 'Broomfield', state: 'CO', zip: '80020', customer_type: 'WWI', notes: 'Keep this man happy at all costs, tell him what he wants to hear', lat: 39.9152647, lng: -105.069651 }),
        knex('customers').insert({ customer_name: 'Jared Dunn', phone_1: '4443901937', address: '6650 W 120th Ave', city: 'Broomfield', state: 'CO', zip: '80020', customer_type: 'DCS', notes: 'Beware of rodent infestation in garage', lat: 39.9128856, lng: -105.0695519 })
      ]);
    });
};
