import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log("sendEmail called with to:", to, "subject:", subject);
  const transporter = nodemailer.createTransport({
    service: "gmail",
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
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("sendEmail error:", error);
    throw error;
  }
};