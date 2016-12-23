var knex = require('../../db/knex');

module.exports = {
  customersForDashboard: function(request) {
    return knex('customers')
     .join('visits', 'customers_id', 'customers.id')
     .where(function() {
       if (request.team) {
         this.where('team_id', request.team)
       }
     })
     .andWhere(function() {
       if (request.date) {
         var date = new Date(parseInt(request.date));
         let start = date.setHours(0,0,0,0);
         let end = date.setHours(168,0,0,0);
         this.whereBetween('start', [start, end]);
       }
     })
  },

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
