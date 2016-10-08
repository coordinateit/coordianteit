var express = require('express');
var router = express.Router();
var knex = require('../db/knex');

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

// router.post('/postJob', function(req, res, next) {
//
// });

module.exports = router;
