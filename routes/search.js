"use strict";
var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var geocoder = require('geocoder');
var bcrypt = require('bcrypt');
var knexQueries = require('./lib/knexQueries.js');
var auth = require('./lib/auth.js');


//////  //////
router.get('/allCustomers', auth.userAuth, function(req, res, next) {
  knex('customers')
    .then(function(data) {
      res.send(data);
    });
});

//////  //////
router.post('/geocode', auth.userAuth, function(req, res, next) {
  let address = req.body.address + ", " + req.body.city + ", " + req.body.state + ", " + req.body.zip;
  geocoder.geocode(address, function(err, data) {
    if (!err && data.results.length) {
      let lat = data.results[0].geometry.location.lat;
      let lng = data.results[0].geometry.location.lng;
      res.send({ lat: lat, lng: lng })
    } else {
      res.send({ error: "Invalid address." })
    }
  });
});


module.exports = router;
