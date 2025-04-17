import nodemailer from "nodemailer";
import pug from "pug";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { dirname } from "path";
import { fileURLToPath } from "url";
import { htmlToText } from "html-to-text";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.fullName = user.fullName;
    this.url = url;
    this.from = `Novus Team <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      fullName: this.fullName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    if (process.env.NODE_ENV === "production") {
      await resend.emails.send(mailOptions);
    } else {
      await this.createTransport().sendMail(mailOptions);
    }
  }

  async sendWelcome() {
    await this.send("Welcome", "Welcome to the Novus app.");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes.)"
    );
  }
}
