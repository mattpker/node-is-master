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

// Check if this current process is the master using the callback method
setInterval(function() {
    im.isMaster(function(err, results) {
        if (err) return console.error(err);
        console.log('Callback master: ', results);
    });
}, 5000);

// Check if this current process is the master using the variable method
setInterval(function() {
        console.log('Variable master: ', im.master);
}, 5000);

// Event Emitters that you can listen for
im.on('connected', function() {
    console.log('The is-master worker has connected and insterted into mongodb.');
});

im.on('synced', function() {
    console.log('The is-master worker has synced to mongodb.');
});

im.on('changed', function() {
    console.log('The master value has changed');
});

im.on('master', function() {
    console.log('The process has been promoted to master');
});

im.on('slave', function(){
    console.log('The process has been demoted to slave');
});
