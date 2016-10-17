"use strict";

var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var bcrypt = require('bcrypt');

router.get('/users', function(req, res, next) {
  if (req.session.isadmin) {
    knex('users')
      .then(function(data) {
        res.send(data);
      })
  }
});


router.post('/postUser', function(req, res, next) {
  if (req.session.isadmin) {
    var password = bcrypt.hashSync(req.body.password, 8);
    knex('users')
      .insert({
        email: req.body.email,
        password: password,
        name: req.body.name,
        phone: req.body.phone,
        team_id: req.body.team_id,
        isadmin: req.body.isadmin
      }).then(function() {
        res.redirect('/admin.html')
    });
  }
});


router.post('/postTeam', function(req, res, next) {
  if (req.session.isadmin) {
    knex('teams')
      .insert({
        team_name: req.body.team_name,
        vehicle: req.body.vehicle
      })
      .then(function() {
        res.redirect('/admin.html')
      })
  }
});


router.get('/team/:id', function(req, res, next) {
  if (req.session.isadmin) {
    knex('teams')
      .where('id', req.params.id)
      .first()
      .then(function(data) {
        res.send(data)
      })
  }
});

module.exports = router;
