'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

type Env = 'HOMOLOGATION' | 'PRODUCTION';

export default function EmitTestPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [environment, setEnvironment] = useState<Env>('HOMOLOGATION');
  const [token, setToken] = useState('');
  const [reference, setReference] = useState(`teste_${Date.now()}`);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [invoice, setInvoice] = useState({
    natureza_operacao: 1,
    optante_simples_nacional: false,
    regime_especial_tributacao: '',
  });

  const [prestador, setPrestador] = useState({
    cnpj: '',
    inscricao_municipal: '',
    codigo_municipio: '',
  });

  const [tomador, setTomador] = useState({
    documento: '',
    razao_social: '',
    email: '',
    telefone: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      codigo_municipio: '',
      uf: 'SP',
      cep: '',
    },
  });

  const [servico, setServico] = useState({
    discriminacao: '',
    valor_servicos: '1.00',
    aliquota: '2.00',
    item_lista_servico: '',
    iss_retido: false,
  });

  const canSubmit = useMemo(
    () =>
      adminSecret.length >= 16 &&
      token.length >= 10 &&
      reference.length >= 6 &&
      prestador.cnpj.trim().length >= 14 &&
      prestador.inscricao_municipal.trim().length >= 1 &&
      prestador.codigo_municipio.trim().length >= 1 &&
      tomador.documento.trim().length >= 11 &&
      tomador.razao_social.trim().length >= 2 &&
      tomador.endereco.logradouro.trim().length >= 1 &&
      tomador.endereco.numero.trim().length >= 1 &&
      tomador.endereco.bairro.trim().length >= 1 &&
      tomador.endereco.codigo_municipio.trim().length >= 1 &&
      tomador.endereco.uf.trim().length === 2 &&
      tomador.endereco.cep.replace(/\D/g, '').length >= 8 &&
      servico.discriminacao.trim().length >= 5 &&
      servico.item_lista_servico.trim().length >= 3,
    [adminSecret, token, reference, prestador, tomador, servico],
  );

  async function emitSimple() {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/focus/emit-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          environment,
          token,
          reference,
          invoice: {
            natureza_operacao: invoice.natureza_operacao,
            optante_simples_nacional: invoice.optante_simples_nacional,
            regime_especial_tributacao: invoice.regime_especial_tributacao
              ? Number(invoice.regime_especial_tributacao)
              : undefined,
          },
          prestador: {
            cnpj: prestador.cnpj,
            inscricao_municipal: prestador.inscricao_municipal,
            codigo_municipio: Number(prestador.codigo_municipio),
          },
          tomador: {
            documento: tomador.documento,
            razao_social: tomador.razao_social,
            email: tomador.email || undefined,
            telefone: tomador.telefone || undefined,
            endereco: {
              logradouro: tomador.endereco.logradouro,
              numero: tomador.endereco.numero,
              complemento: tomador.endereco.complemento || undefined,
              bairro: tomador.endereco.bairro,
              codigo_municipio: Number(tomador.endereco.codigo_municipio),
              uf: tomador.endereco.uf,
              cep: tomador.endereco.cep,
            },
          },
          servico: {
            discriminacao: servico.discriminacao,
            valor_servicos: Number(servico.valor_servicos),
            aliquota: Number(servico.aliquota),
            item_lista_servico: servico.item_lista_servico,
            iss_retido: servico.iss_retido,
          },
        }),
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
            <div className="relative h-12 w-12 overflow-hidden rounded-3xl ring-1 ring-zinc-200">
              <Image src="/prazer-logo.png" alt="Prazer, eu sou seu contador" fill />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-zinc-900">Prazer, eu sou seu contador</p>
              <p className="text-xs text-zinc-600">Emissor de NFS-e</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-zinc-600 md:flex">
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">Focus NFe</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">NFS-e</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h1 className="text-xl font-semibold text-zinc-900">Emissão de NFS-e</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Preencha as informações abaixo e emita sua nota. O sistema envia para a prefeitura via Focus NFe e
                você pode acompanhar o status.
              </p>

              <div className="mt-6 grid gap-4">
                <Field label="Chave de acesso" hint="Uso interno (não fica salvo).">
                  <input
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-zinc-200 px-3 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                    placeholder="Digite sua chave de acesso"
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

                <Field label="Token Focus" hint="Não fica salvo.">
                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-zinc-200 px-3 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                    placeholder="Token Focus"
                  />
                </Field>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-sm font-semibold text-zinc-900">Prestador</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Mini label="CNPJ">
                      <input
                        value={prestador.cnpj}
                        onChange={(e) => setPrestador((s) => ({ ...s, cnpj: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="00.000.000/0001-00"
                      />
                    </Mini>
                    <Mini label="Inscrição municipal">
                      <input
                        value={prestador.inscricao_municipal}
                        onChange={(e) => setPrestador((s) => ({ ...s, inscricao_municipal: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="12345"
                      />
                    </Mini>
                    <Mini label="Código do município (IBGE)">
                      <input
                        value={prestador.codigo_municipio}
                        onChange={(e) => setPrestador((s) => ({ ...s, codigo_municipio: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="4202909"
                      />
                    </Mini>
                    <Mini label="Simples nacional">
                      <label className="flex h-10 items-center justify-between gap-3 rounded-xl border border-zinc-200 px-3">
                        <span className="text-sm text-zinc-700">Optante</span>
                        <input
                          checked={invoice.optante_simples_nacional}
                          onChange={(e) => setInvoice((s) => ({ ...s, optante_simples_nacional: e.target.checked }))}
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--brand)]"
                        />
                      </label>
                    </Mini>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-sm font-semibold text-zinc-900">Tomador</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Mini label="CPF/CNPJ">
                      <input
                        value={tomador.documento}
                        onChange={(e) => setTomador((s) => ({ ...s, documento: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="111.111.111-11 ou 11.111.111/0001-11"
                      />
                    </Mini>
                    <Mini label="Razão social">
                      <input
                        value={tomador.razao_social}
                        onChange={(e) => setTomador((s) => ({ ...s, razao_social: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="Nome do tomador"
                      />
                    </Mini>
                    <Mini label="E-mail (opcional)">
                      <input
                        value={tomador.email}
                        onChange={(e) => setTomador((s) => ({ ...s, email: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="email@exemplo.com"
                      />
                    </Mini>
                    <Mini label="Telefone (opcional)">
                      <input
                        value={tomador.telefone}
                        onChange={(e) => setTomador((s) => ({ ...s, telefone: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="11 99999-9999"
                      />
                    </Mini>
                    <Mini label="Logradouro">
                      <input
                        value={tomador.endereco.logradouro}
                        onChange={(e) =>
                          setTomador((s) => ({ ...s, endereco: { ...s.endereco, logradouro: e.target.value } }))
                        }
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="Rua..."
                      />
                    </Mini>
                    <Mini label="Número">
                      <input
                        value={tomador.endereco.numero}
                        onChange={(e) =>
                          setTomador((s) => ({ ...s, endereco: { ...s.endereco, numero: e.target.value } }))
                        }
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="123"
                      />
                    </Mini>
                    <Mini label="Complemento (opcional)">
                      <input
                        value={tomador.endereco.complemento}
                        onChange={(e) =>
                          setTomador((s) => ({ ...s, endereco: { ...s.endereco, complemento: e.target.value } }))
                        }
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                      />
                    </Mini>
                    <Mini label="Bairro">
                      <input
                        value={tomador.endereco.bairro}
                        onChange={(e) =>
                          setTomador((s) => ({ ...s, endereco: { ...s.endereco, bairro: e.target.value } }))
                        }
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                      />
                    </Mini>
                    <Mini label="Município (IBGE)">
                      <input
                        value={tomador.endereco.codigo_municipio}
                        onChange={(e) =>
                          setTomador((s) => ({
                            ...s,
                            endereco: { ...s.endereco, codigo_municipio: e.target.value },
                          }))
                        }
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="4202909"
                      />
                    </Mini>
                    <Mini label="UF">
                      <input
                        value={tomador.endereco.uf}
                        onChange={(e) =>
                          setTomador((s) => ({ ...s, endereco: { ...s.endereco, uf: e.target.value.toUpperCase() } }))
                        }
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm uppercase outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="SP"
                        maxLength={2}
                      />
                    </Mini>
                    <Mini label="CEP">
                      <input
                        value={tomador.endereco.cep}
                        onChange={(e) =>
                          setTomador((s) => ({ ...s, endereco: { ...s.endereco, cep: e.target.value } }))
                        }
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="00000-000"
                      />
                    </Mini>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-sm font-semibold text-zinc-900">Serviço</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Mini label="Item lista serviço">
                      <input
                        value={servico.item_lista_servico}
                        onChange={(e) => setServico((s) => ({ ...s, item_lista_servico: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="11.02"
                      />
                    </Mini>
                    <Mini label="Alíquota ISS (%)">
                      <input
                        value={servico.aliquota}
                        onChange={(e) => setServico((s) => ({ ...s, aliquota: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="3.00"
                      />
                    </Mini>
                    <Mini label="Valor dos serviços (R$)">
                      <input
                        value={servico.valor_servicos}
                        onChange={(e) => setServico((s) => ({ ...s, valor_servicos: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                        placeholder="1.00"
                      />
                    </Mini>
                    <Mini label="ISS retido">
                      <label className="flex h-10 items-center justify-between gap-3 rounded-xl border border-zinc-200 px-3">
                        <span className="text-sm text-zinc-700">Retido</span>
                        <input
                          checked={servico.iss_retido}
                          onChange={(e) => setServico((s) => ({ ...s, iss_retido: e.target.checked }))}
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--brand)]"
                        />
                      </label>
                    </Mini>
                    <div className="md:col-span-2">
                      <Mini label="Discriminação">
                        <textarea
                          value={servico.discriminacao}
                          onChange={(e) => setServico((s) => ({ ...s, discriminacao: e.target.value }))}
                          className="min-h-24 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgba(63,75,255,0.10)]"
                          placeholder="Descreva o serviço prestado..."
                        />
                      </Mini>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    disabled={!canSubmit || loading}
                    className="h-11 w-full rounded-2xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-sm shadow-[color:rgba(63,75,255,0.25)] hover:brightness-95 disabled:opacity-60"
                    onClick={emitSimple}
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

              <details className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-900">
                  Dicas para emissão
                </summary>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-zinc-600">
                  <li>Use uma referência única por nota (o sistema já gera uma automaticamente).</li>
                  <li>
                    Se a prefeitura estiver lenta, utilize “Consultar status” após alguns segundos/minutos.
                  </li>
                  <li>Comece por homologação e só depois emita em produção.</li>
                </ul>
              </details>
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Status e retorno</h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    Acompanhe o retorno da Focus e o status de processamento.
                  </p>
                </div>
                <button
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                  type="button"
                  onClick={() => {
                    setResult('');
                  }}
                >
                  Limpar
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold text-zinc-700">Última resposta</p>
                <pre className="mt-2 max-h-[520px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-50">
                  {result || '—'}
                </pre>
                <details className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-zinc-700">
                    Detalhes técnicos
                  </summary>
                  <p className="mt-2 text-xs text-zinc-600">
                    Este painel mostra payload gerado e retorno completo para auditoria. No produto final,
                    fica oculto para usuários comuns.
                  </p>
                </details>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoCard
                title="Segurança"
                body="Nunca compartilhe tokens. Use homologação para conferir campos obrigatórios antes de emitir em produção."
              />
              <InfoCard
                title="Operação"
                body="Após emitir, use “Consultar status” para atualizar autorização/rejeição e visualizar o retorno."
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

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-zinc-700">{label}</p>
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
