'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      className="text-sm text-zinc-700 hover:text-zinc-900"
      onClick={() => signOut({ callbackUrl: '/auth/login' })}
      type="button"
    >
      Sair
    </button>
  );
}

