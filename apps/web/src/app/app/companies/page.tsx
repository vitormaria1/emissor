import { prisma } from '@emissor/db';
import { requireSession } from '@/lib/require-session';
import { createCompany } from './actions';

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId } = await requireSession();
  const sp = await searchParams;
  const error = typeof sp.error === 'string' ? sp.error : null;
  const created = typeof sp.created === 'string' ? sp.created : null;

  const companies = await prisma.companyMember.findMany({
    where: { userId },
    select: {
      role: true,
      company: { select: { id: true, name: true, cnpj: true, createdAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Empresas</h1>
        <p className="mt-1 text-sm text-zinc-600">Gerencie as empresas e configurações fiscais.</p>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {created ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Empresa criada com sucesso.
          </p>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-600">
                <th className="py-2 pr-4 font-medium">Empresa</th>
                <th className="py-2 pr-4 font-medium">CNPJ</th>
                <th className="py-2 pr-4 font-medium">Papel</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((m) => (
                <tr key={m.company.id} className="border-b border-zinc-100">
                  <td className="py-3 pr-4">{m.company.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{m.company.cnpj}</td>
                  <td className="py-3 pr-4">{m.role}</td>
                </tr>
              ))}
              {companies.length === 0 ? (
                <tr>
                  <td className="py-4 text-zinc-600" colSpan={3}>
                    Nenhuma empresa cadastrada.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold">Nova empresa</h2>
        <p className="mt-1 text-sm text-zinc-600">Cadastre o CNPJ e dados básicos.</p>

        <form action={createCompany} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nome" name="name" placeholder="Minha Empresa LTDA" />
          <Field label="CNPJ" name="cnpj" placeholder="00.000.000/0001-00" />
          <Field label="Inscrição municipal (opcional)" name="municipalInscription" placeholder="12345" />
          <Field label="Regime tributário (opcional)" name="taxRegime" placeholder="Simples Nacional" />

          <div className="md:col-span-2">
            <button
              className="h-11 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
              type="submit"
            >
              Criar empresa
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
        id={name}
        name={name}
        placeholder={placeholder}
      />
    </div>
  );
}
