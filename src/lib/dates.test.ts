import { describe,it,expect } from 'vitest';
import { addCalendarMonths,daysRemaining,getWarrantyStatus } from './dates';
describe('addCalendarMonths',()=>{
 it('adds calendar months',()=>expect(addCalendarMonths('2026-01-15',3)).toBe('2026-04-15'));
 it('clamps January 31 to February end',()=>expect(addCalendarMonths('2025-01-31',1)).toBe('2025-02-28'));
 it('handles leap years',()=>expect(addCalendarMonths('2024-01-31',1)).toBe('2024-02-29'));
 it('handles leap day plus a year',()=>expect(addCalendarMonths('2024-02-29',12)).toBe('2025-02-28'));
 it('rejects invalid dates and durations',()=>{expect(()=>addCalendarMonths('2025-02-30',1)).toThrow();expect(()=>addCalendarMonths('2025-01-01',0)).toThrow();expect(()=>addCalendarMonths('2025-01-01',1.5)).toThrow();});
});
describe('warranty status',()=>{
 it('distinguishes active, expiring soon, today and expired',()=>{expect(getWarrantyStatus('2027-01-01','2026-10-01')).toBe('Active');expect(getWarrantyStatus('2026-10-31','2026-10-01')).toBe('Expiring Soon');expect(getWarrantyStatus('2026-10-01','2026-10-01')).toBe('Expires Today');expect(getWarrantyStatus('2026-09-30','2026-10-01')).toBe('Expired');});
 it('treats the 30th day as expiring soon',()=>expect(getWarrantyStatus('2026-10-31','2026-10-01')).toBe('Expiring Soon'));
 it('calculates day differences as calendar dates',()=>expect(daysRemaining('2026-10-31','2026-10-01')).toBe(30));
});
