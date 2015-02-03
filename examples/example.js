'use strict';

var mongoose = require('../node_modules/mongoose');
var im = require('../is-master.js');

// Start the mongoose db connection
mongoose.connect('mongodb://127.0.0.1:27017/im', function(err) {
    if (err) {
        console.error('\x1b[31m', 'Could not connect to MongoDB!');
        throw (err);
    }
});

// Start the is-master worker
im.start();

// Check if this current process is the master
setInterval(function() {
    im.isMaster(function(err, results) {
        if (err) return console.error(err);
        console.log(results);
    });
}, 5000);
