'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { activities as seedActivities } from '@/lib/mock-data';
import { Client, Contract, Payment, Project } from '@/lib/types';
import { getCloudDb } from '@/lib/cloud-db';
import { OwnerLogin } from './owner-login';
import { createClient, createContract, createHistory, createPayment, fetchAll, migrateLegacy, removeRow, saveClient, savePayment } from '@/lib/cloud-data';

type AppContextValue={clients:Client[];projects:Project[];payments:Payment[];contracts:Contract[];activities:typeof seedActivities;addClient:(c:Client)=>Promise<Client>;updateClient:(c:Client)=>Promise<void>;deleteClient:(id:string)=>Promise<void>;deleteProject:(id:string)=>Promise<void>;addPayment:(p:Payment)=>Promise<void>;updatePayment:(p:Payment)=>Promise<void>;deletePayment:(id:string)=>Promise<void>;generatePaymentHistory:(c:Client)=>Promise<number>;addContract:(c:Contract)=>Promise<void>;signOut:()=>Promise<void>;totalIncome:number;outstanding:number;recurring:number;activeClients:number};
const Ctx=createContext<AppContextValue|null>(null),db=getCloudDb(),OWNER='taido097@gmail.com',STORAGE='tai-tracker-v1';

export function AppProvider({children}:{children:React.ReactNode}){
 const [clients,setClients]=useState<Client[]>([]),[projects,setProjects]=useState<Project[]>([]),[payments,setPayments]=useState<Payment[]>([]),[contracts,setContracts]=useState<Contract[]>([]),[uid,setUid]=useState(''),[ready,setReady]=useState(false),[loadError,setLoadError]=useState('');
 async function load(user:string){let data=await fetchAll();if(!data.clients.length&&!data.projects.length&&!data.payments.length&&!data.contracts.length){const raw=localStorage.getItem(STORAGE);if(raw){await migrateLegacy(user,raw);localStorage.removeItem(STORAGE);data=await fetchAll()}}setClients(data.clients);setProjects(data.projects);setPayments(data.payments);setContracts(data.contracts)}
 useEffect(()=>{let alive=true;async function apply(user:any){if(!alive)return;if(user?.email?.toLowerCase()===OWNER){setReady(false);setUid(user.id);try{await load(user.id)}catch(e){setLoadError(e instanceof Error?e.message:'Could not load saved data')}setReady(true)}else{setUid('');setClients([]);setProjects([]);setPayments([]);setContracts([]);setReady(true)}}db.auth.getSession().then(({data})=>void apply(data.session?.user));const {data}=db.auth.onAuthStateChange((_e,s)=>void apply(s?.user));return()=>{alive=false;data.subscription.unsubscribe()}},[]);
 async function addClient(c:Client){const x=await createClient(c,uid);setClients(v=>[x,...v]);return x}
 async function updateClient(c:Client){const x=await saveClient(c,uid);setClients(v=>v.map(y=>y.id===c.id?x:y))}
 async function deleteClient(id:string){await removeRow('clients',id);setClients(v=>v.filter(x=>x.id!==id));setProjects(v=>v.map(x=>x.clientId===id?{...x,clientId:''}:x));setPayments(v=>v.map(x=>x.clientId===id?{...x,clientId:''}:x));setContracts(v=>v.map(x=>x.clientId===id?{...x,clientId:''}:x))}
 async function deleteProject(id:string){await removeRow('projects',id);setProjects(v=>v.filter(x=>x.id!==id))}
 async function syncPaid(p:Payment){if(!p.coversThrough||p.amountPaid<=0||!['Hosting','Maintenance','Domain'].includes(p.type))return;const c=clients.find(x=>x.id===p.clientId);if(c&&c.recurringFee>0&&(!c.paidThrough||c.paidThrough<p.coversThrough))await updateClient({...c,paidThrough:p.coversThrough})}
 async function addPayment(p:Payment){const x=await createPayment(p,uid);setPayments(v=>[x,...v]);await syncPaid(x)}
 async function updatePayment(p:Payment){const x=await savePayment(p,uid);setPayments(v=>v.map(y=>y.id===p.id?x:y));await syncPaid(x)}
 async function deletePayment(id:string){await removeRow('payments',id);setPayments(v=>v.filter(x=>x.id!==id))}
 async function addContract(c:Contract){const x=await createContract(c,uid);setContracts(v=>[x,...v])}
 async function generatePaymentHistory(c:Client){let target=c;if(!clients.some(x=>x.id===c.id))target=await addClient(c);const rows=await createHistory(target,uid,payments);if(rows.length)setPayments(v=>[...rows,...v]);return rows.length}
 const totalIncome=payments.reduce((s,p)=>s+p.amountPaid,0),outstanding=payments.reduce((s,p)=>s+Math.max(0,p.amountCharged-p.amountPaid),0),recurring=clients.reduce((s,c)=>s+c.recurringFee,0),activeClients=clients.filter(c=>c.status!=='Lead'&&c.status!=='Completed').length;
 const value:AppContextValue={clients,projects,payments,contracts,activities:seedActivities,addClient,updateClient,deleteClient,deleteProject,addPayment,updatePayment,deletePayment,generatePaymentHistory,addContract,signOut:async()=>{await db.auth.signOut()},totalIncome,outstanding,recurring,activeClients};
 if(!ready)return <div style={{minHeight:'100vh',display:'grid',placeItems:'center'}}>Loading tracker…</div>;
 if(!uid)return <OwnerLogin/>;
 if(loadError)return <div style={{padding:32}}><div className="error">Could not load saved data: {loadError}</div></div>;
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useAppData(){const v=useContext(Ctx);if(!v)throw new Error('useAppData must be used inside AppProvider');return v}
