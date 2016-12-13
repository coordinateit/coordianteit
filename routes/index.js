"use strict";
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../db/knex');


////// Route to landing page //////
router.get('/', function(req, res, next) {
  res.sendfile('./html/index.html');
});

////// Route to dashboard page //////
router.get('/dashboard', userAuth, function(req, res, next) {
  res.sendfile('./html/dashboard.html');
});

////// Route to create page //////
router.get('/create', userAuth, function(req, res, next) {
  res.sendfile('./html/create.html');
});

////// Route to edit page //////
router.get('/edit/:id', userAuth, function(req, res, next) {
  knex('customers')
    .where('id', req.params.id)
    .first()
    .then(function(customer) {
      res.render('edit', { customer: customer });
    })
});

////// Route to list page //////
router.get('/list', userAuth, function(req, res, next) {
  res.sendfile('./html/list.html');
});

////// Route to user page //////
router.get('/user', userAuth, function(req, res, next) {
  res.sendfile('./html/user.html');
});

////// Route to search page //////
router.get('/search', userAuth, function(req, res, next) {
  res.sendfile('./html/search.html');
});

////// Route to admin page //////
router.get('/admin', adminAuth, function(req, res, next) {
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

////// Signout //////
router.post('/signout', function(req, res, next) {
  req.session = null;
  res.redirect('/');
});

function userAuth(req, res, next) {
  if (!req.session.id) {
    res.redirect('/');
  } else {
    next();
  }
}

function adminAuth(req, res, next) {
  if (!req.session.isadmin) {
    console.log("not an admin");
    res.redirect('/');
  } else {
    next();
  }
}


module.exports = router;
