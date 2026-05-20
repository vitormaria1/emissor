'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

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
    <div className="bg-grid min-h-dvh bg-white">
      <header className="border-b border-zinc-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-2xl ring-1 ring-zinc-200">
              <Image src="/prazer-logo.png" alt="Prazer, eu sou seu contador" fill />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-zinc-900">Prazer, eu sou seu contador</p>
              <p className="text-xs text-zinc-600">Emissor de NFS-e</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-zinc-600 md:flex">
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">Focus NFe</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">Homolog/Prod</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">Sem login (teste)</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h1 className="text-xl font-semibold text-zinc-900">Validação rápida de emissão</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Use este painel para enviar/consultar uma NFS-e na Focus e validar o fluxo técnico. Depois
                trocamos por telas finais do emissor.
              </p>

              <div className="mt-6 grid gap-4">
                <Field label="ADMIN_SECRET" hint="Protege os endpoints de teste.">
                  <input
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-zinc-200 px-3 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                    placeholder="Cole o ADMIN_SECRET"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Ambiente">
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as Env)}
                      className="h-11 w-full rounded-2xl border border-zinc-200 px-3 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                    >
                      <option value="HOMOLOGATION">Homologação</option>
                      <option value="PRODUCTION">Produção</option>
                    </select>
                  </Field>

                  <Field label="Referência">
                    <input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="h-11 w-full rounded-2xl border border-zinc-200 px-3 font-mono text-xs outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                    />
                  </Field>
                </div>

                <Field label="Token Focus" hint="Não fica salvo. Cole o token de homologação/produção.">
                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-zinc-200 px-3 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                    placeholder="Token Focus"
                  />
                </Field>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    disabled={!canSubmit || loading}
                    className="h-11 w-full rounded-2xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-sm shadow-[color:rgba(63,75,255,0.25)] hover:brightness-95 disabled:opacity-60"
                    onClick={emit}
                    type="button"
                  >
                    {loading ? 'Enviando…' : 'Emitir NFS-e'}
                  </button>
                  <button
                    disabled={!canSubmit || loading}
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
                    onClick={consult}
                    type="button"
                  >
                    Consultar status
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-xs text-zinc-600">
                Dica: use uma referência única por tentativa. Se a prefeitura estiver lenta, rode “Consultar status”
                algumas vezes.
              </div>
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Payload (JSON)</h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    Cole o payload da Focus. Se não tiver, deixe o template e substitua os campos obrigatórios.
                  </p>
                </div>
                <button
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                  type="button"
                  onClick={() => {
                    setPayload('{\n  "prestador": {},\n  "tomador": {},\n  "servico": {}\n}\n');
                    setResult('');
                  }}
                >
                  Reset
                </button>
              </div>

              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="mt-4 min-h-80 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 font-mono text-xs outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
              />

              <div className="mt-6">
                <h2 className="text-sm font-semibold text-zinc-900">Resultado</h2>
                <pre className="mt-2 max-h-[420px] overflow-auto rounded-2xl border border-zinc-200 bg-zinc-950 p-4 text-xs text-zinc-50">
                  {result || '—'}
                </pre>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoCard
                title="Boas práticas"
                body="Faça testes em homologação primeiro. Em produção, garanta que os dados do prestador/tomador estejam corretos."
              />
              <InfoCard
                title="Próximo passo"
                body="Depois de validar a emissão, vamos substituir esta tela por: Empresa → Cliente → Serviço → Emitir → DANFS-e."
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-semibold text-zinc-900">{label}</label>
        {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <p className="mt-1 text-sm text-zinc-600">{body}</p>
    </div>
  );
}
