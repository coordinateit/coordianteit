"use strict";
var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');
var bcrypt = require('bcrypt');
var knexQueries = require('./lib/knexQueries.js');
var auth = require('./lib/auth.js');


////// Gets customer by visit ID //////
router.get('/customerVisit/:id', auth.userAuth, function(req, res, next) {
  knexQueries.visitById(req.params.id)
    .then(function(visit) {
      knexQueries.customerById(visit.customers_id)
        .then(function(customer) {
          res.send(customer);
        })
    });
});

////// Gets jobs based on map position, optionally filtered by team //////
router.post('/customers', auth.userAuth, function(req, res, next) {
  knexQueries.customersForDashboard(req.body)
    .then(function(customers) {
      res.send(customers);
    });
});

////// Gets visits //////
router.post('/visits', auth.userAuth, function(req, res, next) {
  let team;
  if (req.body.team) {
    team = req.body.team;
  } else {
    team = null;
  }
  knexQueries.visits(team).then(function(visits) {
    res.send(visits);
  });
});


module.exports = router;
