var knex = require('../../db/knex');

module.exports = {
  customersByIDs: function(ids) {
    return knex('customers')
      .whereIn('id', ids)
  },

  visitsByDateRange: function(start, end) {
    return knex('visits')
      .where('start', '>', start)
      .andWhere('start', '<', end)
  },

  visitsByDateRangeAndTeam(start, end, team) {
    return knex('visits')
      .where('start', '>', start)
      .andWhere('start', '<', end)
      .andWhere('team_id', team)
  }
}
