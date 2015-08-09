'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.username = req.session.username;
    res.render('quiz');
});

module.exports = router;