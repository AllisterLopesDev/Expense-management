// ✅ Isolated form state
import React, { useState } from 'react';
import { CATEGORIES } from '../../constants';

export default function AddRecurringForm({ onSubmit, T }) {
  const [form, setForm] = useState({ name:"", amount:"", category:"Bills", day:"1" });
  const inp = { boxSizing:"border-box", background:T.inputBg, border:`1px solid ${T.inputBorder}`,
    borderRadius:10, padding:"11px 13px", color:T.text, fontSize:15, outline:"none", width:"100%" };

  const handleSubmit = () => {
    if (!form.name || !form.amount || Number(form.amount) <= 0) return;
    onSubmit({ ...form, amount: Number(form.amount) });
    setForm({ name:"", amount:"", category:"Bills", day:"1" });
  };

  return (
    <>
      <p style={{ fontSize:13, color:T.textMuted, marginBottom:14 }}>
        Auto-logged every month on the selected day.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <input type="text" placeholder="Name (e.g. Netflix)" value={form.name}
          onChange={e => setForm(f => ({ ...f, name:e.target.value }))} style={inp} />
        <input type="number" placeholder="Amount (₹)" value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount:e.target.value }))} style={inp} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))} style={inp}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={form.day} onChange={e => setForm(f => ({ ...f, day:e.target.value }))} style={inp}>
          {Array.from({ length:28 }, (_,i) => <option key={i+1} value={i+1}>Day {i+1}</option>)}
        </select>
      </div>
      <button onClick={handleSubmit}
        style={{ width:"100%", padding:13, borderRadius:10, border:"none",
          background:T.accent, color:"#fff", cursor:"pointer", fontSize:15, fontWeight:600 }}>
        Add Recurring
      </button>
    </>
  );
}