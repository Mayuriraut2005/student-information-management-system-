const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using Mongoose
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Configure connection options
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Redact credentials from logs
    const safeMsg = (error.message || '').replace(/mongodb\+srv:\/\/[^@]+@/g, 'mongodb+srv://[REDACTED]@');
    console.error(`[Database Error] Connection failed: ${safeMsg}`);
    throw error;
  }
};

/**
 * Check if the MongoDB connection is alive
 * 1 = connected, 2 = connecting, 0 = disconnected, 3 = disconnecting
 */
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDBConnected };
