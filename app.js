'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var session = require("express-session");
var bodyParser = require('body-parser');
var uuid = require('uuid');
var helmet = require('helmet');
var hpp = require('hpp');
var contentLength = require('express-content-length-validator');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var models = require('./models');
var nconf = require('nconf');
var compression = require('compression');

nconf.file('./config.json');
var mode = process.env.NODE_ENV;
mongoose.connect(nconf.get(mode+':mongoURI'), {safe: true});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

var routes = require('./routes'),
    app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(compression());
app.use(function (req, res, next) {
    if(!models.User || !models.Question) { return next(new Error('No models.')); }
    req.models = models;
    return next();
});
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'RAC5O08yCV8ghsY8G3l9p9a9e00eg7qV',
    resave: false,
    cookie: {
        secure: false,
        httpOnly: true,
        expires: new Date(Date.now() + 14*24*60*60), // + 1 hour
        maxAge: 14*24*60*60
    },
    genid: function (req) {
        return uuid.v4();
    },
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        touchAfter: 24 * 3600, // time period in seconds
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default
        autoRemove: 'interval',
        autoRemoveInterval: 30
    })
}
));
app.use(express.static(path.join(__dirname, 'public')));

// Security middleware
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    defaultSrc: [
        "'self'"
    ]
}));
app.use(hpp());
app.use(contentLength.validateMax({max: 10000, status: 400, message: "Payload too large!"}));
app.use(helmet.hidePoweredBy());

var authorize = function (req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        return res.sendStatus(401);
    }
};

// Pages & routes
app.use('/', routes.home);
app.use('/registerLogin', routes.registerLogin);
app.use('/quiz', authorize, routes.quiz);
app.use('/logout', routes.logout);
app.use('/login', routes.login);
app.use('/register', routes.register);

// RESTful API routes
app.use('/api', routes.api);

// catch requests that fall through and send back 404 response
app.all('*', function (req, res, next) {
   res.sendStatus(404);
});

// error handlers

// development error handler
// will print stacktrace
if (mode === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

module.exports = app;