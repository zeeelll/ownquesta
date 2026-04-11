const nodemailer = require('nodemailer');

const emailDebug = process.env.EMAIL_DEBUG === 'true';
const EMAIL_USER = process.env.EMAIL_USER || 'ownquesta@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'ownquesta@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'OwnQuesta';

if ((process.env.EMAIL_HOST || '').includes('hostinger.com') && EMAIL_USER.endsWith('@gmail.com')) {
  console.warn('EMAIL config warning: hostinger SMTP is being used with a Gmail address. Use Hostinger mailbox credentials or switch to Gmail SMTP.');
}

// Create transporter with multiple fallback options
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  debug: emailDebug,
  logger: emailDebug,
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to,
    subject: 'Welcome to Ownquesta',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <h1>Welcome to Ownquesta, ${name}</h1>
        
        <h2>Why Use Ownquesta?</h2>
        <p>Ownquesta automatically finds the best ML model for your data. No coding needed - upload data, get results with explanations.</p>
        
        <h2>How It Works</h2>
        <p>1. Upload dataset<br>
        2. AI tests models automatically<br>
        3. Review explanations<br>
        4. Download trained model</p>
        
        <h2>How It's Better</h2>
        <p>- Fully automated<br>
        - Explainable results<br>
        - Complete package<br>
        - No coding required</p>
        
      </body>
      </html>
    `,
  };

  try {
    await transporter.verify();
  } catch (err) {
    console.error('Email transporter verification failed (welcome email):', err);
    return { ok: false, error: err };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to', to);
    return { ok: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { ok: false, error };
  }
};

const sendNotificationEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.verify();
  } catch (err) {
    console.error('Email transporter verification failed:', err);
    return { ok: false, error: err };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent to', to, 'messageId=', info.messageId);
    return { ok: true, info };
  } catch (error) {
    console.error('Error sending notification email:', error);
    return { ok: false, error };
  }
};

module.exports = { sendWelcomeEmail, sendNotificationEmail, transporter };