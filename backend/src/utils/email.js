const nodemailer = require('nodemailer');

const emailDebug = process.env.EMAIL_DEBUG === 'true';
const EMAIL_USER = process.env.EMAIL_USER || 'ownquesta@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'ownquesta@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'OwnQuesta';
const INTRO_SIGNATURE_HTML = `
  <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; color: #334155;">
    <p style="margin: 0 0 8px;"><strong>Best regards,</strong></p>
    <p style="margin: 0;"><strong>ZS Brother</strong><br/>Founder, OwnQuesta<br/>Explainable AutoML Workflow Platform</p>
  </div>
`;
const SUPPORT_SIGNATURE_HTML = `
  <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; color: #334155;">
    <p style="margin: 0 0 8px;"><strong>Best regards,</strong></p>
    <p style="margin: 0;"><strong>OwnQuesta Support Team</strong></p>
  </div>
`;

if ((process.env.EMAIL_HOST || '').includes('hostinger.com') && EMAIL_USER.endsWith('@gmail.com')) {
  console.warn('EMAIL config warning: hostinger SMTP is being used with a Gmail address. Use Hostinger mailbox credentials or switch to Gmail SMTP.');
}

const withSignature = (html, signatureHtml) => {
  const raw = String(html || '');
  if (!raw.trim()) return signatureHtml;
  if (/Best regards,/i.test(raw) || /ZS Brother/i.test(raw) || /OwnQuesta Support Team/i.test(raw)) {
    return raw;
  }

  if (raw.includes('</body>')) {
    return raw.replace('</body>', `${signatureHtml}\n</body>`);
  }

  return `${raw}\n${signatureHtml}`;
};

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
    subject: 'Welcome to OwnQuesta - Start Your ML Journey',
    html: withSignature(`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; line-height: 1.55; color: #0f172a;">
        <h2 style="margin: 0 0 8px;">Hi ${name || 'there'},</h2>
        <p style="margin: 0 0 16px;">Welcome to OwnQuesta - the explainable AutoML workflow platform that makes machine learning accessible to everyone.</p>
        <p style="margin: 0 0 18px;">We are excited to have you on board. Let us get you started on your ML journey:</p>

        <h3 style="margin: 18px 0 8px;">Getting Started</h3>

        <p style="margin: 0 0 8px;"><strong>1. Explore the Platform</strong> - Start with our Tutorial Page or dive right into the AutoML Playground page from your Dashboard.</p>

        <p style="margin: 0 0 8px;"><strong>2. Choose Your Path</strong></p>
        <ul style="margin: 4px 0 12px 20px; padding: 0;">
          <li style="margin-bottom: 4px;">New to ML? Visit the Beginner section and check out "Know ML" to build your foundation.</li>
          <li style="margin-bottom: 4px;">Ready to build? Head to the ML Tutorial Page for hands-on guidance.</li>
        </ul>

        <p style="margin: 0 0 8px;"><strong>3. Build Your First Model</strong></p>
        <ul style="margin: 4px 0 12px 20px; padding: 0;">
          <li style="margin-bottom: 4px;">Choose between Easy Mode (guided) or Code Mode (advanced).</li>
          <li style="margin-bottom: 4px;">Select your OpenAI model for enhanced capabilities.</li>
          <li style="margin-bottom: 4px;">Upload your dataset and specify your target column.</li>
          <li style="margin-bottom: 4px;">Let the platform handle Data Analysis, Feature Engineering, and Preprocessing automatically.</li>
        </ul>

        <p style="margin: 0 0 8px;"><strong>4. Train and Evaluate</strong></p>
        <ul style="margin: 4px 0 12px 20px; padding: 0;">
          <li style="margin-bottom: 4px;">Select your model and configure the data pipeline.</li>
          <li style="margin-bottom: 4px;">Adjust split and cross-validation ratios.</li>
          <li style="margin-bottom: 4px;">Train and evaluate your model performance.</li>
          <li style="margin-bottom: 4px;">Get AI-powered explanations of results with the Agent Explain feature.</li>
        </ul>

        <p style="margin: 0 0 8px;"><strong>5. Deploy and Download</strong></p>
        <ul style="margin: 4px 0 12px 20px; padding: 0;">
          <li style="margin-bottom: 4px;">Download your trained model as .py, .ipynb, or script files.</li>
          <li style="margin-bottom: 4px;">Access comprehensive help documentation anytime.</li>
        </ul>

        <h3 style="margin: 18px 0 8px;">What Makes OwnQuesta Different?</h3>
        <ul style="margin: 4px 0 12px 20px; padding: 0;">
          <li style="margin-bottom: 4px;"><strong>Explainable AI:</strong> Understand not just what your model predicts, but why.</li>
          <li style="margin-bottom: 4px;"><strong>Flexible Workflow:</strong> Choose your comfort level from beginner-friendly to expert code mode.</li>
          <li style="margin-bottom: 4px;"><strong>Complete Pipeline:</strong> From data upload to model deployment, all in one platform.</li>
        </ul>

        <p style="margin: 0 0 8px;">Need help? Visit the Help Page or explore the tutorials. We are here to make your ML journey smooth and successful.</p>
        <p style="margin: 0; font-weight: 600;">Happy modeling!</p>
      </body>
      </html>
    `, INTRO_SIGNATURE_HTML),
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
    html: withSignature(html, SUPPORT_SIGNATURE_HTML),
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