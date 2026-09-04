'use client';
import { createContext, useContext, useMemo, useState } from 'react';
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
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState(seedClients);
  const [projects] = useState(seedProjects);
  const [payments, setPayments] = useState(seedPayments);
  const [contracts, setContracts] = useState(seedContracts);
  const value = useMemo(() => {
    const totalIncome = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const outstanding = payments.reduce((sum, p) => sum + Math.max(0, p.amountCharged - p.amountPaid), 0);
    const recurring = clients.reduce((sum, c) => sum + c.recurringFee, 0);
    const activeClients = clients.filter(c => c.status !== 'Lead' && c.status !== 'Completed').length;
    return { clients, projects, payments, contracts, activities: seedActivities,
      addClient: (client: Client) => setClients(v => [client, ...v]),
      updateClient: (client: Client) => setClients(v => v.map(c => c.id === client.id ? client : c)),
      deleteClient: (clientId: string) => setClients(v => v.filter(c => c.id !== clientId)),
      addPayment: (payment: Payment) => setPayments(v => [payment, ...v]),
      updatePayment: (payment: Payment) => setPayments(v => v.map(p => p.id === payment.id ? payment : p)),
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
