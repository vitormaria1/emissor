import { z } from 'zod';

export const focusEnvironmentSchema = z.enum(['HOMOLOGATION', 'PRODUCTION']);
export type FocusEnvironment = z.infer<typeof focusEnvironmentSchema>;

export type FocusAuth = {
  token: string;
  environment: FocusEnvironment;
};

export const focusEmitResponseSchema = z.object({
  // A Focus costuma responder 202 com uma mensagem/URL de consulta.
  // Mantemos flexível para não travar o MVP.
}).passthrough();

export type FocusEmitResponse = z.infer<typeof focusEmitResponseSchema>;

export const focusConsultResponseSchema = z.object({}).passthrough();
export type FocusConsultResponse = z.infer<typeof focusConsultResponseSchema>;

