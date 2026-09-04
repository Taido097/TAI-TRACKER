'use client';
import { useState } from 'react';
import { ClientsPage } from '@/components/table-pages';
import { AddClientDialog } from '@/components/dialogs';

export default function Page(){
  const [adding,setAdding]=useState(false);
  return <>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
      <button className="btn accent" onClick={()=>setAdding(true)}>+ Add Client</button>
    </div>
    <ClientsPage/>
    {adding&&<AddClientDialog close={()=>setAdding(false)}/>} 
  </>
}
