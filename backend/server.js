import { env } from './src/config/env.js';
import { connectDb } from './src/config/db.js';
import { createApp } from './src/app.js';
import { startLifecycleJob } from './src/jobs/lifecycleJob.js';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => console.log(`Giveaway API listening on :${env.port} (${env.nodeEnv})`));
  startLifecycleJob();
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
