const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();
const authRouter = require('./routes/auth');
const carRouter = require('./routes/cars');
const newsRouter = require('./routes/news');
const blogRouter = require('./routes/blogs');
const marketRouter = require('./routes/market');
const reviewRouter = require('./routes/reviews');
const forumRouter = require('./routes/forums');
const maintenanceRouter = require('./routes/maintenance');
const fuelEconomyRouter = require('./routes/fuelEconomy');
const commonIssuesRouter = require('./routes/commonIssues');
const marketDataUpdater = require('./tasks/marketDataUpdater');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cars', carRouter);
app.use('/api/news', newsRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/market', marketRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/forums', forumRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/fuel-economy', fuelEconomyRouter);
app.use('/api/common-issues', commonIssuesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
    
    // Start the market data updater task
    // marketDataUpdater.start(); // <-- Removed, cron job runs on import
    console.log('Market data updater task started');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal');
  
  // Stop accepting new requests
  server.close(() => {
    console.log('Closed out remaining connections');
    
    // Close MongoDB connection
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

