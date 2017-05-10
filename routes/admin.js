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
      });
  }
});


router.get('/user/:id', function(req, res) {
  if (req.session.isadmin) {
    knex('users')
      .where('id', req.params.id)
      .first()
      .then(function(data) {
        res.send(data);
      });
  }
});


router.post('/postUser', function(req, res, next) {
  if (req.session.isadmin) {
    if (!req.body.team_id) {
      var team_id = null;
    } else {
      var team_id = req.body.team_id;
    }
    var email = req.body.email.toLowerCase();
    var password = bcrypt.hashSync(req.body.password, 8);
    knex('users')
      .where('email', req.body.email)
      .then(function(data) {
        if (data.length) {
          res.send('This email is already in use.')
        }
      });
    knex('users')
      .insert({
        email: email,
        password: password,
        name: req.body.name,
        phone: req.body.phone,
        team_id: team_id,
        isadmin: req.body.isadmin
      }).then(function() {
        res.redirect('/admin')
    });
  }
});

router.post('/updateUser/:id', function(req, res, next) {
  if (req.session.isadmin) {
    let user = {
      name: req.body.name,
      phone: req.body.phone,
      team_id: req.body.team_id || null,
      isadmin: req.body.isadmin
    }
    user.email = req.body.email.toLowerCase();
    if (req.body.password) {
      console.log('change password');
      user.password = bcrypt.hashSync(req.body.password, 8);
    }
    console.log(user);
    knex('users')
      .where('id', req.params.id)
      .update(user).then(function() {
        res.send({success: "The user has been updated."})
    });
  }
});


router.get('/deleteUser/:id', function(req, res) {
  if (req.session.isadmin) {
    knex('users')
      .where('id', req.params.id)
      .del()
      .then(function() {
        res.send({});
      })
  }
});


router.post('/postTeam', function(req, res, next) {
  if (req.session.isadmin) {
    console.log(req.body);
    knex('teams')
      .insert({
        team_name: req.body.team_name,
        vehicle: req.body.vehicle
      })
      .then(function() {
        res.send({})
      })
  }
});

router.post('/saveTeam', function(req, res, next) {
  if (req.session.isadmin) {
    knex('teams')
      .where('id', req.body.id)
      .update({
        team_name: req.body.team_name,
        vehicle: req.body.vehicle
      })
      .then(function() {
        res.send({})
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


router.get('/teamMembers/:teamId', function(req, res, next) {
  if (req.session.isadmin) {
    knex('users')
      .where('team_id', req.params.teamId)
      .then(function(data) {
        res.send(data);
      })
  }
});


router.get('/deleteTeam/:teamId', function(req, res, next) {
  if (req.session.isadmin) {
    knex('users')
      .where('team_id', req.params.teamId)
      .then(function(members) {
        if (members.length) {
          res.send({ error: "This team still has members assigned." });
        } else {
          knex('visits')
            .where('team_id', req.params.teamId)
            .then(function(teams) {
              if (teams.length) {
                res.send({ error: "This team still has visits assigned." });
              } else {
                knex('teams')
                  .where('id', req.params.teamId)
                  .del()
                  .then(function() {
                    res.send({ okay: "The team has been deleted." });
                  });
              }
            });

        }
      });
  }
});


module.exports = router;
