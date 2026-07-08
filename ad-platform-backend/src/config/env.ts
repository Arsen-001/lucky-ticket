import 'dotenv/config';
import { z } from 'zod';

/**
 * Validated environment config. Fails fast on boot if anything is missing or
 * malformed, so the app never runs in a half-configured state.
 */
const schema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Cron expression for the expired-tournament sweep. Default: every minute.
  EXPIRY_CRON: z.string().default('* * * * *'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
