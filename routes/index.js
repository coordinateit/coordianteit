"use strict";
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../db/knex');


////// Query database for user info, start cookie session if valid //////
router.post('/login', function(req, res, next) {
  knex('users')
    .where({email: req.body.email})
    .first()
    .then(function(data) {
      if (!data) {
        res.send('That login is invalid.');
      }
      if (bcrypt.compareSync(req.body.password, data.password)) {
        req.session.id = data.id;
        req.session.isadmin = data.isadmin;
        res.redirect('/dashboard.html');
      } else {
        res.send('That login is invalid');
      }
  });
});


router.post('/signout', function(req, res, next) {
  req.session = null;
  res.redirect('/');
});


module.exports = router;
