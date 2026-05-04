import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const result = await transporter.sendMail({
      from: `"Airbnb Clone" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: text
    });
   
  } catch (error) {
    console.error("sendEmail error:", error);
    throw error;
  }
};