/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(" ")[0];
    this.from = `Kshitij Gupta <${process.env.USER_EMAIL}>`;
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV.trim() === "production") {
      return nodemailer.createTransport({
        service: "Gmail",
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  // Send actual mail
  async send(template, subject) {
    // Render HTML
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    // Mail Options

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };

    // Create a transporter and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Destinations!");
  }

  async sendResetPassword() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid only for 10 mins)",
    );
  }
};

// const sendEmail = async (options) => {
// // Create a transporter
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.USER_EMAIL,
//     pass: process.env.USER_PASSWORD,
//   },
// });
// const mailOptions = {
//   from: "Kshitij Gupta <kshitijgupta2308@gmail.com>",
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
//   // html:
// };
// await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
