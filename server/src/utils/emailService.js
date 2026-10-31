const nodemailer = require('nodemailer');

// Internal test/dev store for mock email delivery inspection
const _mockSentEmails = [];

/**
 * Validates whether production SMTP credentials are fully provided.
 */
function isEmailConfigured() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(host && user && pass);
}

/**
 * Creates Nodemailer transporter or returns mock interface in dev/test.
 */
function getTransporter() {
  const isProduction = process.env.NODE_ENV === 'production';
  const configured = isEmailConfigured();

  if (isProduction && !configured) {
    return null;
  }

  if (configured) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        // Enforce modern TLS standards without disabling certificate validation
        minVersion: 'TLSv1.2',
      },
    });
  }

  // Development and test mock transport (strictly forbidden in production)
  return {
    sendMail: async (mailOptions) => {
      _mockSentEmails.push(mailOptions);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[EmailService/Dev] Mock email recorded for: ${mailOptions.to}`);
      }
      return { messageId: `mock-${Date.now()}` };
    },
  };
}

/**
 * Sends a password reset email with the 6-digit code.
 *
 * @param {Object} options
 * @param {string} options.to Recipient email address
 * @param {string} options.name Recipient user/farmer name
 * @param {string} options.resetCode Six-digit plaintext verification code
 */
async function sendPasswordResetEmail({ to, name, resetCode }) {
  if (!to || !resetCode) {
    throw new Error('Recipient email and reset code are required');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const transporter = getTransporter();

  if (isProduction && !transporter) {
    console.error('[EmailService Error] Production SMTP credentials not configured.');
    throw new Error('Email delivery service is currently unavailable. Please contact store administrator.');
  }

  const fromAddress = process.env.EMAIL_FROM || '"Rushi Krushi Seva Kendra" <no-reply@rushikrushi.com>';
  const safeName = (name || 'Valued Member').trim();

  const subject = 'Rushi Krushi Seva Kendra - Password Reset Code / पासवर्ड रीसेट कोड';

  const textContent = `
Namaskar ${safeName},

You recently requested to reset your password for your Rushi Krushi Seva Kendra account.

Your 6-digit password reset code is: ${resetCode}

This code will expire in 15 minutes.
If you did not request a password reset, please ignore this email.

---
नमस्कार ${safeName},

आपण नुकतीच ऋषी कृषी सेवा केंद्र खात्याचा पासवर्ड रीसेट करण्याची विनंती केली आहे.

आपला ६-अंकी पासवर्ड रीसेट कोड: ${resetCode}

हा कोड १५ मिनिटांसाठी वैध आहे.
जर आपण ही विनंती केली नसेल, तर कृपया या ईमेलकडे दुर्लक्ष करा.

---
Rushi Krushi Seva Kendra, Pargaon, Ambegaon, Pune
Proprietor: Mahadeo Savleram Dhobale | Phone: +91 9890360271
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbf8; margin: 0; padding: 20px; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #d7e1d1; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #eaf2e3; padding-bottom: 16px; }
    .store-name { color: #245c2a; font-size: 20px; font-weight: bold; margin: 0; }
    .store-sub { color: #5d685b; font-size: 13px; margin-top: 4px; }
    .code-box { background: #eaf2e3; border: 2px dashed #245c2a; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #245c2a; font-family: monospace; }
    .expiry { color: #80552f; font-size: 12px; margin-top: 8px; font-weight: 600; }
    .footer { margin-top: 32px; border-top: 1px solid #eaf2e3; padding-top: 16px; font-size: 11px; color: #78716c; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="store-name">🌾 ऋषी कृषी सेवा केंद्र</h1>
      <p class="store-sub">Rushi Krushi Seva Kendra — Pargaon, Ambegaon, Pune</p>
    </div>
    <p>Namaskar <strong>${safeName}</strong>,</p>
    <p>Use the following 6-digit verification code to reset your account password:</p>
    <div class="code-box">
      <div class="code">${resetCode}</div>
      <div class="expiry">Valid for 15 minutes only / फक्त १५ मिनिटांसाठी वैध</div>
    </div>
    <p style="font-size: 13px; color: #5d685b;">
      हा कोड १५ मिनिटांत कालबाह्य होईल. जर आपण ही विनंती केली नसेल, तर कृपया या संदेशाकडे दुर्लक्ष करा.
    </p>
    <div class="footer">
      <p>Proprietor: Mahadeo Savleram Dhobale | Contact: +91 9890360271</p>
      <p>This is an automated security email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`.trim();

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    if (isProduction) {
      console.log(`[EmailService] Password reset verification email dispatched successfully.`);
    }

    return info;
  } catch (err) {
    console.error(`[EmailService Error] Failed sending email: ${err.message}`);
    throw new Error('Failed to deliver password reset email. Please try again later.');
  }
}

function _getMockSentEmails() {
  return [..._mockSentEmails];
}

function _clearMockSentEmails() {
  _mockSentEmails.length = 0;
}

module.exports = {
  sendPasswordResetEmail,
  isEmailConfigured,
  _getMockSentEmails,
  _clearMockSentEmails,
};
