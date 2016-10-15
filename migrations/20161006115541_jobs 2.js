exports.up = function(knex, Promise) {
  return knex.schema.createTable('jobs', function(table) {
    table.increments('id').primary();
    table.decimal('lat', 11, 7).notNullable();
    table.decimal('lng', 11, 7).notNullable();
    table.string('customer_name').notNullable();
    table.string('po_number');
    table.string('email');
    table.string('phone_number').notNullable();
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.integer('zip').notNullable();
    table.string('job_type');
    table.string('priority');
    table.string('notes', 5000);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('jobs');
};
