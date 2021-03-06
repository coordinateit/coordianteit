exports.up = function(knex, Promise) {
  return knex.schema.createTable('visits', function(table) {
    table.increments('id').primary();
    table.integer('customers_id').references('id').inTable('customers');
    table.string('visit_type').notNullable();
    table.bigInteger('start').notNullable();
    table.bigInteger('end').notNullable();
    table.integer('team_id').references('id').inTable('teams');
    table.string('extraequipment', 1000);
    table.string('notes', 5000);
    table.string('crew');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('visits');
};
