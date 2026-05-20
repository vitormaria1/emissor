import { NextResponse } from 'next/server';
import { z } from 'zod';

import { FocusClient } from '@emissor/focus';
import { logger } from '@emissor/logger';
import { env } from '@/env';

export const runtime = 'nodejs';

const schema = z.object({
  environment: z.enum(['HOMOLOGATION', 'PRODUCTION']),
  token: z.string().min(10),
  reference: z.string().min(6),
});

export async function POST(req: Request) {
  if (!env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'ADMIN_SECRET não configurado.' }, { status: 500 });
  }

  const secret = req.headers.get('x-admin-secret');
  if (secret !== env.ADMIN_SECRET) return new NextResponse('Unauthorized', { status: 401 });

  const body = (await req.json().catch(() => null)) as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.', issues: parsed.error.issues }, { status: 400 });
  }

  const { environment, token, reference } = parsed.data;
  const client = new FocusClient({ environment, token });

  try {
    const res = await client.consultarNfse(reference);
    return NextResponse.json({ ok: true, res });
  } catch (err) {
    logger.warn({ err }, 'focus.consult_test.error');
    return NextResponse.json({ ok: false, error: 'Erro ao consultar na Focus.', detail: String(err) }, { status: 502 });
  }
}

