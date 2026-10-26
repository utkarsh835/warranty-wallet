import { z } from 'zod';
import { addCalendarMonths } from './dates';
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be 20 characters or fewer.').regex(/^[A-Za-z0-9]{3,20}$/, 'Use 3–20 letters and numbers only.');
export const emailSchema = z.string().trim().email('Enter a valid email address.').max(254, 'Email address is too long.');
export const passwordSchema = z.string().min(4, 'Password must be at least 4 characters.').max(128, 'Password must be 128 characters or fewer.');
export const registerSchema = z.object({ username: usernameSchema, email: emailSchema, password: passwordSchema, confirmPassword: z.string() }).refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const warrantySchema = z.object({
  product_name: z.string().trim().min(1, 'Product name is required.').max(120, 'Product name must be 120 characters or fewer.'),
  brand: z.string().trim().max(80, 'Brand must be 80 characters or fewer.').default(''),
  category: z.string().max(40).default(''),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid purchase date.'),
  warranty_months: z.coerce.number().int('Duration must be a whole number.').min(1, 'Duration must be at least 1 month.').max(1200, 'Duration must be 1200 months or fewer.'),
  seller: z.string().trim().max(120, 'Seller must be 120 characters or fewer.').default(''),
  serial_number: z.string().trim().max(120, 'Serial number must be 120 characters or fewer.').default(''),
  purchase_price: z.union([z.literal(''), z.coerce.number().finite().min(0, 'Price cannot be negative.').max(999999999, 'Price is too large.')]).optional().transform(v => v === '' || v === undefined ? null : Number(v)),
  notes: z.string().trim().max(2000, 'Notes must be 2000 characters or fewer.').default('')
}).superRefine((v, ctx) => { try { addCalendarMonths(v.purchase_date, v.warranty_months); } catch { ctx.addIssue({ code: 'custom', path: ['purchase_date'], message: 'Enter a real calendar date.' }); } });
export type WarrantyFormValues = z.input<typeof warrantySchema>;
