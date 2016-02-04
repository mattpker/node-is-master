'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    EventEmitter = require("events").EventEmitter,
    os = require('os');

function im() {
    EventEmitter.call(this);
}

// Inherit the EventEmitter into our im prototype
util.inherits(im, EventEmitter);

/**
 * Sets the default variables
 */
im.prototype.master = false;
im.prototype.collection = 'node';
im.prototype.hostname = os.hostname();
im.prototype.pid = process.pid;
im.prototype.versions = process.versions;
im.prototype.id = null;
im.prototype.timeout = 60;

/**
 * Function initializes options, does some basic option verification and starts is-master
 */
im.prototype.start = function(options) {
    if (options) {
        if (options.timeout) {
            options.timeout = parseInt(options.timeout, 10);
            if (isNaN(options.timeout)) throw 'im: timeout is not a number!';
        }

        util._extend(this, options);
    }
    this.mongooseInit();
    this.startWorker();
};

/**
 * Function initializes the mongoose table, schema, and model
 */
im.prototype.mongooseInit = function() {
    var imSchema = new Schema({
        hostname: {
            type: String,
            trim: true,
            default: '',
        },
        pid: {
            type: Number,
        },
        versions: {
            type: Object,
        },
        memory: {
            type: Object,
        },
        uptime: {
            type: Number,
        },
        startDate: {
            type: Date,
            default: Date.now,
            index: {
                unique: true
            }
        },
        updateDate: {
            type: Date,
            default: Date.now,
            index: {
                expires: this.timeout + 60
            }
        }
    });

    // ensure we aren't attempting to redefine a collection that already exists
    if (mongoose.models.hasOwnProperty(this.collection)) {
        this.imModel = mongoose.model(this.collection);
    } else{
        this.imModel = mongoose.model(this.collection, imSchema);
    }

    this.worker = new this.imModel({
        hostname: this.hostname,
        pid: this.pid,
        versions: this.versions,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        startDate: new Date(),
        updateDate: new Date()
    });
};

/**
 * Function saves the worker in the db and updates it
 */
im.prototype.startWorker = function() {
    var _this = this;
    this.worker.save(function(err, worker) {
        if (err) {
            if (err.code === 11000) {
                _this.worker.startDate = new Date();
                _this.worker.updateDate = new Date();
                return _this.startWorker();
            } else {
                throw err;
            }
        }
        _this.id = worker._id;
        _this.isMaster(function(err, results) {
            if (err) return console.error(err);
            _this.master = results;
            _this.emit('connected');
            if (_this.master) {
                _this.emit('master');
            } else {
                _this.emit('slave');
            }
            _this.process();
        });
    });
};

/**
 * Function that runs the worker that checks in whith the DB
 */
im.prototype.process = function() {
    var _this = this;
    // Update this node in the cluster every x timeout
    setInterval(function() {
        _this.imModel.update({
            _id: _this.id
        }, {
            hostname: _this.hostname,
            pid: _this.pid,
            versions: _this.versions,
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            updateDate: new Date()
        }, {
            upsert: true // handle event where document was deleted
        }, function(err, results) {
            if (err) return console.error(err);
            _this.emit('synced');
            _this.isMaster(function (err, results) {
                if (err) return console.error(err);
                if (results !== _this.master) {
                    _this.master = results;
                    _this.emit('changed');
                    if (_this.master) {
                        _this.emit('master');
                    } else {
                        _this.emit('slave');
                    }
                }
            });
        });
    }, _this.timeout * 1000);
};

/**
 * Function returns true/false if the node proc is the master (the oldest node in the cluster)
 */
im.prototype.isMaster = function(callback) {
    var _this = this;
    if (this.id) {
        this.imModel.findOne({}, {
            id: 1
        }, {
            sort: {
                startDate: 1
            }
        }, function(err, results) {
            if (err) return callback(err);

            if(!results){
              return callback(err, false);
            } else if (results._id.toString() === _this.id.toString()) {
                callback(err, true);
            } else {
                callback(err, false);
            }
        });
    } else {
        callback(null, false);
    }
};

/**
 * Expose im
 */
module.exports = new im();
