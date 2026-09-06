import mongoose from 'mongoose';
import { config } from '../config/env.js';

export async function connectDB() {
  try {
    if (!config.mongoUri || config.mongoUri.includes('YOUR_DB_PASSWORD')) {
      console.error('❌ Cannot connect to MongoDB: MONGO_URI is missing or contains placeholder.');
      return false;
    }
    
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully.');
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    return false;
  }
}
