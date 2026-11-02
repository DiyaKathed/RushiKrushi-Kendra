const { connectDB, isEmbeddedDB } = require('./config/db');
const fs = require('fs');
const path = require('path');
// Load default environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// If .env.local exists, load it with overrides (for local development database settings)
const localEnvPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(localEnvPath)) {
  require('dotenv').config({ path: localEnvPath, override: true });
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { getCorsOptions, validateStartupSecurity } = require('./config/cors');
const { runSeed } = require('./seed/seed');
const { provisionAdminAccount } = require('./utils/adminProvisioner');
const Product = require('./models/Product');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cropRoutes = require('./routes/crops');
const farmerCropRoutes = require('./routes/farmerCrops');
const articleRoutes = require('./routes/articles');
const enquiryRoutes = require('./routes/enquiries');
const bookingRoutes = require('./routes/bookingRoutes');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration (Strict origin in production, convenient dev access in development)
app.use(cors(getCorsOptions()));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiter for Authentication Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Rushi Krushi Seva Kendra',
    proprietor: 'Mahadeo Savleram Dhobale',
    location: 'Pargaon, Ambegaon, Pune',
    phone: '+91 9890360271',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/farmer-crops', farmerCropRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/enquiries', enquiryRoutes); // Dedicated limiter applied inside enquiries router to POST only
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

const PORT = process.env.PORT || 5050;

// Start Server and ensure DB connection & seeding
let server;
const startServer = async () => {
  try {
    validateStartupSecurity();
    await connectDB();

    // Auto-seed ONLY if running on embedded in-memory database and it is empty.
    // External databases (Atlas) must NEVER be automatically seeded or modified on startup to preserve production records.
    if (isEmbeddedDB()) {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('Embedded in-memory database is empty. Executing initial dev seed...');
        await runSeed();
      }
    } else {
      console.log('Connected to external MongoDB database. Preserving existing records and admin accounts without seeding.');
    }

    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌾 Rushi Krushi Seva Kendra Backend API running on port ${PORT}`);
      console.log(`📍 Pargaon, Ambegaon, Pune | Proprietor: Mahadeo Dhobale`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start server when run directly from Node CLI
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, getCorsOptions, validateStartupSecurity };
