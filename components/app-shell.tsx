'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BarChart3, CreditCard, FileText, Files, FolderKanban, LayoutDashboard, Menu, Search, Settings, Users, X } from 'lucide-react';
import { useAppData } from './app-provider';

const nav = [
  ['Dashboard','/',LayoutDashboard],['Clients','/clients',Users],['Projects','/projects',FolderKanban],['Payments','/payments',CreditCard],
  ['Contracts','/contracts',FileText],['Files','/files',Files],['Reports','/reports',BarChart3],['Settings','/settings',Settings]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const [open,setOpen] = useState(false); const [q,setQ]=useState('');
  const { clients, projects, payments } = useAppData();
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s=q.toLowerCase();
    return [
      ...clients.filter(c => `${c.name} ${c.business}`.toLowerCase().includes(s)).map(c=>({label:c.business,meta:'Client',href:'/clients'})),
      ...projects.filter(p => p.name.toLowerCase().includes(s)).map(p=>({label:p.name,meta:'Project',href:'/projects'})),
      ...payments.filter(p => p.invoice.toLowerCase().includes(s)).map(p=>({label:p.invoice,meta:'Invoice',href:'/payments'}))
    ].slice(0,6);
  },[q,clients,projects,payments]);
  const Sidebar = () => <aside className="sidebar">
    <div className="brand"><div className="brand-title">DesignedbyTD</div><div className="brand-sub">BUSINESS TRACKER</div></div>
    <nav>{nav.map(([label,href,Icon]) => <Link key={href} href={href} className={`nav-item ${path===href?'active':''}`} onClick={()=>setOpen(false)}><Icon size={18}/><span>{label}</span></Link>)}</nav>
  </aside>;
  return <div className="app-wrap">
    <div className="desktop-side"><Sidebar/></div>
    {open && <div className="mobile-overlay"><div className="mobile-side"><button className="icon-btn close" onClick={()=>setOpen(false)}><X/></button><Sidebar/></div></div>}
    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={()=>setOpen(true)}><Menu/></button>
        <div className="search-wrap"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clients, projects, invoices..."/>
          {results.length>0 && <div className="search-results">{results.map((r,i)=><Link href={r.href} key={i} onClick={()=>setQ('')}><strong>{r.label}</strong><span>{r.meta}</span></Link>)}</div>}
        </div>
        <div className="profile"><div className="avatar">TD</div><div><strong>Tai Do</strong><span>Business Owner</span></div></div>
      </header>
      <div className="content">{children}</div>
    </main>
  </div>;
}
