import { env } from './src/config/env.js';
import { connectDb } from './src/config/db.js';
import { createApp } from './src/app.js';
import { startLifecycleJob } from './src/jobs/lifecycleJob.js';

const app = createApp();

// Middleware to ensure DB connection is established in serverless environments
app.use(async (_req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: 'Failed to connect to database' } });
  }
});

async function main() {
  await connectDb();
  app.listen(env.port, () => console.log(`Giveaway API listening on :${env.port} (${env.nodeEnv})`));
  startLifecycleJob();
}

// In long-lived server environments (Render, local, Docker)
if (!process.env.VERCEL) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;
