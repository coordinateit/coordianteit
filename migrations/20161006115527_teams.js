exports.up = function(knex, Promise) {
  return knex.schema.createTable('teams', function(table) {
    table.increments('id').primary();
    table.string('name');
    table.string('vehicle');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
