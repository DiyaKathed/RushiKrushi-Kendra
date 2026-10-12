require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
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
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiter for Authentication & Contact Form
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
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
app.use('/api/enquiries', authLimiter, enquiryRoutes);
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
    await connectDB();

    // Auto-seed if database is empty or running on embedded instance
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database appears empty. Executing automatic initial seed...');
      await runSeed();
    } else {
      // Ensure admin is provisioned even if products were already seeded
      await provisionAdminAccount();
    }

    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌾 Rushi Krushi Seva Kendra Backend API running on port ${PORT}`);
      console.log(`📍 Pargaon, Ambegaon, Pune | Proprietor: Mahadeo Dhobale`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
