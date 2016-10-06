exports.up = function(knex, Promise) {
  return knex.schema.createTable('visits', function(table) {
    table.increments('id').primary();
    table.integer('jobs_id').references('id').inTable('jobs');
    table.string('visittype').notNullable();
    table.integer('team_id').references('id').inTable('teams');
    table.string('start').notNullable();
    table.string('end').notNullable();
    table.string('extraequipment', 1000);
    table.string('notes', 5000);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('visits');
};
