'use client';

import { useMemo, useState } from 'react';

type Env = 'HOMOLOGATION' | 'PRODUCTION';

export default function EmitTestPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [environment, setEnvironment] = useState<Env>('HOMOLOGATION');
  const [token, setToken] = useState('');
  const [reference, setReference] = useState(`teste_${Date.now()}`);
  const [payload, setPayload] = useState('{\n  "prestador": {},\n  "tomador": {},\n  "servico": {}\n}\n');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => adminSecret.length >= 16 && token.length >= 10 && reference.length >= 6,
    [adminSecret, token, reference],
  );

  async function emit() {
    setLoading(true);
    setResult('');
    try {
      const parsedPayload = JSON.parse(payload);
      const res = await fetch('/api/focus/emit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ environment, token, reference, payload: parsedPayload }),
      });
      const json = await res.json().catch(() => ({}));
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function consult() {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/focus/consult-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ environment, token, reference }),
      });
      const json = await res.json().catch(() => ({}));
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold">Validação rápida — Emissão NFS-e (Focus)</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Endpoint temporário para validar emissão/consulta sem login. Removeremos depois.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">ADMIN_SECRET</label>
          <input
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
            placeholder="Cole o ADMIN_SECRET"
          />
          <p className="text-xs text-zinc-500">Protege os endpoints de teste.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Ambiente</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as Env)}
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
          >
            <option value="HOMOLOGATION">Homologação</option>
            <option value="PRODUCTION">Produção</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Token Focus</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
            placeholder="Cole o token da Focus (não fica salvo)"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Referência</label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 font-mono text-xs outline-none focus:border-zinc-400"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Payload (JSON)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="min-h-72 w-full rounded-xl border border-zinc-200 px-3 py-2 font-mono text-xs outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex gap-3 md:col-span-2">
          <button
            disabled={!canSubmit || loading}
            className="h-11 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            onClick={emit}
            type="button"
          >
            {loading ? 'Processando…' : 'Emitir'}
          </button>
          <button
            disabled={!canSubmit || loading}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            onClick={consult}
            type="button"
          >
            Consultar status
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Resultado</h2>
        <pre className="mt-2 overflow-auto rounded-xl border border-zinc-200 bg-white p-4 text-xs">
          {result || '—'}
        </pre>
      </div>
    </div>
  );
}

