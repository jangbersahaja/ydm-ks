// Normalizes Malaysian mobile numbers to E.164 (+60...). Returns null if invalid.
export function normalizeMyPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let national = digits;
  if (digits.startsWith("60")) national = digits.slice(2);
  else if (digits.startsWith("0")) national = digits.slice(1);
  if (!/^1\d{8,9}$/.test(national)) return null;
  return `+60${national}`;
}
