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

module.exports = router;
