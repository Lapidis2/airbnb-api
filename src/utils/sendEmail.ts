import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

// Use SendGrid if API key is available, otherwise fall back to nodemailer
const useSendGrid = !!process.env.SENDGRID_API_KEY;

if (useSendGrid && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("[EMAIL] Using SendGrid for email delivery");
} else {
  console.log("[EMAIL] Using Nodemailer for email delivery");
}

export const sendEmail = async (to: string, subject: string, text: string) => {
  if (!process.env.EMAIL_USER) {
    console.error("Email configuration missing: EMAIL_USER not set");
    throw new Error("Email service not configured");
  }

  console.log(`[EMAIL] Attempting to send to: ${to}`);
  console.log(`[EMAIL] From: ${process.env.EMAIL_USER}`);

  // Use SendGrid if available (works on all cloud platforms)
  if (useSendGrid && process.env.SENDGRID_API_KEY) {
    try {
      const result = await sgMail.send({
        to,
        from: process.env.EMAIL_USER,
        subject,
        html: text,
      });
      console.log(`[EMAIL] Email sent successfully via SendGrid to ${to}`);
      return result;
    } catch (error) {
      console.error(`[EMAIL] SendGrid error:`, error);
      throw error;
    }
  }

  // Fallback to Nodemailer (for local development)
  if (!process.env.EMAIL_PASS) {
    console.error("Email configuration missing: EMAIL_PASS not set");
    throw new Error("Email service not configured");
  }

  console.log(`[EMAIL] Using Gmail SMTP`);

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
    console.log(`[EMAIL] Email sent successfully via Gmail to ${to}`);
    console.log(`[EMAIL] Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`[EMAIL] Gmail SMTP error:`, error);
    if (error instanceof Error) {
      console.error(`[EMAIL] Error message: ${error.message}`);
    }
    throw error;
  }
};