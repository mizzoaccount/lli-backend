const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
require('dotenv').config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Enable CORS with credentials and specific origin
app.use(
    cors({
      origin: ['http://localhost:3000', 'https://legislativeleadershipinstitute.onrender.com'], // Allow requests from both origins
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true, // Allow sending cookies or authorization headers
    })
  );  

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount routers
app.use('/api/v1/auth', require('./routes/authRoutes'));

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
