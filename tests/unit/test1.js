define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var dashboard = require('src/dashboard');

    registerSuite({
        name: 'dashboard',

        getTeamList: function () {
            assert.ok(dashboard.getTeamList(),
                'should return a list of visits');

        }
    });
});
