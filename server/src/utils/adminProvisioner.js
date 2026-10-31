const crypto = require('crypto');
const User = require('../models/User');

const TARGET_ADMIN_EMAIL = 'rushikrushi99@gmail.com';
const TARGET_ADMIN_PHONE = process.env.ADMIN_PHONE || '9890360099';
const TARGET_ADMIN_NAME = process.env.ADMIN_NAME || 'Rushi Krushi Kendra Admin';

/**
 * Idempotently provisions the store administrator (rushikrushi99@gmail.com)
 * without hardcoding plaintext passwords.
 *
 * - If user does not exist: creates with ADMIN_INITIAL_PASSWORD if defined in env,
 *   otherwise generates a secure random temporary password and an initial setup reset code.
 * - If user exists: guarantees role is strictly 'admin' without altering the user's password.
 */
async function provisionAdminAccount(options = {}) {
  const targetEmail = (options.email || TARGET_ADMIN_EMAIL).trim().toLowerCase();
  const targetPhone = (options.phone || TARGET_ADMIN_PHONE).trim();
  const targetName = options.name || TARGET_ADMIN_NAME;

  // 1. Check if user already exists by email or phone
  let user = await User.findOne({
    $or: [{ email: targetEmail }, { phone: targetPhone }],
  });

  if (user) {
    let modified = false;
    if (user.role !== 'admin') {
      user.role = 'admin';
      modified = true;
    }
    if (user.email !== targetEmail) {
      user.email = targetEmail;
      modified = true;
    }
    if (modified) {
      await user.save();
      console.log(`[Admin Provisioning] Updated existing user (${targetEmail}) to role 'admin'.`);
    } else {
      console.log(`[Admin Provisioning] Admin account already configured and verified: ${targetEmail}`);
    }
    return { user, created: false };
  }

  // 2. User does not exist: determine initial password
  const envPassword = process.env.ADMIN_INITIAL_PASSWORD;
  const initialPassword = envPassword && envPassword.trim()
    ? envPassword.trim()
    : crypto.randomBytes(16).toString('hex');

  // If using an auto-generated password, set a 24-hour setup reset code so admin can configure their password immediately
  const setupCode = crypto.randomInt(100000, 1000000).toString();
  const hashedSetupCode = crypto.createHash('sha256').update(setupCode).digest('hex');

  user = await User.create({
    name: targetName,
    phone: targetPhone,
    email: targetEmail,
    password: initialPassword,
    role: 'admin',
    preferredLanguage: 'mr',
    village: 'Pargaon',
    taluka: 'Ambegaon',
    district: 'Pune',
    isVerified: true,
    resetPasswordToken: !envPassword ? hashedSetupCode : undefined,
    resetPasswordExpire: !envPassword ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
    resetPasswordAttempts: 0,
  });

  console.log(`[Admin Provisioning] Created new administrator: ${user.name} (${targetEmail})`);
  if (!envPassword && process.env.NODE_ENV !== 'production') {
    console.log(`[Admin Provisioning] Password setup available via /forgot-password or initial setup code.`);
  }

  return { user, created: true, hasEnvPassword: Boolean(envPassword) };
}

module.exports = {
  provisionAdminAccount,
  TARGET_ADMIN_EMAIL,
  TARGET_ADMIN_PHONE,
};
