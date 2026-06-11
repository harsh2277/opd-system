const KEY = 'opd-token-counter';

export function generateTokenNumber(): string {
  const current = parseInt(localStorage.getItem(KEY) || '0', 10);
  const next = current + 1;
  localStorage.setItem(KEY, String(next));
  return `OPD-${String(next).padStart(3, '0')}`;
}

export function resetTokenCounter(): void {
  localStorage.removeItem(KEY);
}
