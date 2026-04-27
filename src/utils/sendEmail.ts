import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,    
      pass: process.env.EMAIL_PASS,    
    },
  });

  await transporter.sendMail({
    from: `"Airbnb Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: text
  });
};