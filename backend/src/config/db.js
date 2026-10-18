import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDb() {
  if (mongoose.connection.readyState >= 1) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  if (!isConnected) {
    try {
      await mongoose.syncIndexes();
    } catch {
      // Index sync can fail gracefully
    }
    isConnected = true;
  }
  console.log('MongoDB connected');
}
