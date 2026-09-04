'use client';
import { FormEvent, useState } from 'react';
import { getCloudDb } from '@/lib/cloud-db';

const OWNER='taido097@gmail.com';
const db=getCloudDb();

export function OwnerLogin(){
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(''); setMessage('');
    const f=new FormData(e.currentTarget), email=String(f.get('email')||'').trim().toLowerCase(), password=String(f.get('password')||'');
    if(email!==OWNER){setError('This tracker is restricted to the owner account.');return;}
    const r=await db.auth.signInWithPassword({email,password});
    if(r.error)setError(r.error.message);
  }
  async function signup(form:HTMLFormElement){
    setError(''); setMessage(''); const f=new FormData(form), email=String(f.get('email')||'').trim().toLowerCase(), password=String(f.get('password')||'');
    if(email!==OWNER){setError('This tracker is restricted to the owner account.');return;}
    const r=await db.auth.signUp({email,password}); if(r.error)setError(r.error.message); else if(!r.data.session)setMessage('Account created. Confirm your email, then sign in.');
  }
  return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f6f4ee'}}><div className="panel" style={{width:'min(430px,100%)'}}><h1 style={{marginTop:0}}>TAI Tracker</h1><p className="muted">Sign in to load your permanently saved business data.</p><form onSubmit={submit} style={{display:'grid',gap:12}}><label>Email<input name="email" type="email" defaultValue={OWNER}/></label><label>Password<input name="password" type="password"/></label>{error&&<div className="error">{error}</div>}{message&&<div className="badge green">{message}</div>}<button className="btn accent">Sign In</button><button type="button" className="btn ghost" onClick={e=>void signup(e.currentTarget.closest('form') as HTMLFormElement)}>First time? Create Owner Account</button></form></div></div>;
}
