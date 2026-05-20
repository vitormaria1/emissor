import { prisma } from '@emissor/db';

export async function getDefaultCompanyIdForUser(userId: string) {
  const membership = await prisma.companyMember.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { companyId: true },
  });
  return membership?.companyId ?? null;
}

