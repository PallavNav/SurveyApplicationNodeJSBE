const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const nodeMailer = require("nodemailer");
const SurveyData = require("./models/questionSchema");
const { Credentials } = require("./service.js");

require("dotenv").config();
const app = express();
app.use(bodyParser.json());

const databaseURL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wzdr4vx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const mailOptions = {
  from: "nav.pallav@mercedes-benz.com",
  to: ["nav.pallav@mercedes-benz.com", "pallavnav@gmail.com"],
  subject: "How are you doing? Just stay there!I cannot be prefectionist!! ",
  text: "This is a test email sent from a Node.js app!",
};

/**
 * @description - Request header to be passed to every API.
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

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
 * @description - To handle validation
 */
const handleValidation = (request) => {
  let errorCode = null;
  if (request.surveyDetails.length !== 11) {
    errorCode = "Please answer all the questions!";
  }
  request.surveyDetails.forEach((data) => {
    if (
      !data.questionId ||
      !data.question ||
      data.answerSubmitted.length === 0
    ) {
      errorCode =
        "It looks like we are having some technical glitch! Please contact the application owner!";
    }
  });
  if (!request.submittedBy) {
    errorCode =
      "It looks like we are having some technical glitch! Please contact the application owner!";
  }
  return errorCode;
};

app.get("/nav/surveyApp/aboutSurveyApp", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

/**
 * @description To handle the api request, only official API
 */
app.post("/nav/surveyApp/save", (req, res) => {
  const { submittedBy, surveyDetails } = req.body;
  let validationCode = handleValidation(req.body);
  if (validationCode) {
    res.status(420).json({ message: validationCode });
  } else {
    const survey = new SurveyData({
      submittedBy,
      surveyDetails,
    });

    survey
      .save()
      .then(() => {
        res.status(200).json({
          message:
            "Your entered data has been saved successfully. You may now close this window!",
        });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ error: "An error occurred while saving the survey data." });
      });
  }
});

/**
 * @description To delete/clear the complete data, only official API
 */
app.delete("/nav/surveyApp/delete", (req, res, next) => {
  SurveyData.deleteMany()
    .then(() => {
      res.status(200).json({ message: "All records deleted successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Error deleting records" });
    });
});

/***
 * @description To fetch all the survey data entered!
 */
app.get("/nav/surveyApp/fetchAllData", (req, res, next) => {
  SurveyData.find()
    .then((response) => {
      res.status(200).json({ submittedSurveyData: response });
    })
    .catch((error) => {
      res.status(500).json({ error: "No Records Found!!" });
    });
});

const removeDuplicate = (data) => {
  const uniqueResponse = new Set();
  return data.filter((obj) => {
    if (!uniqueResponse.has(obj.submittedBy)) {
      uniqueResponse.add(obj.submittedBy);
      return true;
    }
    return false;
  });
};

const manageMailSender = () => {
  const mailer = nodeMailer.createTransport({
    service: Credentials().gmail.source,
    auth: Credentials().gmail.auth,
  });
  return mailer;
};

const sendMail = (mailerDetails, mailOptions) => {
  return new Promise((resolve, reject) => {
    mailerDetails.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Mail sent successfully!!");
        resolve(info);
      }
    });
  });
};

app.get("/nav/surveyApp/sendMail", async (req, res, next) => {
  try {
    const senderDetails = manageMailSender(); // Configure sender details
    const mailOptions1 = mailOptions;
    const response = await sendMail(senderDetails, mailOptions1); // Send the email

    res.status(200).json({ submittedSurveyData: response });
  } catch (error) {
    res.status(500).json({ error: "Error sending email" });
  }
});

/***
 * @description To make the server listen at port 5000
 */
const port = process.env.PORT || 4050;
app.listen(port, (err, res) => {
  if (err) {
    console.log(err);
    return res.status(500).send(err.message);
  } else {
    console.log("[INFO] Server Running on port:", port);
  }
});

module.exports = app;
