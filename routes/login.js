'use strict';

var express = require('express');
var router = express.Router();
var validator = require('validator');
var csrf = require('csurf');
var bcrypt = require('bcryptjs');
var async = require('async');

router.use(csrf());

router.post('/', function(req, res, next) {
    var username = req.body.loginUsername.trim(),
        password = req.body.loginPassword.trim(),
        errors = [];

    if (!username || !password) {
        errors.push("Please enter your login data.");
        res.locals.loginErrors = errors;
        return res.render('registerLogin');
    }

    // Validation
    if (!validator.isAlphanumeric(username)) { errors.push("Username is not alphanumeric"); }
    if (!validator.isLength(username, 3, 15)) { errors.push("Username should be 3-15 characters long"); }
    if (!validator.isLength(password, 3, 25)) { errors.push("Password should be 3-25 characters long"); }

    if (errors.length !==0) {
        res.locals.loginErrors = errors;
        return res.render('registerLogin');
    }

    async.waterfall([
        // Find user in DB
        function (callback) {
            req.models.User.findOne({_id: username}, function (err, user) {
                if (err) { return next(err); }
                if (!user) {
                    errors.push("Incorrect username or password");
                    res.locals.loginErrors = errors;
                    return res.render('registerLogin');
                }
                callback(null, user);
            });
        },
        // Check if passwords match
        function (user, callback) {
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) { return next(err); }
                if (!isMatch) {
                    errors.push("Incorrect username or password");
                    res.locals.loginErrors = errors;
                    return res.render('registerLogin');
                }
                req.session.username = username;
                req.session.isAuthenticated = true;
                res.redirect('/quiz');
            });
        }
    ]);
});

module.exports = router;