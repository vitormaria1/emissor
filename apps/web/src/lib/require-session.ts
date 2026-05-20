import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');
  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect('/auth/login');
  return { session, userId };
}

