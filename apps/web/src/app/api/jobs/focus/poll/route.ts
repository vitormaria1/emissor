import { NextResponse } from 'next/server';

import { prisma } from '@emissor/db';
import { logger } from '@emissor/logger';
import { FocusClient } from '@emissor/focus';
import { env } from '@/env';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (env.CRON_SECRET) {
    const secret = req.headers.get('x-cron-secret');
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    if (secret !== env.CRON_SECRET && querySecret !== env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  const candidates = await prisma.invoice.findMany({
    where: { status: { in: ['QUEUED', 'PROCESSING'] } },
    take: 50,
    orderBy: { createdAt: 'asc' },
    select: { id: true, reference: true, companyId: true, focusEnvironment: true },
  });

  let processed = 0;

  for (const inv of candidates) {
    const cfg = await prisma.fiscalConfiguration.findUnique({
      where: { companyId: inv.companyId },
      select: { focusTokenHomologation: true, focusTokenProduction: true },
    });

    const token =
      inv.focusEnvironment === 'PRODUCTION' ? cfg?.focusTokenProduction : cfg?.focusTokenHomologation;
    if (!token) continue;

    const client = new FocusClient({
      environment: inv.focusEnvironment,
      token,
    });

    try {
      const res = await client.consultarNfse(inv.reference);
      const status = guessStatus(res);

      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          focusResponse: res as any,
          focusLastStatus: status ?? undefined,
          status: status === 'AUTHORIZED' ? 'AUTHORIZED' : status === 'REJECTED' ? 'REJECTED' : 'PROCESSING',
          authorizedAt: status === 'AUTHORIZED' ? new Date() : undefined,
        },
      });

      processed += 1;
    } catch (err) {
      logger.warn({ err, reference: inv.reference }, 'focus.poll.error');
    }
  }

  return NextResponse.json({ ok: true, processed });
}

export async function GET(req: Request) {
  return POST(req);
}

function guessStatus(res: unknown): 'AUTHORIZED' | 'REJECTED' | null {
  const raw = JSON.stringify(res ?? {}).toLowerCase();
  if (raw.includes('autoriz')) return 'AUTHORIZED';
  if (raw.includes('rejeit') || raw.includes('erro')) return 'REJECTED';
  return null;
}
