"use strict";
var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');
var bcrypt = require('bcrypt');
var knexQueries = require('./lib/knexQueries.js');
var auth = require('./lib/auth.js');


//////  //////
router.get('/allCustomersVisits', auth.userAuth, function(req, res, next) {
  knexQueries.customersVisitsAll()
    .then(function(customers) {
      console.log(customers);
      res.send(customers);
    });
});


module.exports = router;
