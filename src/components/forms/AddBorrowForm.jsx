// ✅ Isolated form state
import React, { useState } from 'react';
import { today } from '../../constants';

export default function AddBorrowForm({ onSubmit, T }) {
  const [form, setForm] = useState({ type:"lent", person:"", amount:"", note:"", date:today() });
  const inp = { boxSizing:"border-box", background:T.inputBg, border:`1px solid ${T.inputBorder}`,
    borderRadius:10, padding:"11px 13px", color:T.text, fontSize:15, outline:"none", width:"100%" };

  const handleSubmit = () => {
    if (!form.person || !form.amount || Number(form.amount) <= 0) return;
    onSubmit({ ...form, amount: Number(form.amount) });
    setForm({ type:"lent", person:"", amount:"", note:"", date:today() });
  };

  return (
    <>
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[["lent","I lent",T.warning],["borrowed","I borrowed",T.danger],["to_receive","To receive",T.success]].map(([v,l,col]) => (
          <button key={v} onClick={() => setForm(f => ({ ...f, type:v }))}
            style={{ flex:1, padding:"9px 4px", fontSize:12, borderRadius:9,
              border:`1.5px solid ${form.type===v ? col : T.inputBorder}`,
              background: form.type===v ? col+"18" : "transparent",
              color: form.type===v ? col : T.textSec, cursor:"pointer",
              fontWeight: form.type===v ? 600 : 400 }}>{l}</button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <input type="text" placeholder="Person's name" value={form.person}
          onChange={e => setForm(f => ({ ...f, person:e.target.value }))} style={inp} />
        <input type="number" placeholder="Amount (₹)" value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount:e.target.value }))} style={inp} />
      </div>
      <div style={{ marginBottom:10 }}>
        <input type="text" placeholder="Note (optional)" value={form.note}
          onChange={e => setForm(f => ({ ...f, note:e.target.value }))} style={inp} />
      </div>
      <div style={{ marginBottom:16 }}>
        <input type="date" value={form.date}
          onChange={e => setForm(f => ({ ...f, date:e.target.value }))} style={inp} />
      </div>
      <button onClick={handleSubmit}
        style={{ width:"100%", padding:13, borderRadius:10, border:"none",
          background:T.info, color:"#fff", cursor:"pointer", fontSize:15, fontWeight:600 }}>
        Add Entry
      </button>
    </>
  );
}