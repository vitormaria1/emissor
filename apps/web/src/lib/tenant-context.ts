import { redirect } from 'next/navigation';

import { prisma } from '@emissor/db';
import { requireSession } from '@/lib/require-session';
import { getDefaultCompanyIdForUser } from '@/lib/current-company';

export async function requireCompanyContext() {
  const { userId } = await requireSession();
  const companyId = await getDefaultCompanyIdForUser(userId);
  if (!companyId) redirect('/app/companies');

  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
    select: { role: true },
  });
  if (!membership) redirect('/app/companies');

  return { userId, companyId, role: membership.role };
}

export function assertRole(
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER',
  required: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER',
) {
  const order = { OWNER: 4, ADMIN: 3, MEMBER: 2, VIEWER: 1 } as const;
  return order[role] >= order[required];
}

