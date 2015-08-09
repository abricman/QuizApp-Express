this["JST"] = this["JST"] || {};

this["JST"]["templates/answer.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<li>\n    <input type=\"radio\" name=\""
    + alias3(((helper = (helper = helpers.quizName || (depth0 != null ? depth0.quizName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"quizName","hash":{},"data":data}) : helper)))
    + "Answers\" id=\""
    + alias3(((helper = (helper = helpers.quizName || (depth0 != null ? depth0.quizName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"quizName","hash":{},"data":data}) : helper)))
    + "Answer"
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"/>\n    <label id=\""
    + alias3(((helper = (helper = helpers.quizName || (depth0 != null ? depth0.quizName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"quizName","hash":{},"data":data}) : helper)))
    + "Lbl"
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" for=\""
    + alias3(((helper = (helper = helpers.quizName || (depth0 != null ? depth0.quizName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"quizName","hash":{},"data":data}) : helper)))
    + "Answer"
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"><span><span></span></span></label>\n</li>";
},"useData":true});

this["JST"]["templates/scores.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "    <li>\n        <span>"
    + alias3(((helper = (helper = helpers.username || (depth0 != null ? depth0.username : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"username","hash":{},"data":data}) : helper)))
    + "</span>\n        <div class=\"progress\">\n            <div class=\"progress-bar progress-bar-success\" role=\"progressbar\" style=\"min-width: 20px;width:"
    + alias3(((helper = (helper = helpers.score || (depth0 != null ? depth0.score : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"score","hash":{},"data":data}) : helper)))
    + "%\">\n                "
    + alias3(((helper = (helper = helpers.score || (depth0 != null ? depth0.score : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"score","hash":{},"data":data}) : helper)))
    + "%\n            </div>\n        </div>\n    </li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<ul class=\"scoresList\">\n    <li>\n        <span>Your score:</span>\n        <div class=\"progress\">\n            <div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" style=\"min-width: 20px;width:"
    + alias3(((helper = (helper = helpers.totalScore || (depth0 != null ? depth0.totalScore : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"totalScore","hash":{},"data":data}) : helper)))
    + "%\">\n                "
    + alias3(((helper = (helper = helpers.totalScore || (depth0 != null ? depth0.totalScore : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"totalScore","hash":{},"data":data}) : helper)))
    + "%\n            </div>\n        </div>\n    </li>\n</ul>\n\n<ul class=\"scoresList\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.topScores : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n\n<a id=\""
    + alias3(((helper = (helper = helpers.topic || (depth0 != null ? depth0.topic : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"topic","hash":{},"data":data}) : helper)))
    + "StartOverBtn\" class=\"btn btn-primary startOverBtn\" href=\"#\">Start over</a>";
},"useData":true});