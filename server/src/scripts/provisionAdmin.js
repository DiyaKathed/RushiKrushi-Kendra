const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const localEnvPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(localEnvPath)) {
  require('dotenv').config({ path: localEnvPath, override: true });
}
const { connectDB, disconnectDB } = require('../config/db');
const { provisionAdminAccount, TARGET_ADMIN_EMAIL } = require('../utils/adminProvisioner');

async function main() {
  try {
    console.log(`[CLI] Connecting to database to provision administrator (${TARGET_ADMIN_EMAIL})...`);
    await connectDB();
    const result = await provisionAdminAccount();
    console.log(`[CLI] Provisioning completed successfully.`);
    console.log(`[CLI] User: ${result.user.name} | Role: ${result.user.role} | Email: ${result.user.email}`);
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error(`[CLI] Admin provisioning failed:`, err.message || err);
    process.exit(1);
  }
}

main();
