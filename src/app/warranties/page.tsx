import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AuthGate } from '@/components/auth-gate';
import { WarrantyList } from '@/components/warranty-list';
export default function WarrantiesPage(){return <AuthGate><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-semibold tracking-tight">My warranties</h1><p className="mt-2 text-sm text-neutral-500">Search, sort, and keep track of every product.</p></div><Link href="/warranties/new" className="btn-primary self-start"><Plus size={16}/> Add warranty</Link></div><WarrantyList/></AuthGate>}
