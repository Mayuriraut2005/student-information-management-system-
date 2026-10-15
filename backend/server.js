const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/database');
const { getHealth } = require('./controllers/studentController');
const studentRoutes = require('./routes/studentRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// 1. HTTP Request Logger (Only non-sensitive logs)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 2. Request Parsing with reasonable size limits to prevent DoS
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 3. CORS Configuration
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl/Postman requests (where origin is undefined)
    if (!origin) return callback(null, true);

    // In development mode, allow any localhost or 127.0.0.1
    if (process.env.NODE_ENV !== 'production') {
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    // Check allowed origins list
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// 4. API Routes
app.get('/api/health', getHealth);
app.use('/api/students', studentRoutes);

// Root route helper
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Information Management System - REST API Service',
    docs: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      getStudents: 'GET /api/students',
      getStudent: 'GET /api/students/:id',
      createStudent: 'POST /api/students',
      updateStudent: 'PUT /api/students/:id',
      deleteStudent: 'DELETE /api/students/:id',
    },
  });
});

// 5. Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// 6. Server Initialization
const PORT = process.env.PORT || 5000;

let server;

// Only start the server when not imported by test suites
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB Atlas
  connectDB()
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`[Server] Express Application Tier listening on port ${PORT}`);
        console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
      });
    })
    .catch((err) => {
      console.error('[Server Startup Error] Could not connect to MongoDB Atlas. Exiting process.');
      process.exit(1);
    });

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('[Server] Received shutdown signal. Closing server...');
    if (server) {
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

module.exports = app;
