'use strict'

const expect = require("chai").expect
const dashboard = require('../src/js/dashboard.js')

describe('#getTeamList', function() {
  it('is an array', function() {
    expect(typeof(dashboard.getTeamList).to.equal('array'));
  });
});
