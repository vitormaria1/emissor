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
  invoice: z.object({
    data_emissao: z.string().optional(),
    natureza_operacao: z.coerce.number().int().min(1).max(6).default(1),
    optante_simples_nacional: z.coerce.boolean().default(false),
    regime_especial_tributacao: z.coerce.number().int().optional(),
  }),
  prestador: z.object({
    cnpj: z.string().min(14),
    inscricao_municipal: z.string().min(1),
    codigo_municipio: z.coerce.number().int().min(1),
  }),
  tomador: z.object({
    documento: z.string().min(11),
    razao_social: z.string().min(2),
    email: z.string().email().optional(),
    telefone: z.string().optional(),
    endereco: z.object({
      logradouro: z.string().min(1),
      numero: z.string().min(1),
      complemento: z.string().optional(),
      bairro: z.string().min(1),
      codigo_municipio: z.coerce.number().int().min(1),
      uf: z.string().min(2).max(2),
      cep: z.string().min(8),
    }),
  }),
  servico: z.object({
    discriminacao: z.string().min(5),
    valor_servicos: z.coerce.number().positive(),
    aliquota: z.coerce.number().min(0).max(100),
    item_lista_servico: z.string().min(3),
    iss_retido: z.coerce.boolean().default(false),
  }),
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

  const { environment, token, reference, invoice, prestador, tomador, servico } = parsed.data;

  const payload = {
    data_emissao: invoice.data_emissao ?? new Date().toISOString(),
    natureza_operacao: invoice.natureza_operacao,
    optante_simples_nacional: invoice.optante_simples_nacional,
    ...(invoice.regime_especial_tributacao
      ? { regime_especial_tributacao: invoice.regime_especial_tributacao }
      : {}),
    prestador: {
      cnpj: onlyDigits(prestador.cnpj),
      inscricao_municipal: prestador.inscricao_municipal,
      codigo_municipio: prestador.codigo_municipio,
    },
    tomador: {
      ...(isCnpj(tomador.documento)
        ? { cnpj: onlyDigits(tomador.documento) }
        : { cpf: onlyDigits(tomador.documento) }),
      razao_social: tomador.razao_social,
      ...(tomador.email ? { email: tomador.email } : {}),
      ...(tomador.telefone ? { telefone: tomador.telefone } : {}),
      endereco: {
        logradouro: tomador.endereco.logradouro,
        numero: tomador.endereco.numero,
        ...(tomador.endereco.complemento ? { complemento: tomador.endereco.complemento } : {}),
        bairro: tomador.endereco.bairro,
        codigo_municipio: tomador.endereco.codigo_municipio,
        uf: tomador.endereco.uf,
        cep: onlyDigits(tomador.endereco.cep),
      },
    },
    servico: {
      discriminacao: servico.discriminacao,
      valor_servicos: servico.valor_servicos,
      aliquota: servico.aliquota,
      item_lista_servico: servico.item_lista_servico,
      iss_retido: servico.iss_retido,
    },
  };

  const client = new FocusClient({ environment, token });
  try {
    const res = await client.emitirNfse(reference, payload);
    return NextResponse.json({ ok: true, payload, res });
  } catch (err) {
    logger.warn({ err }, 'focus.emit_simple.error');
    return NextResponse.json({ ok: false, payload, error: 'Erro ao emitir na Focus.', detail: String(err) }, { status: 502 });
  }
}

function onlyDigits(v: string) {
  return v.replace(/\D/g, '');
}

function isCnpj(doc: string) {
  return onlyDigits(doc).length === 14;
}

