import type { Metadata } from 'next';
import "./globals.css";
export const metadata: Metadata = { title: 'Warranty Wallet', description: 'A simple, private home for your product warranties.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
