import nodemailer from "nodemailer";
import env from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("[SMTP_VERIFY_ERROR]:", error);
  } else {
    console.log("[SMTP_READY]: Server is ready to take our messages");
  }
});

const sendEmail = async (options) => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    const errorMsg = "SMTP credentials not fully configured. Email cannot be sent.";
    console.error(`[EMAIL_ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const message = {
    from: `${env.smtp.fromName} <${env.smtp.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`[EMAIL_SENT] Message sent: ${info.messageId} to ${options.to}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL_FAILED] Error sending email to ${options.to}:`, error);
    throw error;
  }
};

export const sendMembershipPurchaseEmail = async (user, membership) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #40e0d0; text-align: center;">Welcome to Otter Society!</h2>
      <p>Hi ${user.name},</p>
      <p>Your <strong>${membership.membershipType}</strong> membership is now active.</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Expiry Date:</strong> ${new Date(membership.expiryDate).toLocaleDateString()}</p>
        <p><strong>Membership ID:</strong> ${membership._id}</p>
      </div>
      <p>You can now enjoy premium benefits including event discounts and early access.</p>
      <p>Stay active, stay Otter!</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject: "Membership Activated!", html });
};

export const sendMembershipUpgradeEmail = async (user, membership) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #40e0d0; text-align: center;">Membership Upgraded!</h2>
      <p>Hi ${user.name},</p>
      <p>Your membership has been successfully upgraded to <strong>${membership.membershipType}</strong>.</p>
      <p>New benefits are now unlocked for your account.</p>
      <p>Stay active, stay Otter!</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject: "Membership Upgraded!", html });
};

export const sendMembershipRenewEmail = async (user, membership) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #40e0d0; text-align: center;">Membership Renewed!</h2>
      <p>Hi ${user.name},</p>
      <p>Your membership has been successfully renewed.</p>
      <p><strong>New Expiry Date:</strong> ${new Date(membership.expiryDate).toLocaleDateString()}</p>
      <p>Stay active, stay Otter!</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject: "Membership Renewed!", html });
};

export const sendMembershipExpiryReminder = async (user, membership) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #ff4b2b; text-align: center;">Membership Expiring Soon!</h2>
      <p>Hi ${user.name},</p>
      <p>Your membership is set to expire on <strong>${new Date(membership.expiryDate).toLocaleDateString()}</strong>.</p>
      <p>Renew now to continue enjoying your exclusive benefits without interruption.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${env.clientOrigin[0]}/membership" style="background: #40e0d0; color: #061323; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
      </div>
    </div>
  `;
  await sendEmail({ to: user.email, subject: "Action Required: Membership Expiring!", html });
};

export const sendRegistrationConfirmationEmail = async (registration, event) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #40e0d0; text-align: center;">Registration Confirmed!</h2>
      <p>Hi ${registration.fullName},</p>
      <p>You have successfully registered for <strong>${event.title}</strong>.</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleDateString()}</p>
        <p><strong>Ticket ID:</strong> ${registration._id}</p>
      </div>
      <p>Please present your digital ticket at the entrance.</p>
      <p>See you there!</p>
    </div>
  `;
  await sendEmail({ to: registration.email, subject: `Ticket Confirmed: ${event.title}`, html });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #40e0d0; text-align: center;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You are receiving this email because you requested a password reset for your Otter Society account.</p>
      <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #40e0d0; color: #061323; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject: "Password Reset Request", html });
};
