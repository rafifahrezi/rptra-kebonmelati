import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is undefined in environment variables');
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');

    if (mongoose.connection.db) {
      console.log('Connected to database:', mongoose.connection.db.databaseName);
    } else {
      console.warn('Warning: mongoose.connection.db is undefined');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Database connection failed');
  }
};

export default connectDB;