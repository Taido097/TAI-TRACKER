export type ClientStatus = 'Lead' | 'Demo' | 'Contract Signed' | 'Building' | 'Completed' | 'Maintenance';
export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
export type ContractStatus = 'Draft' | 'Sent' | 'Signed';

export interface Client {
  id: string; name: string; business: string; email: string; phone: string; website: string;
  status: ClientStatus; startDate: string; launchDate: string; package: string; projectValue: number;
  recurringFee: number; billingDay?: number; paidThrough?: string; nextDueDate?: string; notes: string;
}
export interface Project {
  id: string; clientId: string; name: string; type: string; status: ProjectStatus; startDate: string;
  targetLaunchDate: string; price: number; progress: number; notes: string;
}
export interface Payment {
  id: string; clientId: string; invoice: string; type: 'Website' | 'Hosting' | 'Maintenance' | 'Domain' | 'Other';
  amountCharged: number; amountPaid: number; paymentDate: string; dueDate: string; method: string; status: PaymentStatus;
  coversThrough?: string;
}
export interface Contract {
  id: string; clientId: string; name: string; signedDate: string; status: ContractStatus; fileName: string;
}
export interface ActivityItem { id: string; clientId: string; label: string; date: string; amount?: number; }
