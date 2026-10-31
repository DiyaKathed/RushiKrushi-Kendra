/**
 * CORS Configuration & Startup Security Policy
 *
 * Enforces production security rules:
 * - Production REQUIRES CLIENT_URL to be set to a specific, trusted origin.
 * - Wildcard CORS (*) is strictly prohibited in production.
 * - Local development allows standard developer frontend access.
 */

const { validateJwtSecretForStartup } = require('./jwt');

/**
 * Validates production environment variables during application startup.
 * Throws a fatal error and prevents the server from booting if security
 * requirements are violated.
 */
function validateStartupSecurity() {
  if (process.env.NODE_ENV === 'production') {
    // 1. Ensure persistent database is configured
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI || mongoURI.trim() === '') {
      throw new Error(
        'FATAL: MONGODB_URI environment variable is required in production mode. Refusing to boot with in-memory storage.'
      );
    }

    // 2. Ensure JWT secret is present, sufficiently long, and not a default placeholder
    validateJwtSecretForStartup();

    // 3. Ensure frontend CLIENT_URL is present and not a wildcard
    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl || clientUrl.trim() === '' || clientUrl.trim() === '*' || clientUrl.includes('*')) {
      throw new Error(
        'FATAL: CLIENT_URL environment variable is required in production mode. Wildcard CORS (*) is strictly prohibited.'
      );
    }
  }
}

/**
 * Returns Express CORS middleware options based on current environment.
 */
function getCorsOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl || clientUrl.trim() === '' || clientUrl.trim() === '*' || clientUrl.includes('*')) {
      throw new Error(
        'FATAL: CLIENT_URL environment variable is required in production mode. Wildcard CORS (*) is strictly prohibited.'
      );
    }

    const allowedOrigins = clientUrl
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, server-to-server, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy violation: Origin '${origin}' is not permitted.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
  }

  // Development & Testing: convenient local development access
  const devOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean)
    : ['http://localhost:5180', 'http://127.0.0.1:5180', 'http://localhost:5173'];

  return {
    origin: (origin, callback) => {
      if (
        !origin ||
        devOrigins.includes(origin) ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

module.exports = {
  validateStartupSecurity,
  getCorsOptions,
};
