define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');

  registerSuite({
    name: 'index',

    'login test': function () {
      return this.remote

      .get(require.toUrl('http://localhost:3000/'))
      			.setFindTimeout(5000)
            .findById('email')
            .click()
            .type('user@user.com')
            .end()
            .findById('password')
            .click()
            .type('password')
            .end()
            .setFindTimeout(10000)
            .findById('signin')
            .click()
            .end()
            .setFindTimeout(5000)
            .findById('testLogin')
            .getVisibleText()
             .then(function (text) {
                 assert.strictEqual(text, 'user@user.com',
                     'Valid username and password should log in successfully');
             });
          }
        });
      });
