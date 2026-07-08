import express from 'express';

import { env } from './config/env';
import { startExpiryCron } from './cron/expiry.cron';
import { errorHandler } from './middleware/errorHandler';
import { tournamentsRouter } from './routes/tournaments.routes';

const app = express();

app.use(express.json());

// Liveness probe.
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/tournaments', tournamentsRouter);

// Error middleware must be registered last.
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 Ad-platform API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  startExpiryCron();
});
