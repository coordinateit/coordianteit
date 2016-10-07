var express = require('express');
var router = express.Router();
var knex = require('../db/knex');

router.get('/jobsAll', function(req, res, next) {
  if (req.session.id) {
    knex('jobs')
      .then(function(jobs) {
        res.send(jobs);
      })
  }
});

router.get('/visitsAll', function(req, res, next) {
  if (req.session.id) {
    knex('visits')
      .then(function(visits) {
        res.send(visits);
      })
  }
});

router.get('/listView', function(req, res, next) {
  //team
  //start time
  //address
  //job type
  //phone number

  if (req.session.id) {
    knex('jobs')
      .join('visits', 'jobs.id', 'visits.jobs_id')
      .then(function(visits) {
        console.log(visits);
        res.send(visits);
      })
  }
});

module.exports = router;
