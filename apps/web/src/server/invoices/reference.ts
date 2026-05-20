import crypto from 'crypto';

export function generateInvoiceReference(companyId: string) {
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const prefix = companyId.replace(/-/g, '').slice(0, 8);
  return `nfse_${prefix}_${Date.now()}_${rand}`;
}

