'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, registerSchema } from '@/lib/validation';
import { Brand } from './brand';

type Mode = 'login' | 'register' | 'forgot';
export function AuthForm({ mode }: { mode: Mode }) {
 const router = useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [message,setMessage]=useState('');
 const [values,setValues]=useState({username:'',email:'',password:'',confirmPassword:''}); const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
 const change=(e:React.ChangeEvent<HTMLInputElement>)=>setValues(v=>({...v,[e.target.name]:e.target.value}));
 async function submit(e:React.FormEvent){e.preventDefault();setError('');setMessage('');setFieldErrors({});
  if(mode==='forgot') { if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)){setFieldErrors({email:'Enter a valid email address.'});return;} }
  else { const schema=mode==='register'?registerSchema:loginSchema; const result=schema.safeParse(mode==='register'?values:{email:values.email,password:values.password}); if(!result.success){const next:Record<string,string>={}; result.error.issues.forEach(issue=>{const key=String(issue.path[0]??'form');if(!next[key])next[key]=issue.message;});setFieldErrors(next);return;} }
  setBusy(true); try {const supabase=createClient();
   if(mode==='register'){const {error}=await supabase.auth.signUp({email:values.email.trim(),password:values.password,options:{data:{username:values.username}}}); if(error)throw error; setMessage('Check your email for a verification link. Once verified, you can sign in.');}
   else if(mode==='login'){const {error}=await supabase.auth.signInWithPassword({email:values.email.trim(),password:values.password});if(error)throw error;router.replace('/dashboard');router.refresh();}
   else {const {error}=await supabase.auth.resetPasswordForEmail(values.email.trim(),{redirectTo:`${window.location.origin}/auth/callback?next=/reset-password`});if(error)throw error;setMessage('If an account exists for that email, a password recovery link is on its way.');}
  } catch(err){const text=err instanceof Error?err.message:'Something went wrong. Please try again.';setError(/username|profiles_username_lower_unique|duplicate key/i.test(text)?'That username is already taken. Choose another one.':/invalid login credentials/i.test(text)?'Email or password is incorrect.':/email not confirmed/i.test(text)?'Please verify your email before signing in.':text);} finally{setBusy(false);}}
 const title=mode==='register'?'Create your account':mode==='forgot'?'Reset your password':'Welcome back';
 return <main className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-[410px]"><div className="mb-10 flex justify-center"><Brand/></div><div className="card p-7 sm:p-8"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-neutral-500">{mode==='register'?'One secure place for every product warranty.':mode==='forgot'?'We’ll email you a secure password reset link.':'Sign in to manage your warranties.'}</p>
 {error&&<div role="alert" className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>}{message&&<div role="status" className="mt-5 rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-200">{message}</div>}
 <form className="mt-6 space-y-4" onSubmit={submit} noValidate>{mode==='register'&&<div><label className="label" htmlFor="username">Username</label><input className="input" id="username" name="username" autoComplete="username" value={values.username} onChange={change} placeholder="e.g. alex2026" maxLength={20} required aria-describedby={fieldErrors.username?'username-error':undefined}/>{fieldErrors.username&&<p id="username-error" className="mt-1.5 text-xs text-red-300">{fieldErrors.username}</p>}<p className="mt-1.5 text-xs text-neutral-600">3–20 letters and numbers, no symbols or spaces.</p></div>}
 <div><label className="label" htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={change} placeholder="you@example.com" required/>{fieldErrors.email&&<p className="mt-1.5 text-xs text-red-300">{fieldErrors.email}</p>}</div>
 {mode!=='forgot'&&<div><label className="label" htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete={mode==='register'?'new-password':'current-password'} value={values.password} onChange={change} placeholder="At least 4 characters" maxLength={128} required/>{fieldErrors.password&&<p className="mt-1.5 text-xs text-red-300">{fieldErrors.password}</p>}</div>}
 {mode==='register'&&<div><label className="label" htmlFor="confirmPassword">Confirm password</label><input className="input" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={change} maxLength={128} required/>{fieldErrors.confirmPassword&&<p className="mt-1.5 text-xs text-red-300">{fieldErrors.confirmPassword}</p>}</div>}
 {mode==='login'&&<div className="flex justify-end"><Link className="text-xs text-neutral-400 hover:text-white" href="/forgot-password">Forgot password?</Link></div>}
 <button className="btn-primary mt-1 w-full" disabled={busy} type="submit">{busy?'Please wait…':mode==='register'?'Create account':mode==='forgot'?'Send reset link':'Sign in'}</button></form>
 <div className="mt-6 border-t border-neutral-800 pt-5 text-center text-sm text-neutral-500">{mode==='register'?<>Already have an account? <Link className="text-white hover:underline" href="/login">Sign in</Link></>:mode==='login'?<>New to Warranty Wallet? <Link className="text-white hover:underline" href="/register">Create account</Link></>:<>Remember your password? <Link className="text-white hover:underline" href="/login">Sign in</Link></>}</div></div><p className="mt-6 text-center text-xs text-neutral-700">Your warranties are private and accessible only to you.</p></div></main>;
}
