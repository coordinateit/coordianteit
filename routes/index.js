"use strict";
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../db/knex');
var knexQueries = require('./lib/knexQueries');
var auth = require('./lib/auth');
var timeFunctions = require('./lib/timeFunctions');



////// Route to landing page //////
router.get('/', function(req, res, next) {
  res.sendfile('./html/index.html');
});

////// Route to dashboard page //////
router.get('/dashboard', auth.userAuth, function(req, res, next) {
  res.sendfile('./html/dashboard.html');
});

////// Route to create page //////
router.get('/create', auth.userAuth, function(req, res, next) {
  res.sendfile('./html/create.html');
});

////// Route to edit page //////
router.get('/edit/:id', auth.userAuth, function(req, res, next) {
  knexQueries.customerById(req.params.id)
    .then((customer) => knexQueries.visitsByCustomer(req.params.id)
      .then((visits) => res.render('edit', { customer: customer,
                                            visits: timeFunctions.timeFormat(visits) })))
});

////// Route to list page //////
router.get('/list', auth.userAuth, function(req, res, next) {
  res.sendfile('./html/list.html');
});

////// Route to user page //////
router.get('/user', auth.userAuth, function(req, res, next) {
  res.sendfile('./html/user.html');
});

////// Route to search page //////
router.get('/search', auth.userAuth, function(req, res, next) {
  res.sendfile('./html/search.html');
});

////// Route to admin page //////
router.get('/admin', auth.adminAuth, function(req, res, next) {
  res.sendfile('./html/admin.html');
});

////// Query database for user info, start cookie session if valid //////
router.post('/login', function(req, res, next) {
  knex('users')
    .where({ email: req.body.email })
    .first()
    .then(function(data) {
      if (!data) {
        res.send('That login is invalid.');
      }
      if (bcrypt.compareSync(req.body.password, data.password)) {
        req.session.id = data.id;
        req.session.isadmin = data.isadmin;
        res.redirect('/dashboard');
      } else {
        res.send('That login is invalid');
      }
  });
});

////// Logout route //////
router.get('/logout', function(req, res, next) {
  req.session = null;
  res.send({});
});


module.exports = router;
