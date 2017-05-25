var knex = require('../../db/knex');

module.exports = {
  customerById: function(id) {
    return knex('customers')
      .where('id', id)
      .first()
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
    return knex('teams')
      .join('visits', 'teams.id', 'team_id')
      .where('customers_id', id)
  },

  visitsByDateRange: function(start, end) {
    return knex('visits')
      .where('start', '>', start)
      .andWhere('start', '<', end)
  },

  visitsByDateRangeAndTeams(start, end, teams) {
    return knex('visits')
      // .whereIn('team_id', teams)
      .where(function() {
        if (teams) {
          this.whereIn('team_id', teams)
        }
      })
      .andWhere('start', '>', start)
      .andWhere('start', '<', end)
  },

  getFirstAvailable(start, end, teams, range) {
    return knex.select('visits.id as visit_id', 'start', 'end', 'customer_name', 'address', 'city', 'visit_type', 'crew', 'team_id', 'team_name', 'customers_id as id', 'lat', 'lng')
      .from('visits')
      .join('customers', 'visits.customers_id', 'customers.id')
      .join('teams', 'visits.team_id', 'teams.id')
      .where(function() {
        if (teams) {
          this.whereIn('team_id', teams)
        }
      })
      .andWhere('start', '>', start)
      .andWhere('start', '<', end)
      .andWhere(function() {
        if (range.lat_hi) {
          this.where('lat', '<', range.lat_hi)
          this.where('lat', '>', range.lat_lo)
          this.where('lng', '<', range.lng_hi)
          this.where('lng', '>', range.lng_lo)
        }
      })
  },

  getTeams() {
    return knex('teams')
  }
}
