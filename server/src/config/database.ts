import mongoose from 'mongoose';
import { config } from './env';
import { Logger } from '../utils/logger';

export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Set up connection event listeners once
mongoose.connection.on('connected', () => {
  Logger.info('Database', '✅ MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  Logger.warn('Database', '⚠️ MongoDB connection lost/disconnected');
});

mongoose.connection.on('error', (err) => {
  Logger.error('Database', `❌ MongoDB connection error: ${err.message}`);
});

export const connectDB = async (retries = 5, delayMs = 3000): Promise<boolean> => {
  const uri = config.mongoUri;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      Logger.info('Database', '✅ MongoDB connected successfully');
      return true;
    } catch (error: any) {
      Logger.error(
        'Database',
        `❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`
      );
      if (attempt < retries) {
        Logger.info('Database', `Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  Logger.error(
    'Database',
    '🚨 Could not connect to MongoDB after multiple attempts. Application will start but DB features will return 503 until connection is restored.'
  );
  return false;
};