'use strict';

var cheerio = require('cheerio');
var models = require('./../models');
var mongoose = require('mongoose');
var async = require('async');

/**
 * @desc Makes a get request with the passed in agent, extracts token and returns it along with the agent
 * @param {agent} agent - instance of superagent
 * @param {function} done
 */
exports.getRegisterLogin = function (agent, done) {
    agent
        .get('/registerLogin')
        .end(function (err, res) {
            if (err) { return done(err); }
            var $ = cheerio.load(res.text);
            var csrfToken = $('input[name="_csrf"]').first().attr('value');
            done(null, agent, csrfToken);
        });
};

exports.populateDB = function (done) {
    var questions = require('../seeds/questions.json');
    var users = require('../seeds/users.json');

    async.series([
        // Populate questions
        function (callback) {
            models.Question.create(questions, function (err) {
                if (err) { callback(err); }
                callback(null);
            });
        },
        // Populate users
        function (callback) {
            models.User.create(users, function (err) {
                if (err) { throw err; }
                callback(null);
            });
        }
    ], function (err) {
        if (err) { throw err; }
        done();
    });
};

exports.cleanupDB = function (done) {
    async.series([
        // Remove all records from users collection
        function (callback) {
            models.User.remove({}, function (err) {
                if (err) { callback(err); }
                callback(null);
            });
        },
        // Remove all records from questions collection
        function (callback) {
            models.Question.remove({}, function (err) {
                if (err) { callback(err); }
                callback(null);
            });
        },
        // Remove all records from sessions collection
        function (callback) {
            mongoose.connection.collection('sessions').remove({}, function (err, result) {
                if (err) { callback(err); }
                callback(null);
            });
        }
    ], function (err) {
        if (err) { throw err; }
        done();
    });
};