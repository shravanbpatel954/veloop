import 'dotenv/config';
import dns from 'node:dns';

// Fix for Node.js on Windows where local ISP/router DNS fails to query SRV records for mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore fallback
}

const fallbackMongoUri = 'mongodb+srv://shravanbpatel954_db_user:NhzFXJMMnk84Y7uV@cluster0.sca4ood.mongodb.net/veloop_giveaway?retryWrites=true&w=majority';
const mongoUri = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? fallbackMongoUri;
const jwtSecret = process.env.JWT_SECRET ?? 'veloop-production-jwt-secret-key-fallback-2026';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 5000),
  mongoUri,
  jwtSecret,
  refreshSecret: process.env.REFRESH_SECRET ?? jwtSecret,
  deviceHashSecret: process.env.DEVICE_HASH_SECRET ?? jwtSecret,
  clientOrigins: (process.env.CLIENT_URL ?? 'http://localhost:5173').split(',').map((url) => url.trim()),
};
