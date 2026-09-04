'use client';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppData } from './app-provider';
import { AddClientDialog, CreateInvoiceDialog, UploadContractDialog } from './dialogs';
import { useMemo, useState } from 'react';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const statusClass=(s:string)=> s==='Completed'||s==='Paid'||s==='Signed'?'green':s==='In Progress'||s==='Building'?'blue':s==='Planning'||s==='Partial'||s==='Sent'?'yellow':s==='Overdue'?'red':'gray';
const paymentDate=(p:{paymentDate:string;dueDate:string})=>p.paymentDate||p.dueDate||'';
export function Dashboard(){
 const d=useAppData(); const [dialog,setDialog]=useState<'client'|'invoice'|'contract'|null>(null); const [period,setPeriod]=useState('all');
 const counts=['Completed','In Progress','On Hold','Planning'].map(s=>({name:s,value:d.projects.filter(p=>p.status===s).length}));
 const colors=['#2eb67d','#4d8ef7','#e7b93d','#9ba09c'];
 const years=useMemo(()=>Array.from(new Set(d.payments.map(p=>paymentDate(p).slice(0,4)).filter(Boolean))).sort((a,b)=>Number(b)-Number(a)),[d.payments]);
 const periodPayments=useMemo(()=>period==='all'?d.payments:d.payments.filter(p=>paymentDate(p).startsWith(`${period}-`)),[d.payments,period]);
 const periodIncome=periodPayments.reduce((sum,p)=>sum+p.amountPaid,0);
 const periodOutstanding=periodPayments.reduce((sum,p)=>sum+Math.max(0,p.amountCharged-p.amountPaid),0);
 const openInvoices=periodPayments.filter(p=>p.status!=='Paid').length;
 const incomeSeries=useMemo(()=>{
   if(period==='all'){
     const totals=new Map<string,number>();
     d.payments.forEach(p=>{const date=paymentDate(p);if(!date||!p.amountPaid)return;const year=date.slice(0,4);totals.set(year,(totals.get(year)||0)+p.amountPaid)});
     return Array.from(totals.entries()).sort(([a],[b])=>Number(a)-Number(b)).map(([month,income])=>({month,income}));
   }
   const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
   const buckets=names.map(month=>({month,income:0}));
   periodPayments.forEach(p=>{const date=paymentDate(p);if(!date||!p.amountPaid)return;const m=Number(date.slice(5,7))-1;if(m>=0&&m<12)buckets[m].income+=p.amountPaid});
   return buckets;
 },[d.payments,periodPayments,period]);
 const recentPayments=[...periodPayments].sort((a,b)=>paymentDate(b).localeCompare(paymentDate(a))).slice(0,5);
 const recurringUpcoming=d.clients.filter(c=>c.recurringFee>0&&c.nextDueDate).sort((a,b)=>(a.nextDueDate||'').localeCompare(b.nextDueDate||'')).slice(0,4);
 return <>
  <div className="page-head"><div><h1>Turn Ideas Into Online Success</h1><p>Track. Manage. Grow. All in one place.</p></div><div style={{display:'flex',gap:10,alignItems:'center'}}><select value={period} onChange={e=>setPeriod(e.target.value)} aria-label="Dashboard date range"><option value="all">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select><button className="btn accent" onClick={()=>setDialog('client')}>+ Add Client</button></div></div>
  <div className="grid stats">
   <div className="stat-card"><div className="stat-label">{period==='all'?'Total Income':`${period} Income`}</div><div className="stat-value">{money(periodIncome)}</div><div className="stat-note">↑ Cash received · {period==='all'?'all years':period}</div></div>
   <div className="stat-card"><div className="stat-label">Active Clients</div><div className="stat-value">{d.activeClients}</div><div className="stat-note">↑ Current workload</div></div>
   <div className="stat-card"><div className="stat-label">{period==='all'?'Outstanding':`${period} Outstanding`}</div><div className="stat-value">{money(periodOutstanding)}</div><div className="stat-note" style={{color:'var(--red)'}}>{openInvoices} open invoices</div></div>
   <div className="stat-card"><div className="stat-label">Monthly Recurring</div><div className="stat-value">{money(d.recurring)}</div><div className="stat-note">Current hosting + maintenance</div></div>
  </div>
  <div className="grid dashboard-grid">
   <section className="panel"><div className="panel-head"><h2>Income Overview</h2><span className="muted">{period==='all'?'By year':`${period} · Jan–Dec`}</span></div><div style={{height:250}}><ResponsiveContainer width="100%" height="100%"><LineChart data={incomeSeries}><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Line type="monotone" dataKey="income" stroke="#9b7a32" strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer></div></section>
   <section className="panel"><div className="panel-head"><h2>Project Status</h2><span className="muted">Current projects</span></div><div style={{height:250,display:'flex',alignItems:'center'}}><ResponsiveContainer width="55%" height="100%"><PieChart><Pie data={counts} dataKey="value" innerRadius={55} outerRadius={83} paddingAngle={2}>{counts.map((_,i)=><Cell key={i} fill={colors[i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="list" style={{flex:1}}>{counts.map(c=><div className="list-row" key={c.name}><div className="list-main"><strong>{c.name}</strong></div><span>{c.value}</span></div>)}</div></div></section>
  </div>
  <div className="grid lower-grid">
   <section className="panel"><div className="panel-head"><h3>Recent Clients</h3><span className="muted">Current</span></div><div className="list">{d.clients.slice(0,5).map(c=><div className="list-row" key={c.id}><div className="list-main"><strong>{c.business}</strong><span>{c.package}</span></div><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></div>)}</div></section>
   <section className="panel"><div className="panel-head"><h3>Recent Payments</h3><span className="muted">{period==='all'?'All years':period}</span></div><div className="list">{recentPayments.length?recentPayments.map(p=>{const c=d.clients.find(x=>x.id===p.clientId);return <div className="list-row" key={p.id}><div className="list-main"><strong>{p.invoice}</strong><span>{c?.business||'Deleted client'} · {p.type}{p.coversThrough?` · through ${p.coversThrough}`:''}</span></div><div className="list-side">{money(p.amountPaid)} · {p.status}</div></div>}):<div className="muted">No payments in this period.</div>}</div></section>
   <div className="grid" style={{gap:16}}><section className="panel"><div className="panel-head"><h3>Upcoming Monthly Payments</h3></div><div className="list">{recurringUpcoming.length?recurringUpcoming.map(c=><div className="list-row" key={c.id}><div className="list-main"><strong>{c.business}</strong><span>Paid through {c.paidThrough||'—'}</span></div><div className="list-side">{money(c.recurringFee)} · {c.nextDueDate}</div></div>):<div className="muted">No recurring payments scheduled.</div>}</div></section><section className="panel"><div className="panel-head"><h3>Quick Actions</h3></div><div className="quick-actions"><button onClick={()=>setDialog('client')}>Add Client</button><button onClick={()=>setDialog('invoice')}>Create Invoice</button><button onClick={()=>setDialog('contract')}>Upload Contract</button><button onClick={()=>location.href='/reports'}>View Reports</button></div></section></div>
  </div>
  <div className="footer-banner"><div><strong>Discipline Builds Freedom.</strong><div>— TD</div></div><button className="btn">Keep Building →</button></div>
  {dialog==='client'&&<AddClientDialog close={()=>setDialog(null)}/>} {dialog==='invoice'&&<CreateInvoiceDialog close={()=>setDialog(null)}/>} {dialog==='contract'&&<UploadContractDialog close={()=>setDialog(null)}/>} 
 </>;
}
