export const CATEGORIES = ['Electronics', 'Appliances', 'Furniture', 'Fashion', 'Automotive', 'Home & Garden', 'Other'] as const;
export type Category = typeof CATEGORIES[number];
export type Warranty = { id: string; user_id: string; product_name: string; brand: string | null; category: string | null; purchase_date: string; warranty_months: number; expiry_date: string; seller: string | null; serial_number: string | null; purchase_price: number | null; notes: string | null; created_at: string; updated_at: string };
export type WarrantyInput = { product_name: string; brand: string; category: string; purchase_date: string; warranty_months: number; seller: string; serial_number: string; purchase_price: number | null; notes: string };
export type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expires Today' | 'Expired';
