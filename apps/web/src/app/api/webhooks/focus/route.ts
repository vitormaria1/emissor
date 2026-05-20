import { NextResponse } from 'next/server';

import { prisma } from '@emissor/db';
import { logger } from '@emissor/logger';
import { env } from '@/env';
import { requireBasicAuth } from '@/lib/http-auth';

export async function POST(req: Request) {
  if (env.FOCUS_WEBHOOK_BASIC_USER && env.FOCUS_WEBHOOK_BASIC_PASS) {
    const auth = requireBasicAuth(req, env.FOCUS_WEBHOOK_BASIC_USER, env.FOCUS_WEBHOOK_BASIC_PASS);
    if (!auth.ok) return new NextResponse('Unauthorized', { status: auth.status });
  }

  const payload = (await req.json().catch(() => null)) as unknown;

  // A Focus pode enviar diferentes eventos; guardamos o payload bruto
  // e processamos de forma assíncrona posteriormente.
  const reference =
    typeof (payload as any)?.ref === 'string'
      ? ((payload as any).ref as string)
      : typeof (payload as any)?.referencia === 'string'
        ? ((payload as any).referencia as string)
        : undefined;

  await prisma.webhookEvent.create({
    data: {
      provider: 'focus',
      eventType: typeof (payload as any)?.tipo === 'string' ? (payload as any).tipo : 'unknown',
      reference,
      payload: payload ?? {},
    },
  });

  logger.info({ reference }, 'webhook.focus.received');
  return NextResponse.json({ ok: true });
}

