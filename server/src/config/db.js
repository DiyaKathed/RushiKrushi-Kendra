const dns = require('dns');
const mongoose = require('mongoose');

let mongod = null;
let bgRetryTimer = null;
let isConnecting = false;

/**
 * Ensures reliable DNS resolution for MongoDB Atlas SRV connection strings.
 * On macOS and some home Wi-Fi routers, the default resolver can be an IPv6 link-local address
 * (e.g. fe80::...) which fails with EBADRESP on SRV lookups. This configures reliable public
 * DNS fallbacks (Google 8.8.8.8, Cloudflare 1.1.1.1) when problematic resolvers are detected.
 */
const configureDnsServers = () => {
  if (process.env.DNS_SERVERS) {
    const custom = process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean);
    if (custom.length > 0) {
      dns.setServers(custom);
      return;
    }
  }

  try {
    const servers = dns.getServers();
    const hasProblematicServer = servers.some((s) => s.startsWith('fe80:') || s === '::1');
    if (hasProblematicServer) {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    }
  } catch {
    // Proceed with default resolver if check fails
  }
};

// Register connection event handlers once to handle background pool notifications and avoid uncaught exceptions
mongoose.connection.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`[Database] Connection pool notification: ${err.message || err}`);
  }
});

const getMongooseOptions = (mongoURI) => {
  const options = {
    autoIndex: Boolean(mongod),
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
    minPoolSize: 1,
    retryWrites: true,
  };

  if (mongoURI && (mongoURI.startsWith('mongodb+srv:') || mongoURI.includes('ssl=true') || mongoURI.includes('tls=true'))) {
    options.tls = true;
  }

  return options;
};

/**
 * Attempts a single clean connection to MongoDB, ensuring any previous
 * uncompleted or failed socket pools are cleanly drained first.
 */
const attemptConnect = async (mongoURI) => {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }
  return await mongoose.connect(mongoURI, getMongooseOptions(mongoURI));
};

const connectDB = async () => {
  if (isConnecting) return mongoose.connection;
  isConnecting = true;

  let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  // Allow explicit switch to local MongoDB Community Server in non-production environments
  if (process.env.NODE_ENV !== 'production' && process.env.USE_LOCAL_DB === 'true') {
    mongoURI = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';
    console.log('[Database] Explicit USE_LOCAL_DB flag detected: Connecting to local MongoDB Community Server...');
  }

  if (!mongoURI) {
    if (process.env.NODE_ENV === 'production') {
      isConnecting = false;
      throw new Error(
        'FATAL: MONGODB_URI environment variable is required in production mode. Refusing to boot with in-memory storage.'
      );
    }
    console.log('No MONGODB_URI detected in environment. Starting embedded MongoDB instance for seamless local execution...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    mongoURI = mongod.getUri();
    console.log(`Embedded MongoDB started successfully at: ${mongoURI}`);
  } else {
    if (mongoURI.startsWith('mongodb+srv:')) {
      configureDnsServers();
    }
    console.log(`Connecting to MongoDB at configured URI...`);
  }

  const maxRetries = mongod ? 1 : 10;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await attemptConnect(mongoURI);
      if (bgRetryTimer) {
        clearInterval(bgRetryTimer);
        bgRetryTimer = null;
      }
      isConnecting = false;
      console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      lastError = error;
      await mongoose.disconnect().catch(() => {});

      if (
        error.code === 'EBADRESP' ||
        error.syscall === 'querySrv' ||
        error.message?.includes('querySrv') ||
        error.message?.includes('EBADRESP')
      ) {
        console.warn('DNS SRV resolution failure detected. Switching to reliable public DNS resolvers (8.8.8.8, 1.1.1.1)...');
        try {
          dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        } catch {}
      }

      if (attempt < maxRetries) {
        // Exponential backoff with random jitter (e.g. 1s -> 1.5s -> 2.25s ... capped at 5s)
        const baseDelay = Math.min(1000 * Math.pow(1.5, attempt - 1), 5000);
        const jitter = Math.floor(Math.random() * 500);
        const delay = baseDelay + jitter;

        console.warn(
          `MongoDB connection attempt ${attempt}/${maxRetries} failed (${error.name || 'Error'}: ${error.message}). Retrying in ${(delay / 1000).toFixed(1)}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  isConnecting = false;
  console.error(`MongoDB Connection Error: ${lastError.name || 'Error'} - ${lastError.message}`);

  // In production or test environments, fail decisively
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw lastError;
  }

  // In local development, do not crash node --watch. Keep the server process alive and retry in the background.
  console.warn(
    `[Database] Development notice: Atlas connection encountered transient errors (${lastError.message}).`
  );
  console.warn(
    `[Database] Keeping development server alive. Retrying connection in background every 5 seconds...`
  );

  if (!bgRetryTimer) {
    bgRetryTimer = setInterval(async () => {
      try {
        const conn = await attemptConnect(mongoURI);
        clearInterval(bgRetryTimer);
        bgRetryTimer = null;
        console.log(`====================================================`);
        console.log(`🌾 MongoDB Atlas Background Connection Re-established!`);
        console.log(`Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
        console.log(`====================================================`);
      } catch (retryErr) {
        // Continue waiting for healthy ingress node
      }
    }, 5000);
    bgRetryTimer.unref();
  }

  return mongoose.connection;
};

const disconnectDB = async () => {
  try {
    if (bgRetryTimer) {
      clearInterval(bgRetryTimer);
      bgRetryTimer = null;
    }
    isConnecting = false;
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

const isEmbeddedDB = () => Boolean(mongod);

module.exports = { connectDB, disconnectDB, isEmbeddedDB };
