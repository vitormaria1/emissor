import { z } from 'zod';

const runtimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  FOCUS_WEBHOOK_BASIC_USER: z.string().min(1).optional(),
  FOCUS_WEBHOOK_BASIC_PASS: z.string().min(1).optional(),
  ADMIN_SECRET: z.string().min(16).optional(),
});

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  CRON_SECRET: process.env.CRON_SECRET,
  FOCUS_WEBHOOK_BASIC_USER: process.env.FOCUS_WEBHOOK_BASIC_USER,
  FOCUS_WEBHOOK_BASIC_PASS: process.env.FOCUS_WEBHOOK_BASIC_PASS,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
};

function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

const parsed = runtimeEnvSchema.safeParse(rawEnv);
if (!parsed.success && !isBuildPhase()) {
  throw parsed.error;
}

export const env = (parsed.success ? parsed.data : rawEnv) as z.infer<typeof runtimeEnvSchema>;
