'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { activities as seedActivities, clients as seedClients, contracts as seedContracts, payments as seedPayments, projects as seedProjects } from '@/lib/mock-data';
import { Client, Contract, Payment, Project } from '@/lib/types';

type AppContextValue = {
  clients: Client[]; projects: Project[]; payments: Payment[]; contracts: Contract[]; activities: typeof seedActivities;
  addClient: (client: Client) => void; updateClient: (client: Client) => void; deleteClient: (clientId: string) => void;
  addPayment: (payment: Payment) => void; updatePayment: (payment: Payment) => void; deletePayment: (paymentId: string) => void;
  addContract: (contract: Contract) => void;
  totalIncome: number; outstanding: number; recurring: number; activeClients: number;
};
const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY='tai-tracker-v1';

type StoredData={clients:Client[];projects:Project[];payments:Payment[];contracts:Contract[]};
function nextDueFromPaidThrough(paidThrough:string,billingDay:number){
  if(!paidThrough) return '';
  const [y,m]=paidThrough.split('-').map(Number);
  if(!y||!m) return '';
  const safeDay=Math.min(28,Math.max(1,billingDay||1));
  const d=new Date(Date.UTC(y,m, safeDay));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(safeDay).padStart(2,'0')}`;
}
function normalizeClient(client:Client):Client{
  const billingDay=Math.min(28,Math.max(1,client.billingDay||Number(client.paidThrough?.slice(8,10))||1));
  return {...client,billingDay,nextDueDate:client.recurringFee>0&&client.paidThrough?nextDueFromPaidThrough(client.paidThrough,billingDay):client.nextDueDate||''};
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [contracts, setContracts] = useState<Contract[]>(seedContracts);
  const [storageReady,setStorageReady]=useState(false);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        const saved=JSON.parse(raw) as Partial<StoredData>;
        if(saved.clients) setClients(saved.clients.map(normalizeClient));
        if(saved.projects) setProjects(saved.projects);
        if(saved.payments) setPayments(saved.payments);
        if(saved.contracts) setContracts(saved.contracts);
      }
    }catch(error){console.error('Could not load saved tracker data',error)}
    setStorageReady(true);
  },[]);

  useEffect(()=>{
    if(!storageReady) return;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({clients,projects,payments,contracts} satisfies StoredData))}
    catch(error){console.error('Could not save tracker data',error)}
  },[storageReady,clients,projects,payments,contracts]);

  const syncPaidThrough=(payment:Payment)=>{
    if(!payment.coversThrough||payment.amountPaid<=0||!(payment.type==='Hosting'||payment.type==='Maintenance'||payment.type==='Domain')) return;
    setClients(v=>v.map(c=>{
      if(c.id!==payment.clientId||c.recurringFee<=0) return c;
      if(c.paidThrough&&c.paidThrough>=payment.coversThrough!) return c;
      return normalizeClient({...c,paidThrough:payment.coversThrough});
    }));
  };

  const value = useMemo(() => {
    const totalIncome = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const outstanding = payments.reduce((sum, p) => sum + Math.max(0, p.amountCharged - p.amountPaid), 0);
    const recurring = clients.reduce((sum, c) => sum + c.recurringFee, 0);
    const activeClients = clients.filter(c => c.status !== 'Lead' && c.status !== 'Completed').length;
    return { clients, projects, payments, contracts, activities: seedActivities,
      addClient: (client: Client) => setClients(v => [normalizeClient(client), ...v]),
      updateClient: (client: Client) => setClients(v => v.map(c => c.id === client.id ? normalizeClient(client) : c)),
      deleteClient: (clientId: string) => setClients(v => v.filter(c => c.id !== clientId)),
      addPayment: (payment: Payment) => {setPayments(v => [payment, ...v]);syncPaidThrough(payment)},
      updatePayment: (payment: Payment) => {setPayments(v => v.map(p => p.id === payment.id ? payment : p));syncPaidThrough(payment)},
      deletePayment: (paymentId: string) => setPayments(v => v.filter(p => p.id !== paymentId)),
      addContract: (contract: Contract) => setContracts(v => [contract, ...v]),
      totalIncome, outstanding, recurring, activeClients };
  }, [clients, projects, payments, contracts]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useAppData() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppData must be used inside AppProvider');
  return value;
}
