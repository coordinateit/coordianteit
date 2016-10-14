var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');


// RETURNS JOBS BASED ON MAP POSITION

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


// RETURNS VISITS

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


// GETS A LIST OF TEAMS

router.get('/teams', function(req, res, next) {
  if (req.session.id) {
    knex('teams')
      .then(function(teams) {
        res.send(teams);
      })
  }
});


// RETURNS VISITS COMBINED WITH JOBS TABLE

router.get('/listView', function(req, res, next) {
  if (req.session.id) {
    knex('jobs')
      .join('visits', 'jobs.id', 'visits.jobs_id')
      .then(function(visits) {
        res.send(visits);
      })
  }
});


// GETS A SINGLE JOB BY ID

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


router.get('/visit/:id', function(req, res, next) {
  if (req.session.id) {
    knex('jobs')
      .join('visits', 'jobs_id', 'jobs.id')
      .where('visits.id', req.params.id)
      .first()
      .then(function(visit) {
        res.send(visit)
      });
  }
});


// POST NEW JOB TO JOBS TABLE

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
