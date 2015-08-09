var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
   question: {
       type: String,
       required: true
   },
   choices: [{
       type: String
   }],
   answer: {
       type: Number,
       required: true
   },
   topic: {
       type: String,
       required: true
   }
});

module.exports = mongoose.model('Question', questionSchema);