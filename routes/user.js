"use strict";
var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');
var bcrypt = require('bcrypt');
var knexQueries = require('./lib/knexQueries.js');


////// Lookup customers by date range //////
router.get('/customersByDates/:start/:end', userAuth, function(req, res, next) {
  knexQueries.visitsByDateRange(req.params.start, req.params.end)
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
router.get('/customersByDatesAndTeam/:start/:end/:team', userAuth, function(req, res, next) {
  knexQueries.visitsByDateRangeAndTeam(req.params.start, req.params.end, req.params.team)
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

////// Post new visit //////
router.post('/postVisit', userAuth, function(req, res, next) {
  knex('visits')
    .insert(req.body)
    .then(function() {
      res.send({});
    });
});


////////////////////// ^ NEW FORMAT ^ //////////////////////////


////// Gets jobs based on map position, optionally filtered by team //////
router.post('/jobs', function(req, res, next) {
  if (req.session.id) {
    // var north = JSON.parse(req.body.bounds).north;
    // var south = JSON.parse(req.body.bounds).south;
    // var east = JSON.parse(req.body.bounds).east;
    // var west = JSON.parse(req.body.bounds).west;
      knex('customers')
        .join('visits', 'customers_id', 'customers.id')
        .where(function() {
          if (req.body.team) {
            this.where('team_id', req.body.team)
          }
        })
        .andWhere(function() {
          if (req.body.date) {
            var date = new Date(parseInt(req.body.date));
            let start = date.setHours(0,0,0,0);
            let end = date.setHours(168,0,0,0);
            this.whereBetween('start', [start, end]);
          }
        })
        // .andWhere('lat', '<', north)
        // .andWhere('lat', '>', south)
        // .andWhere('lng', '<', east)
        // .andWhere('lng', '>', west)
        .then(function(customers) {
          res.send(customers);
        })
  }
});


////// Gets visits //////
router.post('/visits', function(req, res, next) {
  if (req.session.id) {
    if (req.body.team) {
      knex('visits')
        .where('team_id', req.body.team)
        .then(function(visits) {
          res.send(visits);
        })
    } else {
      knex('visits')
        .then(function(visits) {
          res.send(visits);
        })
    }
  }
});


////// Get visits for a given job ///////
router.get('/jobVisits/:jobId', function(req, res, next) {
  if (req.session.id) {
    knex('visits')
      .where('customers_id', req.params.jobId)
      .then(function(data) {
        res.send(data);
      })
  }
});


////// Gets a list of teams //////
router.get('/teams', function(req, res, next) {
  if (req.session.id) {
    knex('teams')
      .then(function(teams) {
        res.send(teams);
      });
  }
});


////// Get visits and jobs //////
router.post('/list', function(req, res, next) {
  if (req.session.id) {
      knex('customers')
        .join('visits', 'customers.id', 'visits.customers_id')
        .where(function() {
          if (req.body.team) {
            this.where('team_id', req.body.team);
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
  }
});


////// Get list //////
router.post('/printlist', function(req, res, next) {
  if (req.session.id) {
    var ids = JSON.parse(req.body.list)
    knex('customers')
      .join('visits', 'customers_id', 'customers.id')
      .whereIn('visits.id', ids)
      .then(function(data) {
        res.send(data);
      });
  }
});


////// Customer lookup //////
router.get('/customer/:id', function(req, res, next) {
  if (req.session.id) {
    knex('customers')
      .where('id', req.params.id)
      .then(function(data) {
        res.send(data)
      })
  }
});


////// Get job by ID //////
router.get('/job/:id', function(req, res, next) {
  if (req.session.id) {
    knex('customers')
      .where({ id: req.params.id })
      .first()
      .then(function(customer) {
        res.send(customer);
      })
  }
});


////// Get visit by ID //////
router.get('/visit/:id', function(req, res, next) {
  if (req.session.id) {
    knex('customers')
      .join('visits', 'customers_id', 'customers.id')
      .where('visits.id', req.params.id)
      .first()
      .then(function(visit) {
        res.send(visit)
      });
  }
});


////// Post new customer from Create Page //////
router.post('/newcustomer', function(req, res, next) {
  var lat, lng;
  var address = req.body.address + ', ' + req.body.city + ', ' + req.body.state + ', ' + req.body.zip;
  geocoder.geocode(address, function(err, data) {
    if (!err && data.results[0]) {
      lat = data.results[0].geometry.location.lat;
      lng = data.results[0].geometry.location.lng;
      insert();
    } else {
      res.send('Invalid address.')
    }
  });
  function insert() {
    let data = {
      lat: lat,
      lng: lng,
      customer_name: req.body.customer_name,
      phone_1: req.body.phone_1,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    }
    knex('customers')
      .insert(data)
      .returning('id')
      .then(function(id) {
        res.send(id)
      })
  }
});


////// Post new job //////
router.post('/postJob', function(req, res, next) {
  var lat, lng;
  var address = req.body.address + ', ' + req.body.city + ', ' + req.body.state + ', ' + req.body.zip;
  geocoder.geocode(address, function(err, data) {
    if (!req.body.customer_name) {
      res.send('Please add customer name.')
    }
    if (!err && data.results[0]) {
      lat = data.results[0].geometry.location.lat;
      lng = data.results[0].geometry.location.lng;
      insert();
    } else {
      res.send('Invalid address.')
    }
  });
  function insert() {
    let data = {
      lat: lat,
      lng: lng,
      customer_name: req.body.customer_name,
      email: req.body.email,
      phone_1: req.body.phone_1,
      phone_2: req.body.phone_2,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      customer_type: req.body.job_type,
      notes: req.body.notes
    }
    knex('customers')
      .insert(data)
      .returning('id')
      .then(function(id) {
        knex('customers')
          .where('id', id[0])
          .first()
          .then(function(customer) {
            res.send(customer);
          })
      });
  }
});


////// Update existing customer //////
router.post('/updateCustomer', function(req, res, next) {
  if (req.session.id) {
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
          phone_1: req.body.phone_1,
          phone_2: req.body.phone_2,
          email: req.body.email,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          customer_type: req.body.customer_type,
          referral: req.body.referral,
          notes: req.body.notes
        }).then(function(id) {
          res.send({});
        });
    }
  }
});




////// Update visit //////
router.post('/updateVisit', function(req, res, next) {
  if (req.session.id) {
    console.log(req.body);
    let data = {
      id: req.body.id,
      visit_type: req.body.visit_type,
      start: req.body.start,
      end: req.body.end,
      notes: req.body.notes
    }
    if (req.body.team_id) {
      data.team_id = req.body.team_id
    }
    knex('visits')
      .where('id', req.body.id)
      .update(data)
      .returning('customers_id')
      .then(function(data) {
        res.send(data);
      })
  }
});


////// Address lookup //////
router.post('/geocode', function(req, res, next) {
  if (req.session.id) {
    let address = req.body.address + ", " + req.body.city + ", " + req.body.state + ", " + req.body.zip
    geocoder.geocode(address, function(err, data) {
      if (!err) {
        let coords = {lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng};
        res.send(coords);
      } else {
        res.send('Invalid address.')
      }
    });
  }
});


////// Search jobs //////
router.post('/search', function(req, res, next) {
  if (req.session.id) {
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
  }
});

router.get('/deleteCustomer/:id', function(req, res, next) {
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

router.get('/deleteVisit/:id', function(req, res, next) {
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
  res.send();
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

function userAuth(req, res, next) {
  if (!req.session.id) {
    res.redirect('/');
  } else {
    next();
  }
}

module.exports = router;
