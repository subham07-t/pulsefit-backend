const nodemailer = require("nodemailer");

const userAuthDetails = {
  GMAIL_EMAIL: process.env.GMAIL_EMAIL,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
};

module.exports = {
  emailConfig: nodemailer.createTransport({
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: userAuthDetails.GMAIL_EMAIL,
      clientId: userAuthDetails.CLIENT_ID,
      clientSecret: userAuthDetails.CLIENT_SECRET,
      refreshToken: userAuthDetails.REFRESH_TOKEN,
    },
  }),
};
