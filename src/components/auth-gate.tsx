import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from './app-shell';
export async function AuthGate({children}:{children:React.ReactNode}){const supabase=await createClient();if(!supabase)redirect('/login?setup=missing');const {data:{user},error}=await supabase.auth.getUser();if(error||!user)redirect('/login');const {data:profile}=await supabase.from('profiles').select('username').eq('id',user.id).maybeSingle();return <AppShell username={profile?.username??'Account'} email={user.email??''}>{children}</AppShell>;}
