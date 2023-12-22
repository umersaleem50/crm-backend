// const nodeMailer = require("nodemailer");

// exports.sendMail = async (email, resetToken) => {
//   const transporter = new nodeMailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASSWORD,
//     },
//   });
//   const TOKEN_URL = `127.0.0.1:3000/auth/reset-password/${resetToken}`;
//   const message = `<div>Reset Password of Resource management account. Click on given link below to reset password.<br><a href=${TOKEN_URL}>${TOKEN_URL}</a><br>If you didn't requested for reseting you password then please ignore this mail.</div>`;

//   try {
//     return transporter.sendMail({
//       from: "Umar Saleem <umersaleem50@gmail.com>",
//       to: email,
//       subject: "You can reset your password within 10 minutes",
//       html: message,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };
const path = require("path");
const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = `Umar Saleem <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV !== "production") {
      // Sendgrid
      return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "c63f6d2f89341b",
          pass: "d4723a37552b8b",
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    // var transport = nodemailer.createTransport({
    //   host: 'sandbox.smtp.mailtrap.io',
    //   port: 2525,
    //   auth: {
    //     user: 'c63f6d2f89341b',
    //     pass: 'd4723a37552b8b',
    //   },
    // });
    // return transport;
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    // console.log(process.cwd());
    console.log(__dirname);
    const templatePath = path.join(
      __dirname,
      `../email_templates/${template}.pug`
    );

    const html = pug.renderFile(templatePath, {
      name: this.name?.split(" ")[0] || this.name,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the resource management!");
  }

  async sendPasswordReset() {
    await this.send(
      "reset_password",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
}

module.exports = { Email };
