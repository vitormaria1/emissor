import { z } from 'zod';

export const cnpjSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length === 14, 'CNPJ deve conter 14 dígitos');

export const companyCreateSchema = z.object({
  name: z.string().min(2),
  cnpj: cnpjSchema,
  municipalInscription: z.string().min(2).optional(),
  taxRegime: z.string().min(2).optional(),
});

export const customerCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  document: z.string().min(11).optional(), // CPF/CNPJ (validaremos melhor depois)
  phone: z.string().min(8).optional(),
  addressJson: z.unknown().optional(),
});

export const serviceCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  serviceCode: z.string().optional(),
  cnae: z.string().optional(),
  municipalTaxCode: z.string().optional(),
  unitPrice: z.number().positive(),
  issRate: z.number().min(0).max(100).optional(),
});

export const invoiceItemCreateSchema = z.object({
  serviceId: z.string().uuid().optional(),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  issRate: z.number().min(0).max(100).optional(),
});

export const invoiceCreateSchema = z.object({
  customerId: z.string().uuid().optional(),
  notes: z.string().max(4000).optional(),
  items: z.array(invoiceItemCreateSchema).min(1),
});

