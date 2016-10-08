exports.up = function(knex, Promise) {
  return knex.schema.createTable('jobs', function(table) {
    table.increments('id').primary();
    table.string('customer_name').notNullable();
    table.decimal('lat', 11, 7).notNullable();
    table.decimal('lng', 11, 7).notNullable();
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.integer('zip').notNullable();
    table.integer('team_id').references('id').inTable('teams');
    table.string('phone_number');
    table.string('email');
    table.string('jobtype');
    table.string('po');
    table.string('priority');
    table.string('notes', 5000);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('jobs');
};
