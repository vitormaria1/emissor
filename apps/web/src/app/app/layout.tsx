import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { LogoutButton } from '@/components/logout-button';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/auth/login');

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/app" className="text-sm font-semibold">
            Emissor NFS-e
          </Link>

          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-6 px-6 py-8">
        <aside className="col-span-12 md:col-span-3">
          <nav className="rounded-2xl border border-zinc-200 bg-white p-3">
            <NavLink href="/app">Dashboard</NavLink>
            <NavLink href="/app/companies">Empresas</NavLink>
            <NavLink href="/app/customers">Clientes</NavLink>
            <NavLink href="/app/services">Serviços</NavLink>
            <NavLink href="/app/invoices">Notas</NavLink>
            <NavLink href="/app/settings">Configurações</NavLink>
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
    >
      {children}
    </Link>
  );
}
