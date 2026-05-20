'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@emissor/db';
import { companyCreateSchema } from '@emissor/validators';
import { requireSession } from '@/lib/require-session';

export async function createCompany(formData: FormData) {
  const { userId } = await requireSession();

  const parsed = companyCreateSchema.safeParse({
    name: formData.get('name'),
    cnpj: formData.get('cnpj'),
    municipalInscription: formData.get('municipalInscription') || undefined,
    taxRegime: formData.get('taxRegime') || undefined,
  });

  if (!parsed.success) {
    redirect(`/app/companies?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Dados inválidos.')}`);
  }

  const { name, cnpj, municipalInscription, taxRegime } = parsed.data;

  const existing = await prisma.company.findUnique({ where: { cnpj } });
  if (existing) redirect(`/app/companies?error=${encodeURIComponent('Este CNPJ já está cadastrado.')}`);

  const company = await prisma.company.create({
    data: {
      name,
      cnpj,
      municipalInscription,
      taxRegime,
      members: { create: { userId, role: 'OWNER' } },
      fiscalConfiguration: { create: {} },
    },
    select: { id: true },
  });

  revalidatePath('/app/companies');
  redirect(`/app/companies?created=${company.id}`);
}
