'use strict';

var express = require('express');
var validator = require('validator');
var router = express.Router();

router.get('/questions/:topic', function(req, res, next) {
    var topic = req.params.topic;
    if (!validator.isAlpha(topic)) { return next(new Error('Topic should only contain letters(a-zA-Z)')); }

    req.models.Question.find({topic: topic}, function (err, docs) {
        if (err) { return next(err); }
        if (!docs.length) { return next(new Error('Cant find questions for topic')); }
        res.json(docs);
    });
});

router.post('/results/:topic/:score', function (req, res, next) {
    var quizTopic = req.params.topic;
    var score = req.params.score;
    if (!req.session.isAuthenticated) { return next(new Error('Unauthenticated')); }
    if (!validator.isAlpha(quizTopic)) { return next(new Error('QuizTopic should only contain letters(a-zA-Z)')); }
    if (!validator.isInt(score)) { return next(new Error('Score is not an integer')); }
    // Update the users scores array with the new score
    var query = {_id: req.session.username};
    var update = {$push: {quizResults:{topic: quizTopic, score: score}}};
    req.models.User.update(query, update, function (err, modified) {
        if (err) { next(new Error('Error updating user scores')); }
        req.models.User.aggregate(
            [
                {
                    $unwind:'$quizResults'
                },
                {
                    $group: {
                        _id: {
                            'username' : '$_id',
                            'quizResult' : '$quizResults'
                        }
                    }
                },
                {
                    $match: {
                        '_id.quizResult.topic' : quizTopic
                    }
                },
                {
                    $project: {
                        'username': '$_id.username',
                        'score': '$_id.quizResult.score'
                    }
                },
                {
                    $sort: {
                        'score': -1
                    }
                },
                {
                    $limit: 5
                }
            ],
            function (err, results) {
                if (err) { return next(new Error("Error aggregating results")); }
                res.json(results);
            }
        );
    });
});

module.exports = router;