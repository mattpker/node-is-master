is-master
=========

[![Build Status](https://travis-ci.org/mattpker/node-is-master.svg)](https://travis-ci.org/mattpker/node-is-master) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mattpker/node-is-master?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Find the master node process in a multi server cluster.

This module finds the master node in a cluster by inserting the nodes in a mongodb and choosing the master by which node is the oldest. Each node checks into mongodb on a set timeout (default 1 minute). If the master node dies for whatever reason, mongodb will expire the record and the next node in line will become the master. Mongoose and a connection to a mongodb database is REQUIRED for is-master to work.

Use cases for this module:
* If you run your node cluster with a cluster manager like PM2 or even if you run your clusters on multiple servers (they just need to all report into the same mongodb), you can find which node process is the master.
* This will allow you to assign one node process as the master so that it can run tasks that should only be ran by one process, such as scheduled tasks and database cleanup.

## Installation

    npm install is-master

## Usage / Examples
```
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

// Check if this current process is the master using the im.master method, this method only updates every time the process checks in
setInterval(function() {
        console.log('Variable master: ', im.master);
}, 5000);

// Event emmiters that you can listen for
im.on('connected', function() {
    console.log('The is-master worker has connected and insterted into mongodb.');
});

im.on('synced', function() {
    console.log('The is-master worker has synced to mongodb.');
});

im.on('changed', function() {
    console.log('The master variable has changed');
});

im.on('master', function() {
    console.log('The process has been promoted to master');
});

im.on('slave', function(){
    console.log('The process has been demoted to slave');
});
```

## Options

When starting the worker, you can specify options in an object to update the default values.

    im.start({
        timeout: 120, // How often the nodes check into the database. This value is in seconds, default 60.
        hostname: 'devServer1', // Sets the hostname of the node, without this value it will get the hostname using os.hostname.
        collection: 'proc' // The mongodb collection is-master will use. Please note that by default mongoose adds an 's' to the end to make it plural. Default value is 'node'.
    });

## FAQ

Q. I updated the timeout option, but mongodb is not expiring the node in that timeout specified.

A. 60 seconds is added to the mongodb expire timeout to ensure the master has time to checkin. Also please note, if this value is changed from the initial creation of the table, it will not be able to update the index. You will need to delete the table and then restart your server to re-create it.

## More info

http://mattpker.com/2015/08/07/How-to-schedule-jobs-in-NodeJS/

## Tests

    npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 1.2.1 Added blog posting to README.md for more information
* 1.2.0 Added EventEmitter's for more functionality
* 1.1.4 Better performance and resliancy in high-concurrency settings ([#5](https://github.com/mattpker/node-is-master/pull/6), Thanks to @bendalton)
* 1.1.3 Fixed critical infinite loop when there are duplicate start dates, resulting in elevated CPU and rapid log growth. All users are urged to upgrade. ([#4](https://github.com/mattpker/node-is-master/issues/4), Thanks to @markstos)
* 1.1.2 Removed unnecessary dev dependencies
* 1.1.1 Fixed the tests to mock mongoose
* 1.1.0 Added option for changing the collection
* 1.0.0 Initial release
