const nodemailer = require('nodemailer');

/**
 * Sends an email notification to the employer regarding their account verification status.
 * @param {string} email - The employer's email address
 * @param {string} name - The employer's name
 * @param {string} status - The verification status ('approved' or 'rejected')
 */
const sendVerificationEmail = async (email, name, status) => {
  try {
    // Fallback SMTP credentials for development testing (using ethereal mail if none is supplied)
    const SMTP_HOST = process.env.EMAIL_HOST || 'smtp.ethereal.email';
    const SMTP_PORT = parseInt(process.env.EMAIL_PORT) || 587;
    const SMTP_USER = process.env.EMAIL_USER || null;
    const SMTP_PASS = process.env.EMAIL_PASS || null;
    const SMTP_FROM = process.env.EMAIL_FROM || '"WorkOra Admin" <no-reply@workora.com>';

    // Configure nodemailer transporter
    const transporterConfig = {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // True for 465, false for other ports
    };

    // Attach authentication if user and pass are provided
    if (SMTP_USER && SMTP_PASS) {
      transporterConfig.auth = {
        user: SMTP_USER,
        pass: SMTP_PASS
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const isApproved = status === 'approved';
    const subject = isApproved 
      ? 'WorkOra - Employer Account Verified!' 
      : 'WorkOra - Employer Account Verification Update';
    
    const text = isApproved
      ? `Hello ${name},\n\nCongratulations! Your employer account on WorkOra has been approved by the administrator. You can now log in and post job opportunities for students.\n\nBest regards,\nThe WorkOra Team`
      : `Hello ${name},\n\nWe regret to inform you that your employer account verification request on WorkOra has been rejected by the administrator.\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe WorkOra Team`;

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject,
      text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MailService] Verification email sent successfully to ${email} (Status: ${status}). MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[MailService] Failed to send verification email:', error.message);
    // Silent fail so it doesn't crash the server API if SMTP configuration is wrong
  }
};

module.exports = { sendVerificationEmail };
