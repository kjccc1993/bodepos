import { z } from 'zod';

/** Usuario de login: letras, números, punto, guion (p. ej. kevin.camargo). */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Usuario demasiado corto')
  .max(64, 'Usuario demasiado largo')
  .regex(/^[a-z0-9._-]+$/i, 'Usuario inválido');

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}
