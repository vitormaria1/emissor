import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ''}. Vamos emitir sua próxima NFS-e.
      </p>
    </div>
  );
}

