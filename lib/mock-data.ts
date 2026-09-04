import { ActivityItem, Client, Contract, Payment, Project } from './types';
export const clients: Client[] = [
  {id:'c1',name:'Alex Brown',business:'ABC Construction',email:'alex@abcconstruction.com',phone:'714-555-0120',website:'abcconstruction.com',status:'Completed',startDate:'2026-03-02',launchDate:'2026-04-27',package:'5-page website',projectValue:1000,recurringFee:50,notes:'Residential contractor'},
  {id:'c2',name:'Maria Rivera',business:'Rivera Landscaping',email:'maria@riveralandscaping.com',phone:'714-555-0131',website:'riveralandscaping.com',status:'Building',startDate:'2026-04-04',launchDate:'2026-05-20',package:'Full website',projectValue:1800,recurringFee:50,notes:'Landscape design'},
  {id:'c3',name:'Eric Lee',business:'Elite Roofing',email:'eric@eliteroofing.com',phone:'949-555-0190',website:'eliteroofing.com',status:'Contract Signed',startDate:'2026-04-25',launchDate:'2026-06-10',package:'Landing page',projectValue:750,recurringFee:0,notes:'Roofing contractor'},
  {id:'c4',name:'Jose Martinez',business:'Martinez Concrete',email:'jose@martinezconcrete.com',phone:'657-555-0122',website:'martinezconcrete.com',status:'Building',startDate:'2026-04-24',launchDate:'2026-05-30',package:'Website + SEO',projectValue:2200,recurringFee:75,notes:'Concrete services'},
  {id:'c5',name:'Linh Nguyen',business:'Nguyen Nails',email:'linh@nguyennails.com',phone:'714-555-0177',website:'nguyennails.com',status:'Completed',startDate:'2026-03-18',launchDate:'2026-04-22',package:'4-page website',projectValue:950,recurringFee:50,notes:'Nail salon'}
];
export const projects: Project[] = [
  {id:'p1',clientId:'c1',name:'ABC Website',type:'5-page website',status:'Completed',startDate:'2026-03-02',targetLaunchDate:'2026-04-27',price:1000,progress:100,notes:''},
  {id:'p2',clientId:'c2',name:'Rivera Website',type:'Full website',status:'In Progress',startDate:'2026-04-04',targetLaunchDate:'2026-05-20',price:1800,progress:72,notes:''},
  {id:'p3',clientId:'c3',name:'Elite Landing Page',type:'Landing page',status:'Planning',startDate:'2026-04-25',targetLaunchDate:'2026-06-10',price:750,progress:18,notes:''},
  {id:'p4',clientId:'c4',name:'Martinez Website + SEO',type:'Website + SEO',status:'In Progress',startDate:'2026-04-24',targetLaunchDate:'2026-05-30',price:2200,progress:55,notes:''},
  {id:'p5',clientId:'c5',name:'Nguyen Nails Website',type:'4-page website',status:'Completed',startDate:'2026-03-18',targetLaunchDate:'2026-04-22',price:950,progress:100,notes:''}
];
export const payments: Payment[] = [
  {id:'pay1',clientId:'c1',invoice:'INV-1001',type:'Website',amountCharged:1000,amountPaid:1000,paymentDate:'2026-04-27',dueDate:'2026-04-27',method:'Zelle',status:'Paid'},
  {id:'pay2',clientId:'c2',invoice:'INV-1002',type:'Website',amountCharged:1800,amountPaid:900,paymentDate:'2026-04-26',dueDate:'2026-05-15',method:'Zelle',status:'Partial'},
  {id:'pay3',clientId:'c3',invoice:'INV-1003',type:'Website',amountCharged:750,amountPaid:0,paymentDate:'',dueDate:'2026-05-03',method:'',status:'Unpaid'},
  {id:'pay4',clientId:'c4',invoice:'INV-1004',type:'Website',amountCharged:2200,amountPaid:1000,paymentDate:'2026-04-24',dueDate:'2026-05-05',method:'Zelle',status:'Partial'},
  {id:'pay5',clientId:'c5',invoice:'INV-1005',type:'Website',amountCharged:950,amountPaid:950,paymentDate:'2026-04-22',dueDate:'2026-04-22',method:'Cash',status:'Paid'},
  {id:'pay6',clientId:'c1',invoice:'HOST-0501',type:'Hosting',amountCharged:50,amountPaid:0,paymentDate:'',dueDate:'2026-05-01',method:'',status:'Unpaid'},
  {id:'pay7',clientId:'c4',invoice:'HOST-0505',type:'Hosting',amountCharged:75,amountPaid:0,paymentDate:'',dueDate:'2026-05-05',method:'',status:'Unpaid'},
  {id:'pay8',clientId:'c5',invoice:'HOST-0508',type:'Hosting',amountCharged:50,amountPaid:0,paymentDate:'',dueDate:'2026-05-08',method:'',status:'Unpaid'}
];
export const contracts: Contract[] = [
  {id:'ct1',clientId:'c1',name:'Website Scope Agreement',signedDate:'2026-03-02',status:'Signed',fileName:'ABC-Construction-Contract.pdf'},
  {id:'ct2',clientId:'c2',name:'Website Scope Agreement',signedDate:'2026-04-26',status:'Signed',fileName:'Rivera-Landscaping-Contract.pdf'},
  {id:'ct3',clientId:'c3',name:'Landing Page Agreement',signedDate:'',status:'Sent',fileName:'Elite-Roofing-Contract.pdf'}
];
export const activities: ActivityItem[] = [
  {id:'a1',clientId:'c1',label:'Payment received',date:'2026-04-27',amount:1000},
  {id:'a2',clientId:'c2',label:'Contract signed',date:'2026-04-26'},
  {id:'a3',clientId:'c3',label:'New client added',date:'2026-04-25'},
  {id:'a4',clientId:'c4',label:'Project updated',date:'2026-04-24'},
  {id:'a5',clientId:'c5',label:'Invoice sent',date:'2026-04-22'}
];
export const incomeSeries = [{month:'Jan',income:1200},{month:'Feb',income:2200},{month:'Mar',income:3700},{month:'Apr',income:3400},{month:'May',income:5200},{month:'Jun',income:7100}];
