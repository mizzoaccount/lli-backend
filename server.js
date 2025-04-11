const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const errorHandler = require('./middleware/errorMiddleware');
const fileUpload = require('express-fileupload'); // Add this

// Load env vars
require('dotenv').config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Enable CORS with credentials and specific origin
app.use(
  cors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'https://legislativeleadershipinstitute.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Regular body parsing middleware (for non-file routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware (must come after regular body parsers)
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds the 5MB limit',
}));

// Mount routers
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/services', require('./routes/serviceRoutes'));
app.use('/api/v1/experts', require('./routes/expertRoutes'));
app.use('/api/v1/workshops', require('./routes/workshopRoutes'));


// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});