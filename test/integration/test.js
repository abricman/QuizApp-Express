'use strict';

var should = require('chai').should();
var app = require('../../app');
var request = require('supertest')(app);
var cheerio = require('cheerio');
var helpers = require('../helpers');
var mongoose = require('mongoose');
var async = require('async');

var existingUser = {
    username: 'andrej',
    password: 'andrej15',
    email: 'andrej@andrej.si'
};

var newUser = {
    username: 'john',
    password: 'john15',
    email: 'john@john.si'
};

describe('routes', function () {

    before(function (done) {
       helpers.cleanupDB(done);
    });

    describe('/home', function () {

        it('should respond to GET with 200 status', function (done) {
            request.get('/').expect(200, done);
        });

    });

    describe('/registerLogin', function () {

        it('should respond to GET with 200 status', function (done) {
            request.get('/registerLogin').expect(200, done);
        });

    });

    describe('/login', function () {

        before(function (done) {
            helpers.populateDB(done);
        });

        after(function (done) {
            helpers.cleanupDB(done);
        });

        it('should log in the user with the correct credentials and redirect to /quiz', function (done) {
            var agent = require('supertest').agent(app);
            var test = function (err, agent, csrfToken) {
                if (err) { throw err; }
                agent
                    .post('/login')
                    .type('form')
                    .send({
                        _csrf: csrfToken,
                        loginUsername: existingUser.username,
                        loginPassword: existingUser.password
                    })
                    .end(function (err, res) {
                        err.status.should.equal(302);
                        res.header.location.should.be.equal('/quiz');
                        res.header['set-cookie'][0].split('=')[0].should.equal('connect.sid');
                        done();
                    });
            };
            helpers.getRegisterLogin(agent, test);
        });

        it('should render /registerLogin with 3 error alerts when inputs are too short and username is not alphanumeric', function (done) {
            async.waterfall([
                // GET /registerLogin and extract csrf token value
                function (callback) {
                    var agent = require('supertest').agent(app);
                    helpers.getRegisterLogin(agent, callback);
                },
                // Authenticate
                function (agent, csrfToken, callback) {
                    agent
                        .post('/login')
                        .type('form')
                        .send({
                            _csrf: csrfToken,
                            loginUsername: '#',
                            loginPassword: 'a'
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            var $ = cheerio.load(res.text);
                            $('div.alert').length.should.equal(3);
                            callback(null);
                        });
                }
            ], function (err) {
                if (err) { throw err; }
                done();
            });
        });

        it('should render /registerLogin with "Incorrect username or password" error alert for incorrect credentials', function (done) {
            async.waterfall([
                // GET /registerLogin and extract csrf token value
                function (callback) {
                    var agent = require('supertest').agent(app);
                    helpers.getRegisterLogin(agent, callback);
                },
                // Authenticate
                function (agent, csrfToken, callback) {
                    agent
                        .post('/login')
                        .type('form')
                        .send({
                            _csrf: csrfToken,
                            loginUsername: 'annnnnn',
                            loginPassword: 'annnnnn'
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            var $ = cheerio.load(res.text);
                            var errors = $('div.alert');
                            errors.length.should.equal(1);
                            errors[0].children[0].data.should.equal("Incorrect username or password");
                            callback(null);
                        });
                }
            ], function (err) {
                if (err) { throw err; }
                done();
            });
        });
    });

    describe('/quiz', function () {

        before(function (done) {
            helpers.populateDB(done);
        });

        after(function (done) {
            helpers.cleanupDB(done);
        });

        it('should respond to unauthorized GET with 401 status', function (done) {
            request.get('/quiz').expect(401, done);
        });

        it('should respond to authorized GET with the quiz page', function (done) {
            var agent = require('supertest').agent(app);
            var test = function (err, agent, csrfToken) {
                if (err) { throw err; }
                agent
                    .post('/login')
                    .type('form')
                    .send({
                        _csrf: csrfToken,
                        loginUsername: existingUser.username,
                        loginPassword: existingUser.password
                    })
                    .end(function (err, res) {
                        if (err && err.status !== 302) { throw err; }
                        agent.get('/quiz').end(function (err, res) {
                            res.status.should.be.equal(200);
                            done();
                        });
                    });

            };
            helpers.getRegisterLogin(agent, test);
        });

    });

    describe('/api/questions/:topic', function () {

        before(function (done) {
            helpers.populateDB(done);
        });

        after(function (done) {
            helpers.cleanupDB(done);
        });

        it('should respond to GET with nonexistent topic with 500', function (done) {
            request.get('/api/questions/handball').expect(500,done);
        });

        it('should respond to GET with an existing topic with json', function (done) {
            request.get('/api/questions/football').expect('Content-Type', /json/).expect(200, done);
        });

    });

    describe('/logout', function () {

        before(function (done) {
            helpers.populateDB(done);
        });

        after(function (done) {
            helpers.cleanupDB(done);
        });

        it('should respond to GET with destroying the session and redirecting to the homepage', function (done) {
            async.waterfall([
                // GET /registerLogin and extract csrf token value
                function (callback) {
                    var agent = require('supertest').agent(app);
                    helpers.getRegisterLogin(agent, callback);
                },
                // Authenticate
                function (agent, csrfToken, callback) {
                    agent
                        .post('/login')
                        .type('form')
                        .send({
                            _csrf: csrfToken,
                            loginUsername: existingUser.username,
                            loginPassword: existingUser.password
                        })
                        .end(function (err, res) {
                            if (err && err.status !== 302) {
                                callback(err);
                            }
                            callback(null, agent);
                        });
                },
                // Use the authenticated agent to log out
                function (agent, callback) {
                    agent.get('/logout').end(function (err, res) {
                        err.status.should.equal(302);
                        res.header.location.should.be.equal('/');
                        callback(null);
                    });
                },
                // Query sessions with native driver and assert it has no records (session was destroyed)
                function (callback) {
                    mongoose.connection.db.collection('sessions').find({}).toArray(function (err, docs) {
                        docs.length.should.equal(0);
                        callback(null);
                    });
                }
            ], function (err) {
                if (err) { throw err; }
                done();
            });
        });

    });

    describe('/api/results/:topic/:score', function () {

        before(function (done) {
            helpers.populateDB(done);
        });

        after(function (done) {
            helpers.cleanupDB(done);
        });

        it('should respond to unauthenticated GET with 500', function (done) {
            request.post('/api/results/football/50').expect(500, done);
        });

        it('should respond to authenticated GET with json', function (done) {
            async.waterfall([
                // GET /registerLogin and extract csrf token value
                function (callback) {
                    var agent = require('supertest').agent(app);
                    helpers.getRegisterLogin(agent, callback);
                },
                // Authenticate
                function (agent, csrfToken, callback) {
                    agent
                        .post('/login')
                        .type('form')
                        .send({
                            _csrf: csrfToken,
                            loginUsername: existingUser.username,
                            loginPassword: existingUser.password
                        })
                        .end(function (err, res) {
                            if (err && err.status !== 302) {
                                callback(err);
                            }
                            callback(null, agent);
                        });
                },
                // Post result
                function (agent, callback) {
                    agent.post('/api/results/football/50').end(function (err, res) {
                        should.not.exist(err);
                        res.type.should.equal('application/json');
                        callback(null);
                    });
                }
            ], function (err) {
                if (err) { throw err; }
                done();
            });
        });

    });

    describe('/register', function () {

        beforeEach(function (done) {
            helpers.populateDB(done);
        });

        afterEach(function (done) {
            helpers.cleanupDB(done);
        });

        it('should render 3 error alerts on /registerLogin when regUsername & regPassword are of incorrect length and regUsername is not alphanumeric', function (done) {
            async.waterfall([
                // GET /registerLogin and extract csrf token value
                function (callback) {
                    var agent = require('supertest').agent(app);
                    helpers.getRegisterLogin(agent, callback);
                },
                // Authenticate
                function (agent, csrfToken, callback) {
                    agent
                        .post('/register')
                        .type('form')
                        .send({
                            _csrf: csrfToken,
                            regEmail: "email@email.si",
                            regUsername: "##",
                            regPassword: "fd",
                            confirmRegPassword: "fd"
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            var $ = cheerio.load(res.text);
                            $('div.alert').length.should.equal(3);
                            callback(null);
                        });
                }
            ], function (err) {
                if (err) { throw err; }
                done();
            });
        });

        it('should render 2 error alerts on /registerLogin when regEmail is invalid and passwords do not match', function (done) {
            async.waterfall([
                // GET /registerLogin and extract csrf token value
                function (callback) {
                    var agent = require('supertest').agent(app);
                    helpers.getRegisterLogin(agent, callback);
                },
                // Authenticate
                function (agent, csrfToken, callback) {
                    agent
                        .post('/register')
                        .type('form')
                        .send({
                            _csrf: csrfToken,
                            regEmail: "invalid email",
                            regUsername: "user1",
                            regPassword: "pass1",
                            confirmRegPassword: "pass2"
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            var $ = cheerio.load(res.text);
                            $('div.alert').length.should.equal(2);
                            callback(null);
                        });
                }
            ], function (err) {
                if (err) { throw err; }
                done();
            });
        });

        it('should log in the user with correct credentials and redirect to the quiz page ', function (done) {
            async.waterfall([
                // GET /registerLogin and extract csrf token value
                function (callback) {
                    var agent = require('supertest').agent(app);
                    helpers.getRegisterLogin(agent, callback);
                },
                // Authenticate
                function (agent, csrfToken, callback) {
                    agent
                        .post('/register')
                        .type('form')
                        .send({
                            _csrf: csrfToken,
                            regEmail: newUser.email,
                            regUsername: newUser.username,
                            regPassword: newUser.password,
                            confirmRegPassword: newUser.password
                        })
                        .end(function (err, res) {
                            err.status.should.equal(302);
                            res.header.location.should.equal('/quiz');
                            res.header['set-cookie'][0].split('=')[0].should.equal('connect.sid');
                            callback(null);
                        });
                }
            ], function (err) {
                if (err) { throw err; }
                done();
            });
        });
    });
});