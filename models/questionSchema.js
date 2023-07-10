const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  submittedBy: String,
  surveyDetails: [
    {
      questionId: { type: Number, required: true },
      question: { type: String, required: true, minlength: 3 },
      answerSubmitted: { type: [String, [String]], required: true, minlength: 3 } // Alternately we can use => mongoose.Schema.Types.Mixed
    },
  ]
});

module.exports = mongoose.model('SurveyData', surveySchema);