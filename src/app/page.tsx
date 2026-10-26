import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export default async function Home(){const supabase=await createClient();if(!supabase)redirect('/login?setup=missing');const {data:{user}}=await supabase.auth.getUser();redirect(user?'/dashboard':'/login');}
