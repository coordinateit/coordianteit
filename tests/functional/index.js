define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');

  registerSuite({
    name: 'index',

    'testing test': function () {
      return this.remote
      .get(require.toUrl('http://localhost:3000/'))
        .setFindTimeout(5000)
        .getPageTitle()
        .then(function(title) {
          assert.strictEqual(title, 'CoordinateIt',
            'Title should be "CoordinateIt"');
        });
    },

    'login test': function () {
      return this.remote
      .get(require.toUrl('http://localhost:3000/'))
        .setFindTimeout(10000)
        .findById('signin')
        .then(function(button) {
          assert.ok(button,
            'Button should exist');
        });
    },

    // 'login test': function () {
    //   return this.remote
    //   .get(require.toUrl('http://localhost:3000/'))
    //     .setFindTimeout(5000)
    //     .findById('email')
    //     .click()
    //     .type('user@user.com')
    //     .end()
    //     .findById('password')
    //     .click()
    //     .type('password')
    //     .end()
    //     .setFindTimeout(5000)
    //     .findById('signin')
    //     .click()
    //     .end()
    //     .setFindTimeout(5000)
    //     .getPageTitle()
    //     .then(function(title) {
    //       assert.ok(title, 'CoordinateIt Dashboard',
    //         'Successful login should navitage to dashboard');
    //     });
    // }
  });
});
