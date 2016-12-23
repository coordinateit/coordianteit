"use strict";
var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');
var bcrypt = require('bcrypt');
var knexQueries = require('./lib/knexQueries.js');
var auth = require('./lib/auth.js');


////// Gets jobs based on map position, optionally filtered by team //////
router.post('/customers', auth.userAuth, function(req, res, next) {
  knexQueries.customersForDashboard(req.body)
    .then(function(customers) {
      res.send(customers);
    })
});


module.exports = router;
