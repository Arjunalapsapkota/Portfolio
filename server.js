"use strict";
require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const axios = require("axios");
const Client = process.env.Client;
const Secret = process.env.Secret;
const Refresh = process.env.Refresh;
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(express.static("public"));

var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require("./routes/htmlRoutes")(app);

app.post("/contact", function(req, res) {
  console.log("data from the contact form: ", req.body);

  const sendthemail = async () => {
    const oauth2Client = new OAuth2(
      Client, // ClientID
      Secret // Client Secret
    );

    oauth2Client.setCredentials({
      refresh_token: Refresh
    });
    //const tokens = oauth2Client.refreshAccessToken();

    const tokens = await oauth2Client.getAccessToken();

    console.log("token ########### :  ", tokens.token);
    const accessToken = tokens.token;

    let mailOpts, smtpTrans;
    smtpTrans = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "arjunalapsapkota@gmail.com",
        clientId: Client,
        clientSecret: Secret,
        refreshToken: Refresh,
        accessToken: accessToken,

        expires: 1484314697598
      },
      TLS: {
        rejectUnauthorized: false
      }
    });
    //
    // verify connection configuration
    smtpTrans.verify(function(error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
    mailOpts = {
      from: req.body.name + " &lt;" + req.body.email + "&gt;",
      to: "rejinathapa13@gmail.com",
      subject: "Customer Inquiry from EBQ salon",
      text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`
    };
    smtpTrans.sendMail(mailOpts, function(error, response) {
      if (error) {
        res.send("contact-failure");
      } else {
        res.sendStatus(200);
      }
    });
  };
  sendthemail();
});
// =============================================================================
// LISTENER
// The below code effectively "starts" our server
// =============================================================================

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
