import { prisma } from '@emissor/db';
import { FocusClient } from '@emissor/focus';

export async function getFocusClient(companyId: string, env: 'HOMOLOGATION' | 'PRODUCTION') {
  const cfg = await prisma.fiscalConfiguration.findUnique({
    where: { companyId },
    select: { focusTokenHomologation: true, focusTokenProduction: true },
  });

  const token = env === 'PRODUCTION' ? cfg?.focusTokenProduction : cfg?.focusTokenHomologation;
  if (!token) return null;

  return new FocusClient({ environment: env, token });
}

