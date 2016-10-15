var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');


////// Gets jobs based on map position, optionally filtered by team //////

router.post('/jobs', function(req, res, next) {
  if (req.session.id) {
    var north = JSON.parse(req.body.bounds).north;
    var south = JSON.parse(req.body.bounds).south;
    var east = JSON.parse(req.body.bounds).east;
    var west = JSON.parse(req.body.bounds).west;
    if (req.body.team) {
      knex('jobs')
        .join('visits', 'jobs_id', 'jobs.id')
        .where('team_id', req.body.team)
        .andWhere('lat', '<', north)
        .andWhere('lat', '>', south)
        .andWhere('lng', '<', east)
        .andWhere('lng', '>', west)
        .then(function(jobs) {
          res.send(jobs);
        })
    } else {
      knex('jobs')
        .where('lat', '<', north)
        .andWhere('lat', '>', south)
        .andWhere('lng', '<', east)
        .andWhere('lng', '>', west)
        .then(function(jobs) {
          res.send(jobs);
        })
    }
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


////// Gets a list of teams //////

router.get('/teams', function(req, res, next) {
  if (req.session.id) {
    knex('teams')
      .then(function(teams) {
        res.send(teams);
      });
  } else {
    res.redirect('/');
  }
});


////// Get visits and jobs //////

router.get('/listView', function(req, res, next) {
  if (req.session.id) {
    knex('jobs')
      .join('visits', 'jobs.id', 'visits.jobs_id')
      .then(function(visits) {
        res.send(visits);
      })
  }
});


////// Get job by ID //////

router.get('/job/:id', function(req, res, next) {
  if (req.session.id) {
    knex('jobs')
      .where({id: req.params.id})
      .first()
      .then(function(job) {
        res.send(job);
      })
  }
});


////// Get visit by ID //////

router.get('/visit/:id', function(req, res, next) {
  if (req.session.id) {
    console.log(req.params.id);
    knex('jobs')
      .join('visits', 'jobs_id', 'jobs.id')
      .where('visits.id', req.params.id)
      .first()
      .then(function(visit) {
        res.send(visit)
      });
  }
});


////// Post new job //////

router.post('/postJob', function(req, res, next) {
  var lat, lng, start, end;
  var address = req.body.address + ', ' + req.body.city + ', ' + req.body.state + ', ' + req.body.zip;
  geocoder.geocode(address, function(err, data) {
    if (!err) {
      lat = data.results[0].geometry.location.lat;
      lng = data.results[0].geometry.location.lng;
      timeParse();
    } else {
      res.send('Invalid address.')
    }
  });
  function timeParse() {
    if (req.body.job_date && req.body.start_time && req.body.end_time) {
      start = Date.parse(req.body.job_date + ', ' + req.body.start_time);
      end = Date.parse(req.body.job_date + ', ' + req.body.start_time);
      insert();
    } else {
      res.send('Invalid date and time.')
    }
  }
  function insert() {
    knex('jobs')
      .insert({
        lat: lat,
        lng: lng,
        start: start,
        end: end,
        customer_name: req.body.customer_name,
        po_number: req.body.po_number,
        email: req.body.email,
        phone_number: req.body.phone_number,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        job_type: req.body.jobtype,
        team_id: req.body.team_id,
        priority: req.body.priority,
        notes: req.body.notes
      })
      .then(function() {
        res.redirect('/dashboard.html');
      });
  }
});


////// Search jobs //////

router.post('/search', function(req, res, next) {
  if (req.session.id) {
    var search = JSON.parse(req.body.search);
    var lat, lng, fromDate, toDate;

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
        let address = search.address + ", " + search.city + ", " + search.state + ", " + search.zip;
        geocoder.geocode(address, function(err, data) {
          if (!err) {
            lat = data.results[0].geometry.location.lat;
            lng = data.results[0].geometry.location.lng;
            searchQuery();
          } else {
            res.send('Invalid address.');
          }
        });
        search.address = null;
        search.city = null;
        search.state = null;
        search.zip = null;
      } else {
        searchQuery();
      }
    }

    function searchQuery() {
      knex('visits')
        .join('jobs', 'visits.jobs_id', 'jobs.id')
        .where(function() {
          if (search.customer_name) {
            this.where('customer_name', search.customer_name)
          }
        }).andWhere(function() {
          if (search.po) {
            this.where('po', search.po)
          }
        }).andWhere(function() {
          if (search.priority) {
            this.where('priority', search.priority)
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
            this.where('lat', '<', (lat + search.radius/200))
              .andWhere('lat', '>', (lat - search.radius/200))
              .andWhere('lng', '<', (lng + search.radius/200))
              .andWhere('lng', '>', (lng - search.radius/200))
          }
        // }).andWhere(function() {
        //   if (search.notes) {
        //     // write where in
        //   }
        })
        .then(function(data) {
          res.send(data);
        })
    }
  }
});


// router.get('/test', function(req, res, next) {
//   if (req.session.id) {
//     knex('users')
//       .where({id: req.session.id})
//       .first()
//       .then(function(user) {
//         res.send({email: user.email});
//       });
//   }
// });


module.exports = router;
