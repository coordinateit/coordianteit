exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('name').unique().notNullable();
    table.string('phone');
    table.integer('team_id').references('id').inTable('teams');
    table.boolean('isadmin').notNullable().defaultsTo(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
