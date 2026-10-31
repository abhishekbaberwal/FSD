const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(' Configured Nodemailer with custom SMTP server');
  } else {
    // Generate test SMTP service account from ethereal.email for viva/demo testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(' Generated Nodemailer Ethereal test inbox:', testAccount.user);
    } catch (err) {
      console.warn('⚠️ Could not create Ethereal test account. Falling back to console logger:', err.message);
      // Fallback mock transporter that logs email content
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('--- [MOCK EMAIL SENT] ---');
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('Text:', mailOptions.text);
          console.log('HTML preview available');
          return { messageId: 'mock-id-' + Date.now() };
        },
      };
    }
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const t = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"SmartJobs Portal" <no-reply@smartjobs.com>';
    const info = await t.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(` Ethereal Email Preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(' Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, getTransporter };
