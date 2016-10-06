exports.up = function(knex, Promise) {
  return knex.schema.createTable('jobs', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('lat').notNullable();
    table.string('lng').notNullable();
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.integer('zip').notNullable();
    table.integer('team_id').references('id').inTable('teams');
    table.string('phone');
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
