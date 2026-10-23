/** Solo dígitos (enteros). */
export const sanitizeIntegerInput = (value: string): string => value.replace(/\D/g, '');

/** Dígitos y un solo separador decimal (`.` o `,`). */
export const sanitizeDecimalInput = (value: string): string => {
  const cleaned = value.replace(/[^\d.,]/g, '');
  let hasSeparator = false;
  let result = '';

  for (const char of cleaned) {
    if (char === '.' || char === ',') {
      if (hasSeparator) continue;
      hasSeparator = true;
      result += char;
      continue;
    }
    result += char;
  }

  return result;
};
