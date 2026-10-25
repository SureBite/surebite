import nodemailer from 'nodemailer';

// Configure nodemailer transporter using Gmail SMTP (for local development or unblocked servers)
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
};

/**
 * Sends transactional email via the best available provider:
 * 1. Brevo HTTPS API (Port 443 - Recommended for Render free tier, no custom domain required)
 * 2. Resend HTTPS API (Port 443 - Works on Render free tier)
 * 3. Nodemailer Gmail SMTP (For local dev or unblocked servers)
 * 4. Fallback simulation (logs to console so testing is never blocked)
 */
const sendTransactionalEmail = async ({ toEmail, subject, html, debugLabel, debugValue }) => {
  // 1. Brevo HTTP API (Port 443 HTTPS - Works on Render Free Tier)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY.trim(),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'SureBite', email: senderEmail },
          to: [{ email: toEmail }],
          subject,
          htmlContent: html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Brevo API]: Email delivered to ${toEmail}. Message ID:`, data.messageId);
        return { success: true, messageId: data.messageId, provider: 'brevo' };
      }

      const errText = await res.text();
      console.error(`[Brevo API Error ${res.status}]:`, errText);
    } catch (err) {
      console.error('[Brevo API Request Failed]:', err.message);
    }
  }

  // 2. Resend HTTP API (Port 443 HTTPS - Works on Render Free Tier)
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'SureBite <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject,
          html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Resend API]: Email delivered to ${toEmail}. ID:`, data.id);
        return { success: true, messageId: data.id, provider: 'resend' };
      }

      const errText = await res.text();
      console.error(`[Resend API Error ${res.status}]:`, errText);
    } catch (err) {
      console.error('[Resend API Request Failed]:', err.message);
    }
  }

  // 3. Nodemailer Gmail SMTP (Local dev or unblocked servers)
  const transporter = createTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"SureBite" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html,
      });
      console.log(`[Gmail SMTP]: Email sent to ${toEmail}. ID:`, info.messageId);
      return { success: true, messageId: info.messageId, provider: 'nodemailer' };
    } catch (err) {
      console.warn('[Gmail SMTP Error - Note: Render free tier blocks outbound SMTP ports 465/587]:', err.message);
    }
  }

  // 4. Safe simulated fallback for cloud free hosting
  console.info(
    `\n========================================\n` +
    `[SUREBITE ${debugLabel.toUpperCase()} LOG]\n` +
    `Recipient: ${toEmail}\n` +
    `${debugLabel}: ${debugValue}\n` +
    `Note: Outbound SMTP is blocked on Render Free Tier. Set BREVO_API_KEY in Render to deliver real emails over HTTPS.\n` +
    `========================================\n`
  );

  return { simulated: true, fallback: true, [debugLabel.toLowerCase()]: debugValue };
};

/**
 * Sends a 6-digit OTP email for account verification (valid for 10 minutes)
 */
export const sendOtpEmail = async (toEmail, otp) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #faf8f5; border-radius: 12px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1b4332; font-size: 26px; margin: 0 0 6px 0;">SureBite</h1>
        <p style="color: #666; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Restaurant Workspace</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 10px; border: 1px solid #e7e2d9; text-align: center;">
        <h2 style="font-size: 20px; color: #1b4332; margin-top: 0;">Verify Your Restaurant Account</h2>
        <p style="color: #4a4a4a; font-size: 15px; line-height: 1.5; margin: 16px 0 24px;">
          Thank you for registering with SureBite. Please use the following 6-digit verification code to activate your account.
        </p>

        <div style="background-color: #f1f7f4; border: 2px dashed #2d6a4f; border-radius: 8px; padding: 18px 24px; display: inline-block; margin: 8px 0 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b4332; font-family: monospace;">${otp}</span>
        </div>

        <p style="color: #888; font-size: 13px; margin: 0;">
          ⏳ This code is valid for <strong>10 minutes</strong>. If you did not create a SureBite account, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #999; font-size: 12px;">
        <p style="margin: 0;">AI Infers. Humans Verify. Diners Stay Safe.</p>
        <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} SureBite. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendTransactionalEmail({
    toEmail,
    subject: `Your SureBite Verification Code: ${otp}`,
    html,
    debugLabel: 'OTP',
    debugValue: otp,
  });
};

/**
 * Sends a password reset email with secure token link (valid for 15 minutes)
 */
export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #faf8f5; border-radius: 12px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1b4332; font-size: 26px; margin: 0 0 6px 0;">SureBite</h1>
        <p style="color: #666; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Restaurant Workspace</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 10px; border: 1px solid #e7e2d9; text-align: center;">
        <h2 style="font-size: 20px; color: #1b4332; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #4a4a4a; font-size: 15px; line-height: 1.5; margin: 16px 0 24px;">
          We received a request to reset the password for your SureBite account. Click the button below to choose a new password.
        </p>

        <a href="${resetUrl}" style="background-color: #1b4332; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; margin: 8px 0 24px;">
          Reset Password
        </a>

        <p style="color: #666; font-size: 13px; margin: 0 0 12px; word-break: break-all;">
          Or copy and paste this link in your browser:<br />
          <a href="${resetUrl}" style="color: #2d6a4f;">${resetUrl}</a>
        </p>

        <p style="color: #888; font-size: 13px; margin: 16px 0 0;">
          ⏳ This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #999; font-size: 12px;">
        <p style="margin: 0;">AI Infers. Humans Verify. Diners Stay Safe.</p>
        <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} SureBite. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendTransactionalEmail({
    toEmail,
    subject: 'Reset Your SureBite Password',
    html,
    debugLabel: 'ResetUrl',
    debugValue: resetUrl,
  });
};
