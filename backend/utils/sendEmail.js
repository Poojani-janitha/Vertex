const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;
  let testMessageUrl = null;

  // If real SMTP credentials are provided in .env, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Otherwise, generate a fake test account from Ethereal Email for development
    // This allows us to test email flows without setting up a real email provider!
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Vertex Admin'} <${process.env.FROM_EMAIL || 'noreply@vertex.edu'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || options.message,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);

  // If using Ethereal, generate a preview URL to view the email in the browser
  if (info.messageId && !process.env.SMTP_HOST) {
    testMessageUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL: %s', testMessageUrl);
  }

  return testMessageUrl;
};

module.exports = sendEmail;
