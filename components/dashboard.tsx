'use client';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { incomeSeries } from '@/lib/mock-data';
import { useAppData } from './app-provider';
import { AddClientDialog, CreateInvoiceDialog, UploadContractDialog } from './dialogs';
import { useState } from 'react';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const statusClass=(s:string)=> s==='Completed'||s==='Paid'||s==='Signed'?'green':s==='In Progress'||s==='Building'?'blue':s==='Planning'||s==='Partial'||s==='Sent'?'yellow':s==='Overdue'?'red':'gray';
export function Dashboard(){
 const d=useAppData(); const [dialog,setDialog]=useState<'client'|'invoice'|'contract'|null>(null);
 const counts=['Completed','In Progress','On Hold','Planning'].map(s=>({name:s,value:d.projects.filter(p=>p.status===s).length}));
 const colors=['#2eb67d','#4d8ef7','#e7b93d','#9ba09c'];
 return <>
  <div className="page-head"><div><h1>Turn Ideas Into Online Success</h1><p>Track. Manage. Grow. All in one place.</p></div><button className="btn accent" onClick={()=>setDialog('client')}>+ Add Client</button></div>
  <div className="grid stats">
   <div className="stat-card"><div className="stat-label">Total Income</div><div className="stat-value">{money(d.totalIncome)}</div><div className="stat-note">↑ Cash received</div></div>
   <div className="stat-card"><div className="stat-label">Active Clients</div><div className="stat-value">{d.activeClients}</div><div className="stat-note">↑ Current workload</div></div>
   <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value">{money(d.outstanding)}</div><div className="stat-note" style={{color:'var(--red)'}}>{d.payments.filter(p=>p.status!=='Paid').length} open invoices</div></div>
   <div className="stat-card"><div className="stat-label">Monthly Recurring</div><div className="stat-value">{money(d.recurring)}</div><div className="stat-note">Hosting + maintenance</div></div>
  </div>
  <div className="grid dashboard-grid">
   <section className="panel"><div className="panel-head"><h2>Income Overview</h2><span className="muted">Last 6 months</span></div><div style={{height:250}}><ResponsiveContainer width="100%" height="100%"><LineChart data={incomeSeries}><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Line type="monotone" dataKey="income" stroke="#9b7a32" strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer></div></section>
   <section className="panel"><div className="panel-head"><h2>Project Status</h2></div><div style={{height:250,display:'flex',alignItems:'center'}}><ResponsiveContainer width="55%" height="100%"><PieChart><Pie data={counts} dataKey="value" innerRadius={55} outerRadius={83} paddingAngle={2}>{counts.map((_,i)=><Cell key={i} fill={colors[i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="list" style={{flex:1}}>{counts.map(c=><div className="list-row" key={c.name}><div className="list-main"><strong>{c.name}</strong></div><span>{c.value}</span></div>)}</div></div></section>
  </div>
  <div className="grid lower-grid">
   <section className="panel"><div className="panel-head"><h3>Recent Clients</h3><span className="muted">View all</span></div><div className="list">{d.clients.slice(0,5).map(c=><div className="list-row" key={c.id}><div className="list-main"><strong>{c.business}</strong><span>{c.package}</span></div><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></div>)}</div></section>
   <section className="panel"><div className="panel-head"><h3>Recent Activity</h3><span className="muted">View all</span></div><div className="list">{d.activities.map(a=>{const c=d.clients.find(x=>x.id===a.clientId);return <div className="list-row" key={a.id}><div className="list-main"><strong>{a.label}</strong><span>{c?.business}</span></div><div className="list-side">{a.amount?money(a.amount):a.date}</div></div>})}</div></section>
   <div className="grid" style={{gap:16}}><section className="panel"><div className="panel-head"><h3>Upcoming Payments</h3></div><div className="list">{d.payments.filter(p=>p.status!=='Paid').slice(0,4).map(p=>{const c=d.clients.find(x=>x.id===p.clientId);return <div className="list-row" key={p.id}><div className="list-main"><strong>{c?.business}</strong><span>{p.type}</span></div><div className="list-side">{money(p.amountCharged-p.amountPaid)} · {p.dueDate}</div></div>})}</div></section><section className="panel"><div className="panel-head"><h3>Quick Actions</h3></div><div className="quick-actions"><button onClick={()=>setDialog('client')}>Add Client</button><button onClick={()=>setDialog('invoice')}>Create Invoice</button><button onClick={()=>setDialog('contract')}>Upload Contract</button><button onClick={()=>location.href='/reports'}>View Reports</button></div></section></div>
  </div>
  <div className="footer-banner"><div><strong>Discipline Builds Freedom.</strong><div>— TD</div></div><button className="btn">Keep Building →</button></div>
  {dialog==='client'&&<AddClientDialog close={()=>setDialog(null)}/>} {dialog==='invoice'&&<CreateInvoiceDialog close={()=>setDialog(null)}/>} {dialog==='contract'&&<UploadContractDialog close={()=>setDialog(null)}/>} 
 </>;
}
