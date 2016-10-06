exports.up = function(knex, Promise) {
  return knex.schema.createTable('jobs', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.integer('zip').notNullable();
    table.string('lat').notNullable();
    table.string('lng').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('jobs');
};
