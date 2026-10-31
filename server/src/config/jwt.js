/**
 * JWT Configuration and Production Security Validator
 *
 * Enforces production safety rules:
 * - Production REQUIRES a cryptographically strong JWT_SECRET with at least 32 characters.
 * - Refuses default or placeholder keys in production.
 * - NEVER prints or logs secret values.
 * - Allows convenient developer fallback in development/test environments.
 */

const KNOWN_INSECURE_SECRETS = new Set([
  'rushikrushi_jwt_secret_dev_key_2026',
  'your_jwt_secret_key_minimum_32_characters_here',
  'your_jwt_secret_key_here',
  'secret',
  'changeme',
  'password',
  '12345678901234567890123456789012',
  'default_jwt_secret_key_for_development',
]);

const MIN_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = 'rushikrushi_jwt_secret_dev_key_2026';

/**
 * Retrieves the JWT secret with strict environment-aware validation.
 *
 * @returns {string} The validated JWT secret.
 * @throws {Error} In production if the secret is missing, too short, or an insecure placeholder.
 */
function getJwtSecret() {
  const isProduction = process.env.NODE_ENV === 'production';
  const envSecret = process.env.JWT_SECRET;

  if (isProduction) {
    if (!envSecret || envSecret.trim().length === 0) {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing in production mode. Refusing to operate without a secure secret.'
      );
    }

    const trimmedSecret = envSecret.trim();

    if (trimmedSecret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `FATAL: JWT_SECRET is too weak for production mode (length is ${trimmedSecret.length}, minimum required is ${MIN_SECRET_LENGTH} characters). Refusing to operate with weak secret.`
      );
    }

    if (KNOWN_INSECURE_SECRETS.has(trimmedSecret.toLowerCase())) {
      throw new Error(
        'FATAL: JWT_SECRET appears to be a default placeholder or known insecure key. A unique, cryptographically strong secret is required in production.'
      );
    }

    return trimmedSecret;
  }

  // Development & Test fallback
  return envSecret && envSecret.trim().length > 0
    ? envSecret.trim()
    : DEV_FALLBACK_SECRET;
}

/**
 * Validates JWT security settings during server startup.
 * Called before the server begins listening to network traffic.
 */
function validateJwtSecretForStartup() {
  if (process.env.NODE_ENV === 'production') {
    getJwtSecret();
  }
}

module.exports = {
  getJwtSecret,
  validateJwtSecretForStartup,
  MIN_SECRET_LENGTH,
  DEV_FALLBACK_SECRET,
};
