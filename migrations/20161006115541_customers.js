exports.up = function(knex, Promise) {
  return knex.schema.createTable('customers', function(table) {
    table.increments('id').primary();
    table.decimal('lat', 11, 7).notNullable();
    table.decimal('lng', 11, 7).notNullable();
    table.string('customer_name').notNullable();
    table.string('email');
    table.string('phone_1');
    table.string('phone_2');
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.integer('zip').notNullable();
    table.string('customer_type');
    table.string('referral');
    table.boolean('isactive').notNullable().defaultsTo(true);
    table.string('notes', 5000);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('jobs');
};
