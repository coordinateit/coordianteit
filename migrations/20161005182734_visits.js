exports.up = function(knex, Promise) {
  return knex.schema.createTable('visits', function(table) {
    table.increments('id').primary();
    table.integer('jobs_id').references('id').inTable('jobs');
    table.string('description', 1000).notNullable();
    table.string('datetime').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('visits');
};
