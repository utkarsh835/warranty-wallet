import type { WarrantyStatus } from './types';

/** Adds calendar months, clamping to the last valid day of the target month. */
export function addCalendarMonths(dateInput: string, months: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput) || !Number.isInteger(months) || months < 1) throw new Error('Enter a valid date and a positive whole number of months.');
  const [year, month, day] = dateInput.split('-').map(Number);
  const source = new Date(Date.UTC(year, month - 1, 1));
  if (source.getUTCFullYear() !== year || source.getUTCMonth() !== month - 1 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) throw new Error('Invalid calendar date.');
  const targetMonthIndex = year * 12 + month - 1 + months;
  const targetYear = Math.floor(targetMonthIndex / 12);
  const targetMonth = targetMonthIndex % 12;
  const targetDay = Math.min(day, new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate());
  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}
export function getWarrantyStatus(expiryDate: string, today = new Date().toISOString().slice(0, 10)): WarrantyStatus {
  if (expiryDate < today) return 'Expired';
  if (expiryDate === today) return 'Expires Today';
  const [y, m, d] = today.split('-').map(Number);
  const todayUTC = Date.UTC(y, m - 1, d);
  const [ey, em, ed] = expiryDate.split('-').map(Number);
  const expiryUTC = Date.UTC(ey, em - 1, ed);
  const days = Math.round((expiryUTC - todayUTC) / 86_400_000);
  return days <= 30 ? 'Expiring Soon' : 'Active';
}
export function daysRemaining(expiryDate: string, today = new Date().toISOString().slice(0, 10)): number {
  const parse = (v: string) => { const [y, m, d] = v.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((parse(expiryDate) - parse(today)) / 86_400_000);
}
export function formatDate(date: string): string { return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
