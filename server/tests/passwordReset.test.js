const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const crypto = require('crypto');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const authRoutes = require('../src/routes/auth');
const { _getMockSentEmails, _clearMockSentEmails } = require('../src/utils/emailService');

test('Password Reset Security & Lifecycle Test Suite', async (suite) => {
  let server;
  let baseUrl;
  const originalEnv = { ...process.env };

  // Set up Express test server with trust proxy to allow isolated test IPs
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  suite.before(async () => {
    await connectDB();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/auth`;
        resolve();
      });
    });
  });

  suite.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    process.env = { ...originalEnv };
  });

  suite.afterEach(() => {
    process.env = { ...originalEnv };
    _clearMockSentEmails();
  });

  // Helper function for sending JSON requests to test server with custom IP
  const post = async (endpoint, body, ip = '10.0.0.1') => {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': ip,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  await suite.test('1. Anti-Enumeration: returns generic message for non-existent and existing accounts', async () => {
    const GENERIC_MSG = 'If the provided account exists and has a valid email, password reset instructions have been sent.';

    // Non-existent user
    const resNonExistent = await post('/forgot-password', {
      identifier: 'unknown.nonexistent@rushikrushi.com',
    }, '10.0.1.1');
    assert.strictEqual(resNonExistent.status, 200);
    assert.strictEqual(resNonExistent.data.success, true);
    assert.strictEqual(resNonExistent.data.message, GENERIC_MSG);
    assert.strictEqual(resNonExistent.data.devCode, undefined);

    // Existing user without email
    await User.deleteOne({ phone: '9999900001' });
    const userNoEmail = await User.create({
      name: 'Phone Only Farmer',
      phone: '9999900001',
      password: 'InitialPassword@123',
      role: 'farmer',
    });

    const resNoEmail = await post('/forgot-password', {
      identifier: '9999900001',
    }, '10.0.1.2');
    assert.strictEqual(resNoEmail.status, 200);
    assert.strictEqual(resNoEmail.data.success, true);
    assert.strictEqual(resNoEmail.data.message, GENERIC_MSG);
    assert.strictEqual(resNoEmail.data.devCode, undefined);

    // Existing user with email
    await User.deleteOne({ email: 'test.farmer@rushikrushi.com' });
    const userWithEmail = await User.create({
      name: 'Email Farmer',
      phone: '9999900002',
      email: 'test.farmer@rushikrushi.com',
      password: 'InitialPassword@123',
      role: 'farmer',
    });

    const resWithEmail = await post('/forgot-password', {
      identifier: 'test.farmer@rushikrushi.com',
    }, '10.0.1.3');
    assert.strictEqual(resWithEmail.status, 200);
    assert.strictEqual(resWithEmail.data.success, true);
    assert.strictEqual(resWithEmail.data.message, GENERIC_MSG);
    // In dev/test, devCode is provided for test automation
    assert.ok(resWithEmail.data.devCode, 'devCode should be provided in non-production');
    assert.match(resWithEmail.data.devCode, /^\d{6}$/, 'devCode must be a 6-digit decimal code');

    // Clean up
    await User.deleteMany({ phone: { $in: ['9999900001', '9999900002'] } });
  });

  await suite.test('2. Cryptographic Security: stores only SHA-256 hash in DB, not plaintext code', async () => {
    const testEmail = 'crypto.test@rushikrushi.com';
    await User.deleteOne({ email: testEmail });
    const user = await User.create({
      name: 'Crypto Farmer',
      phone: '9999900003',
      email: testEmail,
      password: 'Password@123',
      role: 'farmer',
    });

    const res = await post('/forgot-password', { identifier: testEmail }, '10.0.2.1');
    assert.strictEqual(res.status, 200);
    const plaintextCode = res.data.devCode;
    assert.ok(plaintextCode);

    const updatedUser = await User.findOne({ email: testEmail });
    assert.ok(updatedUser.resetPasswordToken, 'Token must exist in database');

    // Verify token is a 64-char lowercase hex string
    assert.strictEqual(updatedUser.resetPasswordToken.length, 64);
    assert.match(updatedUser.resetPasswordToken, /^[0-9a-f]{64}$/);

    // Verify stored token is indeed SHA-256 hash of the generated plaintext code
    const expectedHash = crypto.createHash('sha256').update(plaintextCode).digest('hex');
    assert.strictEqual(updatedUser.resetPasswordToken, expectedHash);

    // Plaintext code must NOT be stored in any property of user document
    const userObj = updatedUser.toObject();
    assert.strictEqual(JSON.stringify(userObj).includes(plaintextCode), false, 'Plaintext code must NEVER appear in stored document');

    // Verify email mock received the message
    const mockEmails = _getMockSentEmails();
    assert.strictEqual(mockEmails.length, 1);
    assert.strictEqual(mockEmails[0].to, testEmail);
    assert.ok(mockEmails[0].text.includes(plaintextCode));

    await User.deleteOne({ email: testEmail });
  });

  await suite.test('3. Lifecycle: successful reset with valid code, single-use invalidation, and login verification', async () => {
    const testEmail = 'lifecycle@rushikrushi.com';
    await User.deleteOne({ email: testEmail });
    const user = await User.create({
      name: 'Lifecycle Farmer',
      phone: '9999900004',
      email: testEmail,
      password: 'OldPassword@123',
      role: 'farmer',
    });

    // Request reset code
    const forgotRes = await post('/forgot-password', { identifier: testEmail }, '10.0.3.1');
    const validCode = forgotRes.data.devCode;

    // Reset password using the code
    const newPassword = 'NewSecretPassword@456';
    const resetRes = await post('/reset-password', {
      identifier: testEmail,
      resetCode: validCode,
      newPassword,
    }, '10.0.3.2');

    assert.strictEqual(resetRes.status, 200);
    assert.strictEqual(resetRes.data.success, true);
    assert.strictEqual(resetRes.data.message, 'Password has been successfully reset. Please sign in.');

    // Verify single-use: token, expire, and attempts are cleared in DB
    const freshUser = await User.findOne({ email: testEmail });
    assert.strictEqual(freshUser.resetPasswordToken, undefined);
    assert.strictEqual(freshUser.resetPasswordExpire, undefined);
    assert.strictEqual(freshUser.resetPasswordAttempts, 0);

    // Verify user can now log in with the new password
    const loginNew = await post('/login', {
      identifier: testEmail,
      password: newPassword,
    }, '10.0.3.3');
    assert.strictEqual(loginNew.status, 200);
    assert.strictEqual(loginNew.data.success, true);
    assert.ok(loginNew.data.token, 'Must return JWT token on login');

    // Verify old password no longer works
    const loginOld = await post('/login', {
      identifier: testEmail,
      password: 'OldPassword@123',
    }, '10.0.3.4');
    assert.strictEqual(loginOld.status, 401);

    // Verify single-use enforcement: re-submitting the same code immediately fails
    const reattemptRes = await post('/reset-password', {
      identifier: testEmail,
      resetCode: validCode,
      newPassword: 'AnotherPassword@789',
    }, '10.0.3.5');
    assert.strictEqual(reattemptRes.status, 400);
    assert.strictEqual(reattemptRes.data.message, 'Invalid or expired password reset code');

    await User.deleteOne({ email: testEmail });
  });

  await suite.test('4. Expiry: 15-minute expiration rejects expired reset code', async () => {
    const testEmail = 'expired@rushikrushi.com';
    await User.deleteOne({ email: testEmail });
    const user = await User.create({
      name: 'Expired Farmer',
      phone: '9999900005',
      email: testEmail,
      password: 'Password@123',
      role: 'farmer',
    });

    const forgotRes = await post('/forgot-password', { identifier: testEmail }, '10.0.4.1');
    const validCode = forgotRes.data.devCode;

    // Manually expire the token in database
    await User.updateOne(
      { email: testEmail },
      { resetPasswordExpire: new Date(Date.now() - 1000) }
    );

    const resetRes = await post('/reset-password', {
      identifier: testEmail,
      resetCode: validCode,
      newPassword: 'BrandNewPassword@123',
    }, '10.0.4.2');

    assert.strictEqual(resetRes.status, 400);
    assert.strictEqual(resetRes.data.success, false);
    assert.strictEqual(resetRes.data.message, 'Password reset code has expired. Please request a new one.');

    // Token must be wiped after expiry detection
    const freshUser = await User.findOne({ email: testEmail });
    assert.strictEqual(freshUser.resetPasswordToken, undefined);

    await User.deleteOne({ email: testEmail });
  });

  await suite.test('5. Lockout: locks account code after 5 failed verification attempts', async () => {
    const testEmail = 'lockout@rushikrushi.com';
    await User.deleteOne({ email: testEmail });
    const user = await User.create({
      name: 'Lockout Farmer',
      phone: '9999900006',
      email: testEmail,
      password: 'Password@123',
      role: 'farmer',
    });

    const forgotRes = await post('/forgot-password', { identifier: testEmail }, '10.0.5.1');
    const correctCode = forgotRes.data.devCode;
    const wrongCode = '000000';

    // Attempts 1 to 4 fail with generic invalid code error
    for (let i = 1; i <= 4; i++) {
      const res = await post('/reset-password', {
        identifier: testEmail,
        resetCode: wrongCode,
        newPassword: 'Password@1234',
      }, `10.0.5.${10 + i}`);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.message, 'Invalid or expired password reset code');

      const u = await User.findOne({ email: testEmail });
      assert.strictEqual(u.resetPasswordAttempts, i);
      assert.ok(u.resetPasswordToken, 'Token should still exist before limit');
    }

    // 5th attempt invalidates token and locks the code
    const res5 = await post('/reset-password', {
      identifier: testEmail,
      resetCode: wrongCode,
      newPassword: 'Password@1234',
    }, '10.0.5.15');
    assert.strictEqual(res5.status, 400);
    assert.ok(res5.data.message.includes('Too many failed verification attempts'));

    // Verify token was erased from database
    const lockedUser = await User.findOne({ email: testEmail });
    assert.strictEqual(lockedUser.resetPasswordToken, undefined);
    assert.strictEqual(lockedUser.resetPasswordExpire, undefined);

    // Even if attacker now submits the correct code, it is rejected
    const resCorrectAfterLock = await post('/reset-password', {
      identifier: testEmail,
      resetCode: correctCode,
      newPassword: 'Password@1234',
    }, '10.0.5.16');
    assert.strictEqual(resCorrectAfterLock.status, 400);
    assert.strictEqual(resCorrectAfterLock.data.message, 'Invalid or expired password reset code');

    await User.deleteOne({ email: testEmail });
  });

  await suite.test('6. Legacy Defense: rejects old plaintext reset codes in database', async () => {
    const testEmail = 'legacy@rushikrushi.com';
    await User.deleteOne({ email: testEmail });
    await User.create({
      name: 'Legacy Farmer',
      phone: '9999900007',
      email: testEmail,
      password: 'Password@123',
      role: 'farmer',
      // Old schema stored plaintext 6-digit string
      resetPasswordToken: '654321',
      resetPasswordExpire: new Date(Date.now() + 15 * 60 * 1000),
      resetPasswordAttempts: 0,
    });

    const res = await post('/reset-password', {
      identifier: testEmail,
      resetCode: '654321',
      newPassword: 'NewPassword@123',
    }, '10.0.6.1');

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Invalid or expired password reset code');

    await User.deleteOne({ email: testEmail });
  });

  await suite.test('7. Production Redaction: devCode is never returned when NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    // Provide dummy SMTP credentials so getTransporter/sendMail does not throw configuration error
    process.env.SMTP_HOST = 'smtp.test.example';
    process.env.SMTP_USER = 'test-user';
    process.env.SMTP_PASS = 'test-pass';

    const testEmail = 'prod.redact@rushikrushi.com';
    await User.deleteOne({ email: testEmail });
    await User.create({
      name: 'Prod Farmer',
      phone: '9999900008',
      email: testEmail,
      password: 'Password@123',
      role: 'farmer',
    });

    // We stub nodemailer createTransport sendMail temporarily for this test
    const nodemailer = require('nodemailer');
    const origCreateTransport = nodemailer.createTransport;
    nodemailer.createTransport = () => ({
      sendMail: async () => ({ messageId: 'prod-test-id' }),
    });

    try {
      const res = await post('/forgot-password', { identifier: testEmail }, '10.0.7.1');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.devCode, undefined, 'devCode must be strictly undefined in production');
      assert.strictEqual('devCode' in res.data, false, 'devCode property must NOT be in production response');
    } finally {
      nodemailer.createTransport = origCreateTransport;
      await User.deleteOne({ email: testEmail });
    }
  });

  await suite.test('8. Fail Safely: email delivery failure in production returns 503 without exposing secrets', async () => {
    process.env.NODE_ENV = 'production';
    // Without SMTP credentials in production, sendPasswordResetEmail must fail safely
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const testEmail = 'prod.fail@rushikrushi.com';
    await User.deleteOne({ email: testEmail });
    await User.create({
      name: 'FailSafe Farmer',
      phone: '9999900009',
      email: testEmail,
      password: 'Password@123',
      role: 'farmer',
    });

    const res = await post('/forgot-password', { identifier: testEmail }, '10.0.8.1');
    assert.strictEqual(res.status, 503, 'Must return HTTP 503 Service Unavailable when email delivery fails in production');
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Password reset service is temporarily unavailable. Please try again later.');

    // Ensure no secrets, stack trace, or internal errors exposed in response
    assert.strictEqual(JSON.stringify(res.data).includes('SMTP'), false);
    assert.strictEqual(JSON.stringify(res.data).includes('Error'), false);

    // Verify token was wiped and not left active
    const user = await User.findOne({ email: testEmail });
    assert.strictEqual(user.resetPasswordToken, undefined);
    assert.strictEqual(user.resetPasswordExpire, undefined);

    await User.deleteOne({ email: testEmail });
  });

  await suite.test('9. Rate Limiting: IP-level limiters enforce 5 reset requests and 10 verification attempts', async () => {
    const spamIP = '192.168.100.99';

    // 1. forgotPasswordLimiter: max 5 requests per 15 min per IP
    for (let i = 1; i <= 5; i++) {
      const res = await post('/forgot-password', { identifier: 'spam@rushikrushi.com' }, spamIP);
      assert.strictEqual(res.status, 200);
    }
    const blockedForgot = await post('/forgot-password', { identifier: 'spam@rushikrushi.com' }, spamIP);
    assert.strictEqual(blockedForgot.status, 429, '6th request must be rate limited with HTTP 429');
    assert.strictEqual(blockedForgot.data.success, false);
    assert.ok(blockedForgot.data.message.includes('Too many password reset requests from this IP'));

    // 2. resetPasswordLimiter: max 10 requests per 15 min per IP
    const verifySpamIP = '192.168.100.100';
    for (let i = 1; i <= 10; i++) {
      const res = await post('/reset-password', {
        identifier: 'spam@rushikrushi.com',
        resetCode: '111111',
        newPassword: 'Password@123',
      }, verifySpamIP);
      assert.strictEqual(res.status, 400); // 400 invalid, not 429 yet
    }
    const blockedVerify = await post('/reset-password', {
      identifier: 'spam@rushikrushi.com',
      resetCode: '111111',
      newPassword: 'Password@123',
    }, verifySpamIP);
    assert.strictEqual(blockedVerify.status, 429, '11th request must be rate limited with HTTP 429');
    assert.strictEqual(blockedVerify.data.success, false);
    assert.ok(blockedVerify.data.message.includes('Too many reset verification attempts from this IP'));
  });
});
