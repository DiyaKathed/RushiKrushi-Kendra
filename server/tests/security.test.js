const test = require('node:test');
const assert = require('node:assert');
const { connectDB } = require('../src/config/db');
const { getJwtSecret, validateJwtSecretForStartup, DEV_FALLBACK_SECRET } = require('../src/config/jwt');
const { getCorsOptions, validateStartupSecurity } = require('../src/config/cors');

test('Backend Production-Safety Security Test Suite', async (t) => {
  const originalEnv = { ...process.env };

  t.afterEach(() => {
    // Restore original environment after each subtest
    process.env = { ...originalEnv };
  });

  await t.test('1. Database: connectDB fails clearly in production when MONGODB_URI is missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;
    delete process.env.MONGO_URI;

    await assert.rejects(
      async () => {
        await connectDB();
      },
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(
          err.message.includes('FATAL: MONGODB_URI environment variable is required in production mode'),
          'Must throw clear fatal error for missing MONGODB_URI in production'
        );
        return true;
      }
    );
  });

  await t.test('2. JWT: getJwtSecret provides developer fallback in development and test environments', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;
    const devSecret = getJwtSecret();
    assert.strictEqual(devSecret, DEV_FALLBACK_SECRET);

    process.env.NODE_ENV = 'test';
    const testSecret = getJwtSecret();
    assert.strictEqual(testSecret, DEV_FALLBACK_SECRET);
  });

  await t.test('3. JWT: Production refuses to operate when JWT_SECRET is missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    assert.throws(
      () => {
        getJwtSecret();
      },
      (err) => {
        assert.ok(err.message.includes('FATAL: JWT_SECRET environment variable is missing in production mode'));
        return true;
      }
    );
  });

  await t.test('4. JWT: Production refuses weak JWT_SECRET with fewer than 32 characters', () => {
    process.env.NODE_ENV = 'production';
    const weakSecret = 'too_short_secret_123';
    process.env.JWT_SECRET = weakSecret;

    assert.throws(
      () => {
        getJwtSecret();
      },
      (err) => {
        assert.ok(err.message.includes('FATAL: JWT_SECRET is too weak for production mode'));
        // Verify the secret value is NEVER printed in error logs or messages
        assert.strictEqual(err.message.includes(weakSecret), false, 'Error message must NEVER print the secret value');
        return true;
      }
    );
  });

  await t.test('5. JWT: Production refuses known default or placeholder secrets', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'your_jwt_secret_key_minimum_32_characters_here';

    assert.throws(
      () => {
        getJwtSecret();
      },
      (err) => {
        assert.ok(err.message.includes('FATAL: JWT_SECRET appears to be a default placeholder'));
        return true;
      }
    );
  });

  await t.test('6. JWT: Production accepts strong, unique secret of >= 32 characters', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a';
    process.env.JWT_SECRET = strongSecret;

    const validated = getJwtSecret();
    assert.strictEqual(validated, strongSecret);
    assert.doesNotThrow(() => validateJwtSecretForStartup());
  });

  await t.test('7. CORS: Production refuses wildcard or missing CLIENT_URL', () => {
    process.env.NODE_ENV = 'production';

    // Missing CLIENT_URL
    delete process.env.CLIENT_URL;
    assert.throws(
      () => getCorsOptions(),
      (err) => {
        assert.ok(err.message.includes('FATAL: CLIENT_URL environment variable is required in production mode'));
        return true;
      }
    );

    // Wildcard CLIENT_URL
    process.env.CLIENT_URL = '*';
    assert.throws(
      () => getCorsOptions(),
      (err) => {
        assert.ok(err.message.includes('Wildcard CORS (*) is strictly prohibited'));
        return true;
      }
    );
  });

  await t.test('8. CORS: Production restricts origin to configured CLIENT_URL and rejects unauthorized origin', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CLIENT_URL = 'https://rushikrushi.com,https://www.rushikrushi.com';

    const corsOptions = getCorsOptions();
    assert.strictEqual(corsOptions.credentials, true);

    // Test allowed origin 1
    await new Promise((resolve, reject) => {
      corsOptions.origin('https://rushikrushi.com', (err, allow) => {
        if (err) return reject(err);
        assert.strictEqual(allow, true);
        resolve();
      });
    });

    // Test allowed origin 2
    await new Promise((resolve, reject) => {
      corsOptions.origin('https://www.rushikrushi.com', (err, allow) => {
        if (err) return reject(err);
        assert.strictEqual(allow, true);
        resolve();
      });
    });

    // Test disallowed origin
    await new Promise((resolve, reject) => {
      corsOptions.origin('https://unauthorized-attacker.com', (err, allow) => {
        try {
          assert.ok(err instanceof Error);
          assert.ok(err.message.includes('CORS policy violation'));
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  await t.test('9. Startup Security: validateStartupSecurity checks production prerequisites together', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_URL;

    // Fails on missing MONGODB_URI
    assert.throws(() => validateStartupSecurity(), /FATAL: MONGODB_URI/);

    // Fails on missing JWT_SECRET
    process.env.MONGODB_URI = 'mongodb://localhost:27017/prod';
    assert.throws(() => validateStartupSecurity(), /FATAL: JWT_SECRET/);

    // Fails on missing CLIENT_URL
    process.env.JWT_SECRET = 'a_very_strong_production_secret_key_at_least_32_characters';
    assert.throws(() => validateStartupSecurity(), /FATAL: CLIENT_URL/);

    // Passes when all production requirements are fulfilled
    process.env.CLIENT_URL = 'https://rushikrushi.com';
    assert.doesNotThrow(() => validateStartupSecurity());
  });
});
