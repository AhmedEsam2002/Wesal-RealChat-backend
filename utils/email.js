import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const sendEmail = async (Options) => {
  const emailConfig = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USERNAME, // your Gmail address
      pass: process.env.EMAIL_PASSWORD, // app password
    },
  };

  const transporter = nodemailer.createTransport(emailConfig);

  const MailOptions = {
    from: `"Wesal Chat App" <${process.env.EMAIL_USERNAME}>`, // لازم يكون نفس الإيميل الحقيقي
    to: Options.to,
    subject: Options.subject,
    text: Options.text,
    html: Options.html || undefined,
  };

  try {
    await transporter.sendMail(MailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

export default sendEmail;
