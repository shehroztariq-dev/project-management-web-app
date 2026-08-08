import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, body }) => {
  const res = await transporter.sendMail({
    from: `"MacroTask" <${process.env.SMTP_USER}>`, //
    to: to,
    subject: subject,
    html: body,
  });
};

export default sendEmail;
