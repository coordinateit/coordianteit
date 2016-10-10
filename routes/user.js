var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');

// RETURNS ALL JOBS -- NOT CURRENTLY BEING USED
router.get('/jobsAll', function(req, res, next) {
  if (req.session.id) {
    knex('jobs')
      .then(function(jobs) {
        res.send(jobs);
      })
  }
});

// RETURNS JOBS BASED ON MAP POSITION
router.post('/jobs', function(req, res, next) {
  if (req.session.id) {
    var north = JSON.parse(req.body.bounds).north;
    var south = JSON.parse(req.body.bounds).south;
    var east = JSON.parse(req.body.bounds).east;
    var west = JSON.parse(req.body.bounds).west;
    knex('jobs')
      .where('lat', '<', north)
      .andWhere('lat', '>', south)
      .andWhere('lng', '<', east)
      .andWhere('lng', '>', west)
      .then(function(jobs) {
        res.send(jobs);
      })
  }
});

// RETURNS ALL VISITS
router.get('/visitsAll', function(req, res, next) {
  if (req.session.id) {
    knex('visits')
      .then(function(visits) {
        res.send(visits);
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

module.exports = router;
