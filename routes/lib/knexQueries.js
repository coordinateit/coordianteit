var knex = require('../../db/knex');

module.exports = {
  customerById: function(id) {
    return knex('customers')
      .where('id', id)
      .first()
  },

  customersVisitsAll: function() {
    return knex('visits')
      .join('customers', 'customers_id', 'customers.id')
  },

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

  visitById: function(id) {
    return knex('visits')
      .where('id', id)
      .first()
  },

  visits: function(team) {
    return knex('visits')
      .where(function() {
        if (team) {
          this.where('team_id', team)
        }
      })
  },

  visitsByCustomer: function(id) {
    return knex('visits')
      .where('customers_id', id)
  },

  visitsByDateRange: function(start, end) {
    return knex('visits')
      .where('start', '>', start)
      .andWhere('start', '<', end)
  },

  visitsByDateRangeAndTeams(start, end, teams) {
    return knex('visits')
      .whereIn('team_id', teams)
      .andWhere('start', '>', start)
      .andWhere('start', '<', end)
  }
}
