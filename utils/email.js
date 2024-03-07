/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Kshitij Gupta <kshitijgupta2308@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
