import { notFound } from 'next/navigation';
import { AuthGate } from '@/components/auth-gate';
import { WarrantyForm } from '@/components/warranty-form';
import { createClient } from '@/lib/supabase/server';
import type { Warranty } from '@/lib/types';
export default async function EditWarrantyPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const supabase=await createClient();if(!supabase)notFound();const {data,error}=await supabase.from('warranties').select('*').eq('id',id).maybeSingle();if(error||!data)notFound();return <AuthGate><WarrantyForm initial={data as Warranty}/></AuthGate>}
