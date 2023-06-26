const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

const handleValidation = (request) => {
  let errorCode = '';
  if (request.length !== 11) {
    errorCode = "Please answer all the questions!";
  } else {
    request.forEach((data) => {
      if (!data.questionId || !data.question || data.answerSubmitted.length === 0) {
        errorCode =
          "It looks like we are having some technical glitch! Please contact the application owner!";
      }
    });
  }
  return errorCode;
};

app.post("/nav/surveyApp/save", (req, res) => {
  let validationCode = handleValidation(req.body);
  if (validationCode) {
    res.status(420).json({ message: validationCode });
  } else {
    res
      .status(200)
      .json({
        message:
          "Your entered data has been saved successfully. You may now close this window!",
      });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
