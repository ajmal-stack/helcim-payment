const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import routes
const indexRoutes = require('./routes/index');

// Initialize express app
const app = express();

// Try to connect to database, but continue if it fails
let dbConnected = false;
try {
  const connectDB = require('./config/db');
  connectDB()
    .then(() => {
      dbConnected = true;
      console.log('Database connected successfully');
    })
    .catch((err) => {
      console.error(
        'Database connection failed, but app will continue:',
        err.message
      );
    });
} catch (error) {
  console.error('Error loading database module:', error.message);
}

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests, etc)
      if (!origin) return callback(null, true);
      return callback(null, true); // Allow all origins in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Helcim API',
    dbStatus: dbConnected ? 'connected' : 'disconnected',
  });
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware to check DB before accessing example routes
const checkDbMiddleware = (req, res, next) => {
  if (!dbConnected && req.method !== 'GET') {
    return res.status(503).json({
      message: 'Database is not connected. Read operations only.',
    });
  }
  next();
};

// API routes
app.use('/api', indexRoutes);

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mock payment page: http://localhost:${PORT}/mock-payment.html`);
});
