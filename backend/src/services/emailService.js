import nodemailer from 'nodemailer';

// Configure nodemailer transporter using Gmail SMTP
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
  });
};

/**
 * Sends a 6-digit OTP email for account verification (valid for 10 minutes)
 */
export const sendOtpEmail = async (toEmail, otp) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      `\n⚠️ [EMAIL SERVICE WARNING]: EMAIL_USER or EMAIL_PASS not configured in .env.\n` +
      `Simulated OTP for ${toEmail}: [ ${otp} ] (Valid for 10 minutes)\n`
    );
    return { simulated: true, otp };
  }

  const mailOptions = {
    from: `"SureBite" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your SureBite Verification Code: ${otp}`,
    html: `
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
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send OTP email via Gmail SMTP:', error.message);
    // In local dev, still log the OTP so testing isn't blocked
    console.info(`[FALLBACK LOG] OTP for ${toEmail}: [ ${otp} ]`);
    throw new Error('Could not send verification email. Please check your email credentials.');
  }
};

/**
 * Sends a password reset email with secure token link (valid for 15 minutes)
 */
export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      `\n⚠️ [EMAIL SERVICE WARNING]: EMAIL_USER or EMAIL_PASS not configured in .env.\n` +
      `Simulated Password Reset URL for ${toEmail}:\n${resetUrl}\n(Valid for 15 minutes)\n`
    );
    return { simulated: true, resetUrl };
  }

  const mailOptions = {
    from: `"SureBite" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset Your SureBite Password',
    html: `
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
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send Password Reset email via Gmail SMTP:', error.message);
    console.info(`[FALLBACK LOG] Password Reset URL for ${toEmail}: ${resetUrl}`);
    throw new Error('Could not send password reset email. Please check your email credentials.');
  }
};
