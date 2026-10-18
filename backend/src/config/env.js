import 'dotenv/config';
import dns from 'node:dns';

// Fix for Node.js on Windows where local ISP/router DNS fails to query SRV records for mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore fallback
}

const mongoUri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
if (!mongoUri || !process.env.JWT_SECRET) {
  const missing = [];
  if (!mongoUri) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 5000),
  mongoUri,
  jwtSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_SECRET ?? process.env.JWT_SECRET,
  deviceHashSecret: process.env.DEVICE_HASH_SECRET ?? process.env.JWT_SECRET,
  clientOrigins: (process.env.CLIENT_URL ?? 'http://localhost:5173').split(',').map((url) => url.trim()),
};
