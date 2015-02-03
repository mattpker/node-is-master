'use strict';

var expect = require("../node_modules/chai").expect;
var mongoose = require('../node_modules/mongoose');
var im = require('../is-master.js');

// Bootstrap db connection
mongoose.connect('mongodb://127.0.0.1:27017/im', function(err) {
    if (err) {
        console.error('\x1b[31m', 'Could not connect to MongoDB!');
        throw (err);
    }
});

describe("is-master", function() {
    it("should start the worker", function(done) {
        im.start();
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
