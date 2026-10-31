const dns = require('dns');
const mongoose = require('mongoose');

let mongod = null;

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

const connectDB = async () => {
  let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  // Allow explicit switch to local MongoDB Community Server in non-production environments
  if (process.env.NODE_ENV !== 'production' && process.env.USE_LOCAL_DB === 'true') {
    mongoURI = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';
    console.log('[Database] Explicit USE_LOCAL_DB flag detected: Connecting to local MongoDB Community Server...');
  }

  if (!mongoURI) {
    if (process.env.NODE_ENV === 'production') {
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

  const maxRetries = mongod ? 1 : 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        autoIndex: Boolean(mongod),
        serverSelectionTimeoutMS: 15000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
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
        console.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed (${error.name || 'Error'}: ${error.message}). Retrying in 1.5s...`);
        await mongoose.disconnect().catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  console.error(`MongoDB Connection Error: ${lastError.name || 'Error'} - ${lastError.message}`);

  if (lastError.reason?.type) {
    console.error(`Topology Type: ${lastError.reason.type}`);
  }

  if (lastError.reason?.servers) {
    const serverEntries = lastError.reason.servers instanceof Map
      ? Array.from(lastError.reason.servers.entries())
      : Object.entries(lastError.reason.servers);

    for (const [address, serverDesc] of serverEntries) {
      const hostname = serverDesc?.address || address;
      const errName = serverDesc?.error?.name || 'N/A';
      const errMsg = serverDesc?.error?.message || 'N/A';
      console.error(`  - Server: ${hostname} | ${errName}: ${errMsg}`);
    }
  }

  process.exit(1);
};

const disconnectDB = async () => {
  try {
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
