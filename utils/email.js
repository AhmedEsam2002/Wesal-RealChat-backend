import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const sendEmail = async (Options) => {
  const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  const transporter = nodemailer.createTransport(emailConfig);

  const MailOptions = {
    from: `AhmedEsam <ahmedesam@gmail.com>`,
    to: Options.to,
    subject: Options.subject,
    text: Options.text,
    // html: '',
  };

  //   Send the email
  await transporter.sendMail(MailOptions);
};

export default sendEmail;
