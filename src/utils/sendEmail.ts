import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
    throw new Error("Email service not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const result = await transporter.sendMail({
      from: `"Airbnb Clone" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: text
    });
    console.log(`Email sent successfully to ${to}`);
    return result;
  } catch (error) {
    console.error("sendEmail error:", error);
    throw error;
  }
};