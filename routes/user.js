"use strict";
var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');
var bcrypt = require('bcrypt');
var knexQueries = require('./lib/knexQueries.js');
var auth = require('./lib/auth.js');


////// Lookup customers by date range //////
router.post('/customersByDates', auth.userAuth, function(req, res, next) {
  knexQueries.visitsByDateRange(req.body.start, req.body.end)
    .then(function(visits) {
      let ids = visits.map(function(visit) {
        return visit.customers_id;
      });
      knexQueries.customersByIDs(ids)
        .then(function(customers) {
          res.send(customers);
        });
  });
});

////// Lookup customers by date range and team //////
router.post('/customersByDatesAndTeams', auth.userAuth, function(req, res, next) {
  knexQueries.visitsByDateRangeAndTeams(req.body.start, req.body.end, JSON.parse(req.body.teams))
    .then(function(visits) {
      let ids = [];
      if (visits.length) {
        ids = visits.map(function(visit) {
          return visit.customers_id;
        });
        knexQueries.customersByIDs(ids)
          .then(function(customers) {
            res.send(customers);
          });
      } else {
        res.send({ error: "There are no visits for this team today." })
      }
  });
});

router.post('/get_first_available', auth.userAuth, function(req, res, next) {
  let start = req.body.start;
  let end = req.body.end;
  let teams = JSON.parse(req.body.teams);
  let range = JSON.parse(req.body.range);
  knexQueries.getFirstAvailable(start, end, teams, range)
    .then(function(visits) {
      res.send(visits);
    });
});

router.get('/customer_list', auth.userAuth, function(req, res, next) {
  knex('customers')
    .then(function(customers) {
      res.send(customers);
    });
});

////// Gets customers based on map position, optionally filtered by team //////
router.post('/customers', auth.userAuth, function(req, res, next) {
  knexQueries.customersForDashboard(req.body)
    .then(function(customers) {
      res.send(customers);
    })
});

////// Gets visits //////
router.post('/visits', auth.userAuth, function(req, res, next) {
  let teams = JSON.parse(req.body.teams);
  if (teams) {
    knex.select('visits.id as visit_id', 'start', 'end', 'team_name', 'visit_type', 'customer_name', 'address', 'phone_1', 'customers_id', 'team_id')
      .from('visits')
      .join('teams', 'team_id', 'teams.id')
      .join('customers', 'customers_id', 'customers.id')
      .whereIn('team_id', teams)
      .then(function(visits) {
        res.send(visits);
      })
  } else {
    knex.select('visits.id as visit_id', 'start', 'end', 'team_name', 'visit_type', 'customer_name', 'address', 'phone_1', 'customers_id', 'team_id')
      .from('visits')
      .join('customers', 'customers_id', 'customers.id')
      .join('teams', 'team_id', 'teams.id')
      .then(function(visits) {
        res.send(visits);
      });
  }
});

////// Get visits for a given job ///////
router.get('/jobVisits/:customerId', auth.userAuth, function(req, res, next) {
  knex('teams')
    .join('visits', 'teams.id', 'team_id')
    .where('customers_id', req.params.customerId)
    .then(function(data) {
      res.send(data);
    })
});

////// Gets a list of teams //////
router.get('/teams', auth.userAuth, function(req, res, next) {
  knex('teams')
    .then(function(teams) {
      res.send(teams);
    });
});

////// Gets a list of teams by id //////
router.post('/teams_by_ids', auth.userAuth, function(req, res, next) {
  let teams = JSON.parse(req.body.teams);
  console.log(typeof(teams[0]));
  knex('teams')
    .whereIn('id', teams)
    .then(function(teams) {
      res.send(teams);
    });
});

////// Get visits and jobs //////
router.post('/list', auth.userAuth, function(req, res, next) {
  knex('customers')
    .join('visits', 'customers.id', 'visits.customers_id')
    .where(function() {
      if (req.body.teams) {
        let teams = JSON.parse(req.body.teams);
        this.whereIn('team_id', teams);
      }
    })
    .where(function() {
      if (req.body.start && req.body.end) {
        this.whereBetween('start', [req.body.start, req.body.end]);
      }
    })
    .then(function(visits) {
      res.send(visits);
    });
});

////// Get list //////
router.post('/printlist', auth.userAuth, function(req, res, next) {
  var ids = JSON.parse(req.body.list)
  knex('customers')
    .join('visits', 'customers_id', 'customers.id')
    .whereIn('visits.id', ids)
    .then(function(data) {
      res.send(data);
    });
});

////// Customer lookup //////
router.get('/customer/:id', auth.userAuth, function(req, res, next) {
  knex('customers')
    .where('id', req.params.id)
    .then(function(data) {
      res.send(data)
    })
});

////// Get job by ID //////
router.get('/job/:id', auth.userAuth, function(req, res, next) {
  knex('customers')
    .where({ id: req.params.id })
    .first()
    .then(function(customer) {
      res.send(customer);
    })
});

////// Get visit by ID //////
router.get('/visit/:id', auth.userAuth, function(req, res, next) {
  knex('customers')
    .join('visits', 'customers_id', 'customers.id')
    .where('visits.id', req.params.id)
    .first()
    .then(function(visit) {
      res.send(visit);
    });
});

////// Post new customer from Create Page //////
router.post('/newcustomer', auth.userAuth, function(req, res, next) {
  var lat, lng;
  var address = req.body.address + ', ' + req.body.city + ', ' + req.body.state + ', ' + req.body.zip;
  geocoder.geocode(address, function(err, data) {
    if (!err && data.results[0]) {
      lat = data.results[0].geometry.location.lat;
      lng = data.results[0].geometry.location.lng;
      insertCustomer();
    } else {
      res.send({ error: "Invalid address."})
    }
  });
  function insertCustomer() {
    let data = {
      lat: lat,
      lng: lng,
      customer_name: req.body.customer_name,
      phone_1: req.body.phone_1,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip
    }
    knex('customers')
      .insert(data)
      .returning('id')
      .then(function(id) {
        res.send({ id: id })
      })
  }
});

////// Update existing customer //////
router.post('/updateCustomer', auth.userAuth, function(req, res, next) {
  var lat, lng;
  var address = req.body.address + ', ' + req.body.city + ', ' + req.body.state + ', ' + req.body.zip;
  geocoder.geocode(address, function(err, data) {
    if (!req.body.customer_name) {
      res.send('Please add customer name.')
    }
    if (!err && data.results[0]) {
      lat = data.results[0].geometry.location.lat;
      lng = data.results[0].geometry.location.lng;
      update();
    } else {
      console.log('invalid address');
      res.send({error: "Invalid address"})
    }
  });
  function update() {
    knex('customers')
      .where('id', req.body.id)
      .update({
        lat: lat,
        lng: lng,
        customer_name: req.body.customer_name,
        isactive: req.body.isactive,
        phone_1: req.body.phone_1,
        phone_2: req.body.phone_2,
        email: req.body.email,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        customer_type: req.body.customer_type,
        is_vendor: req.body.is_vendor,
        referral: req.body.referral,
        notes: req.body.notes
      }).then(function(id) {
        res.send({});
      });
  }
});

////// Post new visit //////
router.post('/postVisit', auth.userAuth, function(req, res, next) {
  knex('visits')
    .insert(req.body)
    .returning('id')
    .then(function(visit_id) {
      res.send({ visit_id: visit_id });
    });
});

////// Update visit //////
router.post('/updateVisit', auth.userAuth, function(req, res, next) {
  let data = {
    id: req.body.id,
    visit_type: req.body.visit_type,
    start: req.body.start,
    end: req.body.end,
    notes: req.body.notes,
    crew: req.body.crew
  }
  if (req.body.team_id) {
    data.team_id = req.body.team_id
  }
  knex('visits')
    .where('id', req.body.id)
    .update(data)
    .returning('customers_id')
    .then(function(customer_id) {
      res.send({ customer_id: customer_id });
    })
});

////// Address lookup //////
router.post('/geocode', auth.userAuth, function(req, res, next) {
  let address = req.body.address + ", " + req.body.city + ", " + req.body.state + ", " + req.body.zip
  geocoder.geocode(address, function(err, data) {
    if (!err) {
      let coords = {lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng};
      res.send(coords);
    } else {
      res.send('Invalid address.')
    }
  });
});

////// Search customers //////
router.post('/search', auth.userAuth, function(req, res, next) {
  var search = JSON.parse(req.body.search);
  var lat, lng, fromDate, toDate, radius;
  checkDates();
  function checkDates() {
    if (search.from && search.to) {
      fromDate = new Date(search.from);
      fromDate = fromDate.getTime();
      toDate = new Date(search.to);
      toDate = toDate.getTime() + 86400000;
      checkRadius();
    } else {
      checkRadius();
    }
  }
  // If radius specified
  function checkRadius() {
    if (search.radius) {
      if (search.address && search.city && search.state && search.zip) {
        let address = search.address + ", " + search.city + ", " + search.state + ", " + search.zip;
        geocoder.geocode(address, function(err, data) {
          if (!err) {
            lat = data.results[0].geometry.location.lat;
            lng = data.results[0].geometry.location.lng;
            search.address = null;
            search.city = null;
            search.state = null;
            search.zip = null;
            radius = parseInt(search.radius);
            searchQuery();
          } else {
            res.send({error: 'Invalid address.'});
          }
        });
      } else {
        res.send({error: 'To search by radius, please enter a full address.'});
      }
    } else {
      searchQuery();
    }
  }

  function searchQuery() {
    // If no visit data, search customers table only
    if (!search.team_id && !search.from && !search.to) {
      knex('customers')
        .where(function() {
          if (search.customer_name) {
            this.where('customer_name', search.customer_name)
          }
        }).andWhere(function() {
          if (search.address) {
            this.where('address', search.address)
          }
        }).andWhere(function() {
          if (search.city) {
            this.where('city', search.city)
          }
        }).andWhere(function() {
          if (search.state) {
            this.where('state', search.state)
          }
        }).andWhere(function() {
          if (search.zip) {
            this.where('zip', search.zip)
          }
        }).andWhere(function() {
          if (search.radius) {
            this.where('lat', '<', (lat + radius/200))
              .andWhere('lat', '>', (lat - radius/200))
              .andWhere('lng', '<', (lng + radius/200))
              .andWhere('lng', '>', (lng - radius/200))
          }
        })
        .then(function(data) {
          res.send({ type: "job", data: data });
        });
    } else {
      // If visit data, join customer/visit tables and search
      knex('customers')
        .join('visits', 'customers.id', 'visits.customers_id')
        .where(function() {
          if (search.customer_name) {
            this.where('customer_name', search.customer_name)
          }
        }).andWhere(function() {
          if (search.team_id) {
            this.where('team_id', search.team_id)
          }
        }).andWhere(function() {
          if (search.from && search.to) {
            this.whereBetween('start', [fromDate, toDate])
          }
        }).andWhere(function() {
          if (search.address) {
            this.where('address', search.address)
          }
        }).andWhere(function() {
          if (search.city) {
            this.where('city', search.city)
          }
        }).andWhere(function() {
          if (search.state) {
            this.where('state', search.state)
          }
        }).andWhere(function() {
          if (search.zip) {
            this.where('zip', search.zip)
          }
        }).andWhere(function() {
          if (search.radius) {
            this.where('lat', '<', (lat + radius/200))
              .andWhere('lat', '>', (lat - radius/200))
              .andWhere('lng', '<', (lng + radius/200))
              .andWhere('lng', '>', (lng - radius/200))
          }
        })
        .then(function(data) {
          res.send({type: "visit", data: data});
        });
    }
  }
});

router.get('/deleteCustomer/:id', auth.userAuth, function(req, res, next) {
  knex('visits')
    .where('customers_id', req.params.id)
    .then(function(data) {
      if (data.length) {
        res.send({ error: "You must delete all visits associated with this customer first" })
      } else {
        knex('customers')
        .where('id', req.params.id)
        .del()
        .then(function() {
          res.send({});
        });
      }
    })
});

router.get('/deleteVisit/:id', auth.userAuth, function(req, res, next) {
  knex('visits')
    .where('id', req.params.id)
    .del()
    .then(function() {
      res.send({});
    });
});

router.get('/authorize', function(req, res, next) {
  res.send(req.session.isadmin);
});

router.get('/logout', function(req, res, next) {
  req.session = null;
  res.send({});
});

router.post('/password', function(req, res, next) {
  if (req.body.new_password !== req.body.retype_password) {
    res.send('Passwords do not match.')
  } else {
    var password = bcrypt.hashSync(req.body.new_password, 8);
  }
  knex('users')
    .where('email', req.body.email)
    .then(function(data) {
      if (!data.length) {
        res.send('Please enter a valid login.')
      } else if (bcrypt.compareSync(req.body.old_password, data[0].password)) {
        knex('users')
          .where('email', req.body.email)
          .first()
          .update({
            password: password
          }).then(function() {
            res.redirect('/dashboard.html')
          });
      } else {
        res.send('Please enter a valid login.');
      }
    })
});

module.exports = router;
