import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
    throw new Error("Email service not configured");
  }

  console.log(`[EMAIL] Attempting to send to: ${to}`);
  console.log(`[EMAIL] From: ${process.env.EMAIL_USER}`);
  console.log(`[EMAIL] Using Gmail service`);

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
    // Verify connection
    await transporter.verify();
    console.log(`[EMAIL] SMTP connection verified`);

    const result = await transporter.sendMail({
      from: `"Airbnb Clone" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: text
    });
    console.log(`[EMAIL] Email sent successfully to ${to}`);
    console.log(`[EMAIL] Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`[EMAIL] Failed to send email:`, error);
    if (error instanceof Error) {
      console.error(`[EMAIL] Error message: ${error.message}`);
      console.error(`[EMAIL] Error stack: ${error.stack}`);
    }
    throw error;
  }
};