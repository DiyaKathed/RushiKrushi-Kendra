const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

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
    console.log(`Connecting to external MongoDB at configured URI...`);
  }

  try {

    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
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

module.exports = { connectDB, disconnectDB };
