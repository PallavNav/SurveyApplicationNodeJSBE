const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionId: { type: Number, required: true },
  question: { type: String, required: true, minlength: 3 },
  answerSubmitted: { type: [String, [String]], required: true, minlength: 3 }, // Alternately we can use => mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Question', questionSchema);