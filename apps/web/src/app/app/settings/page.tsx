import { requireCompanyContext } from '@/lib/tenant-context';

export default async function SettingsPage() {
  const { companyId, role } = await requireCompanyContext();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Configurações</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Empresa ativa: <span className="font-mono text-xs">{companyId}</span>
      </p>
      <p className="mt-1 text-sm text-zinc-600">Papel: {role}</p>
      <p className="mt-4 text-sm text-zinc-600">
        Próximo passo: configurar tokens da Focus por ambiente, regras fiscais e webhooks.
      </p>
    </div>
  );
}

