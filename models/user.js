var mongoose = require('mongoose');

var quizResultsSchema = mongoose.Schema({
   topic: {
       type: String,
       required: true
   },
   score: {
       type: Number,
       required: true
   }
});

var userSchema = mongoose.Schema({
    _id: String, // We store the username as _id
    email: {
        type: String,
        required: true,
        set: function(value) {return value.trim().toLowerCase();},
        validate: [
            function(email) {
                var re = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
                return (email.match(re) !== null);
            }, 'Invalid email'
        ]
    },
    password: {
        type: String,
        required: true
    },
    quizResults: [quizResultsSchema]
});

module.exports = mongoose.model('User', userSchema); // Saves to db as users