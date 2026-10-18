import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  // Unique indexes are what stop duplicate participation under race conditions,
  // so make sure they exist before serving traffic.
  await mongoose.syncIndexes();
  console.log('MongoDB connected');
}
