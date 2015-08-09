var quizApplication = quizApplication || {};

/**
 * @param {string} topic
 * @constructor Creates a new Quiz
 */
quizApplication.Quiz = function (topic) {
    "use strict";
    this.settings = { topic : topic};
    this.settings.nextBtn = $('#' + this.settings.topic + 'NextBtn');
    this.settings.prevBtn = $('#' + this.settings.topic + 'PrevBtn');
    this.settings.questionContainer = $('#' + this.settings.topic + 'QuestionContainer');
    this.settings.quizContainer = $('#' + this.settings.topic + 'QuizContainer');
    this.settings.buttonsContainer = $('#' + this.settings.topic + 'ButtonsContainer');
    this.settings.listOfAnswers = $('#' + this.settings.topic + 'Answers');
    this.settings.question = $('#' + this.settings.topic + 'Question');
    this.settings.scores = $('#' + this.settings.topic + 'Scores');
    this.settings.progressBar = $('#' + this.settings.topic + 'ProgressBar');
    this.settings.alert = $('#' + this.settings.topic + 'Alert');
    this.settings.currentQuestion = 0;
    this.settings.questions = [];
    this.settings.answers = [];
};

/**
 * @property {function} render
 * @property {function} addAnswers
 * @property {function} removeAnswers
 * @property {function} updateQuestionAndAnswers
 * @property {function} prepareLayout
 * @property {function} checkAnswers
 * @property {function} showNewQuestion
 * @property {function} calculateTotalScore
 * @property {function} startOver
 * @property {function} nextQuestion
 * @property {function} prevQuestion
 * @property {function} init
 */
quizApplication.Quiz.prototype = {
    constructor: quizApplication.Quiz,

    /**
     * @desc Compiles a Handlebars template and returns an HTML string with the provided data interpolated in place
     * @param templateDir
     * @param templateName
     * @param templateData Context object
     * @returns {string} HTML string
     */
    render: function (templateDir, templateName, templateData) {
        "use strict";
        var templateUrl = templateDir + '/' + templateName + '.hbs';
        var template = JST[templateUrl];
        return template(templateData);
    },

    /**
     * @desc Creates answers, adds them to a document fragment and appends them to the list of answers
     * @param prevChoices
     * @param diff
     * @param listOfAnswers
     */
    addAnswers: function (prevChoices, diff, listOfAnswers) {
        "use strict";
        var id = prevChoices++,
            fragment = $(document.createDocumentFragment());

        while (diff>0) {
            var answer = this.render("templates","answer", {
                quizName: this.settings.topic,
                id: id
            });
            fragment.append(answer);

            diff--;
            id++;
        }

        listOfAnswers.append(fragment);
    },

    /**
     * @desc Removes answers from the list of answers
     * @param diff
     * @param listOfAnswers
     */
    removeAnswers: function (diff, listOfAnswers) {
        "use strict";
        while (-diff>0) {
            listOfAnswers.children().last().remove();
            diff++;
        }
    },

    /**
     * @desc Updates the current question and answers
     */
    updateQuestionAndAnswers: function () {
        "use strict";
        this.settings.question.text(this.settings.questions[this.settings.currentQuestion].question);
        var labels = this.settings.listOfAnswers.find("label");
        for(var i=0, len=labels.length; i<len; i++) {
            labels[i].innerHTML = "<span><span></span></span>" + this.settings.questions[this.settings.currentQuestion].choices[i];
        }
    },

    /**
     * @desc Prepares the page layout by adjusting the markup for the new question.
     * Checks previously answered questions and adds/removes items of the list of questions if needed.
     */
    prepareLayout: function () {
        "use strict";
        var numOfChoices = this.settings.questions[this.settings.currentQuestion].choices.length, // Number of choices for the new question
            diff, // Difference in possible answers in regard to previously shown question
            prevChoices = this.settings.listOfAnswers.find("label").length; // Number of choices in the previous question
        // Adds or removes questions
        if (prevChoices !== numOfChoices) {
            diff = numOfChoices - prevChoices;
            if (diff < 0) {
                this.removeAnswers(diff, this.settings.listOfAnswers);
            } else {
                this.addAnswers(prevChoices, diff, this.settings.listOfAnswers);
            }
        }

        // If the question has already been answered check the appropriate radio button
        if (this.settings.answers[this.settings.currentQuestion] > -1) {
            var arrayOfRadioButtons = this.settings.questionContainer.find("input[type='radio']");
            arrayOfRadioButtons[this.settings.answers[this.settings.currentQuestion]].checked = true;
        }
    },

    /**
     * @desc Checks if the user has answered the question. If it has been answered it is saved to the answers array,
     * unchecks the radio button and returns true, otherwise returns false.
     */
    checkAnswers: function () {
        "use strict";
        var checkedRadio =  this.settings.questionContainer.find("input:checked");
        if (checkedRadio.length !== 0) {
            this.settings.answers[this.settings.currentQuestion] =
                this.settings.questionContainer.find("input[type='radio']").index(checkedRadio);
            checkedRadio.attr("checked", false);
            return true;
        }
        return false;
    },

    /**
     * @desc Sets the current question, prepares layout and updates the text of the question and its answers.
     * @param actionNextQuestion (boolean) - True if moving to the next question
     */
    showNewQuestion: function (actionNextQuestion) {
        "use strict";
        if (arguments.length !== 0) {
            if ( actionNextQuestion ) { this.settings.currentQuestion++; } else { this.settings.currentQuestion--; }
        }

        this.prepareLayout();
        this.updateQuestionAndAnswers();
    },

    calculateTotalScore: function () {
        "use strict";
        var correctAnswers = 0;
        for (var i= 0, len=this.settings.questions.length; i < len; i++) {
            if (this.settings.answers[i] === this.settings.questions[i].answer) {
                correctAnswers++;
            }
        }
        var result = (correctAnswers/this.settings.questions.length) * 100;
        return Math.round(result);
    },

    startOver: function () {
        "use strict";
         this.settings.quizContainer.fadeOut(300, function () {
             this.settings.scores.empty();
             this.settings.questionContainer.show();
             this.settings.nextBtn.show();
             this.settings.prevBtn.hide();
             this.settings.scores.hide();
             this.settings.currentQuestion = 0;
             this.settings.answers.length = 0;
             this.settings.progressBar.css("width", "0%");
             this.showNewQuestion();
             this.settings.quizContainer.fadeIn(1000);
         }.bind(this));
    },

    /**
     * @desc Inserts a new question and the corresponding choices
     */
    nextQuestion: function () {
        "use strict";
        if (this.checkAnswers()) {
            this.settings.alert.hide();
            this.settings.quizContainer.fadeOut(300, function () {
                if (this.settings.currentQuestion === this.settings.questions.length-1) { // If we are moving to the page with the total score
                    this.settings.questionContainer.hide();
                    this.settings.nextBtn.hide();
                    this.settings.prevBtn.hide();
                    this.settings.scores.show();

                    var totalScore = this.calculateTotalScore();
                    var url = 'http://localhost:3000/api/results/' + this.settings.topic + '/' + totalScore;
                    var self = this;
                    $.ajax({
                        type: 'POST',
                        url: url,
                        dataType: 'json',
                        error: function (xhr, status, error) {
                            var errorMessage = this.render("templates","error", {message: "Couldn't retrieve top scores."});
                            self.settings.scores.append(errorMessage);
                        },
                        success: function (data, status, xhr) {
                            var fragment = $(document.createDocumentFragment());
                            var context = {
                                topScores: data,
                                totalScore: totalScore,
                                topic: self.settings.topic
                            };
                            var scores = self.render("templates","scores", context);
                            fragment.append(scores);
                            self.settings.scores.append(fragment);
                            self.settings.startOverBtn = $('#' + self.settings.topic + 'StartOverBtn');
                            self.settings.startOverBtn.click(self.startOver.bind(self));
                        }
                    });
                    self.settings.currentQuestion++;
                    self.settings.progressBar.css("width", (self.settings.currentQuestion/self.settings.questions.length)*100 + "%");
                } else if (this.settings.currentQuestion === 0) { // If we are moving to the 2nd question
                    this.showNewQuestion(true);
                    this.settings.progressBar.css("width", (this.settings.currentQuestion/this.settings.questions.length)*100 + "%");
                    this.settings.prevBtn.show();
                } else {
                    this.showNewQuestion(true);
                    this.settings.progressBar.css("width", (this.settings.currentQuestion/this.settings.questions.length)*100 + "%");
                }
                this.settings.quizContainer.fadeIn(1000);
            }.bind(this));
        } else {
            this.settings.alert.show();
        }
    },

    /**
     * @desc Inserts the previous question and the corresponding choices
     */
    prevQuestion: function () {
        "use strict";
        this.settings.quizContainer.fadeOut(300, function () {
            if (this.settings.currentQuestion === 1) { // If we are moving from the 2nd question
                this.checkAnswers();
                this.settings.prevBtn.hide();
                this.showNewQuestion(false);
                this.settings.progressBar.css("width", (this.settings.currentQuestion/this.settings.questions.length)*100 + "%");
            } else if (this.settings.currentQuestion === this.settings.questions.length) { // If we are moving from the total score page
                this.checkAnswers();
                this.settings.questionContainer.show();
                this.settings.buttonsContainer.show();
                this.settings.nextBtn.show();
                this.showNewQuestion(false);
                this.settings.progressBar.css("width", (this.settings.currentQuestion/this.settings.questions.length)*100 + "%");
            } else {
                this.checkAnswers();
                this.showNewQuestion(false);
                this.settings.progressBar.css("width", (this.settings.currentQuestion/this.settings.questions.length)*100 + "%");
            }
            this.settings.quizContainer.fadeIn(1000);
        }.bind(this));
    },

    /**
     * @desc Gets questions from file and initializes the quiz
     */
    init: function () {
        "use strict";
        this.settings.alert.hide();
        var url = 'http://localhost:3000/api/questions/' + this.settings.topic;
        $.getJSON(url, function (data, status) {
            if (status === "success") {
                this.settings.questions = data;
                this.settings.nextBtn.click(this.nextQuestion.bind(this));
                this.settings.prevBtn.click(this.prevQuestion.bind(this));
                this.settings.prevBtn.hide();
                this.settings.scores.hide();
                this.showNewQuestion();
            }
        }.bind(this));
    }
};