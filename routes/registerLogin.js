'use strict';

var express = require('express');
var csrf = require('csurf');
var router = express.Router();

router.use(csrf());

router.get('/', function(req, res, next) {
    res.render('registerLogin', {csrfToken: req.csrfToken()});
});

module.exports = router;