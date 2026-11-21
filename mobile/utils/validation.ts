export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isNonEmptyString(value: string | undefined | null, options?: { maxLength?: number }): boolean {
  if (value === undefined || value === null) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (options?.maxLength && trimmed.length > options.maxLength) return false;
  return true;
}

export function isPositiveNumber(value: number | string | undefined | null): boolean {
  if (value === undefined || value === null) return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

export function isNonNegativeNumber(value: number | string | undefined | null): boolean {
  if (value === undefined || value === null) return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
}

export function isPositiveInteger(value: number | string | undefined | null): boolean {
  if (value === undefined || value === null) return false;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return Number.isInteger(num) && num > 0;
}

export function isValidDateString(dateString: string | undefined | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function validatePassword(password: string, minLength: number = 8): { valid: boolean; message?: string } {
  if (password.length < minLength) {
    return { valid: false, message: `Le mot de passe doit contenir au moins ${minLength} caractères` };
  }
  return { valid: true };
}

export function validateRequiredFields(fields: Record<string, unknown>, required: string[]): { valid: boolean; message?: string } {
  for (const field of required) {
    const value = fields[field];
    if (value === undefined || value === null || value === '') {
      return { valid: false, message: `Le champ ${field} est requis` };
    }
  }
  return { valid: true };
}