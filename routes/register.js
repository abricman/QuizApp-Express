'use strict';

var express = require('express');
var router = express.Router();
var validator = require('validator');
var csrf = require('csurf');
var bcrypt = require('bcryptjs');
var async = require('async');
var request = require('request');

router.use(csrf());

router.post('/', function(req, res, next) {
    var email = req.body.regEmail,
        username = req.body.regUsername,
        password = req.body.regPassword,
        confirmPassword = req.body.confirmRegPassword,
        errors = [];

    // Validation
    if (!email || !username || !password || !confirmPassword) {
        errors.push("Please enter your registration data.");
        res.locals.regErrors = errors;
        res.render('registerLogin');
    }

    if (!validator.isEmail(email)) { errors.push("Provide a valid email"); }
    if (!validator.equals(password, confirmPassword)) { errors.push("Passwords do not match"); }
    if (!validator.isAlphanumeric(username)) { errors.push("Username is not alphanumeric"); }
    if (!validator.isLength(username, 3, 15)) { errors.push("Username should be 3 to 15 characters long"); }
    if (!validator.isLength(password, 3, 25)) { errors.push("Password should be 3-25 characters long"); }

    async.waterfall([
        // Check if user already exists
        function (callback) {
            req.models.User.findOne({_id: username}, function (err, user) {
                if (user) { errors.push("Username already exists"); }
                if (errors.length !==0) {
                    res.locals.regErrors = errors;
                    return res.render('registerLogin');
                }
                callback(null);
            });
        },
        // Create salt
        function (callback) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) { return next(err); }
                callback(null, salt);
            });
        },
        // Hash the password with the salt
        function (salt, callback) {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) { return next(err); }
                callback(null, hash);
            });
        },
        // Save user to database
        function (hash) {
            var user = new req.models.User({
                _id: username,
                email: email,
                password: hash,
                quizResults: []
            });
            user.save(function (err) {
                if (err) { return next(err); }
                req.session.username = username;
                req.session.isAuthenticated = true;
                return res.redirect('/quiz');
            });
        }
    ]);
});

module.exports = router;