
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const SurveyData = require("./models/questionSchema");

const app = express();
app.use(bodyParser.json());

const databaseURL =
      "mongodb+srv://mongodb:mongodb@cluster0.wzdr4vx.mongodb.net/survey_app_database?retryWrites=true&w=majority"

/**
 * @description - Connecting to MongoDb
 */
mongoose
  .connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

/**
 * @description - Request header to be passed to every API.
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

/**
 * @description - To handle validation
 */
const handleValidation = (request) => {
  let errorCode = "";
  if (request.length !== 11) {
    errorCode = "Please answer all the questions!";
  } else {
    request.forEach((data) => {
      if (
        !data.questionId ||
        !data.question ||
        data.answerSubmitted.length === 0
      ) {
        errorCode =
          "It looks like we are having some technical glitch! Please contact the application owner!";
      }
    });
  }
  return errorCode;
};

/**
 * @description To handle the api request
 */
app.post("/nav/surveyApp/save", (req, res) => {
  let validationCode = handleValidation(req.body);
  if (validationCode) {
    res.status(420).json({ message: validationCode });
  } else {
    SurveyData.insertMany(req.body)
      .then(() => {
        res.status(200).json({
          message:
            "Your entered data has been saved successfully. You may now close this window!",
        });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ message: "An error occurred while storing survey data." });
      });
  }
});

/***
 * @description To make the server listen at port 5000
 */
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
