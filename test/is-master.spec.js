'use strict';

var chai = require("../node_modules/chai");
var expect = chai.expect;
var mongoose = require('../node_modules/mongoose');
var mongooseMock = require('mongoose-mock');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("is-master", function() {

    var im;

    beforeEach(function() {
        im = proxyquire('../is-master.js', {
            'mongoose': mongooseMock
        });
    });

    it("should start the worker", function(done) {
        im.start({
            collection: 'testcol',
            hostname: 'testhost',
            timeout: 120
        });
        done();
    });
    it("should return if it is the master", function(done) {
        im.isMaster(function(err, results) {
            expect(err).to.be.null;
            expect(results).to.be.a('boolean');
            done();
        });
    });
});
