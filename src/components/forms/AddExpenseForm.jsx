// ✅ Isolated form state — no parent re-render on keystroke
import React, { useState } from 'react';
import { CATEGORIES, CAT_ICONS, CAT_COLORS, today } from '../../constants';

export default function AddExpenseForm({ onSubmit, T }) {
  const [form, setForm] = useState({ amount:"", category:"Food", note:"", date:today() });
  const inp = { boxSizing:"border-box", background:T.inputBg, border:`1px solid ${T.inputBorder}`,
    borderRadius:10, padding:"11px 13px", color:T.text, fontSize:15, outline:"none", width:"100%" };

  const handleSubmit = () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return;
    onSubmit({ ...form, amount: Number(form.amount) });
    setForm({ amount:"", category:"Food", note:"", date:today() });
  };

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <input type="number" placeholder="Amount (₹)" value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount:e.target.value }))} style={inp} autoFocus />
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))} style={inp}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ marginBottom:10 }}>
        <input type="text" placeholder="Note (optional)" value={form.note}
          onChange={e => setForm(f => ({ ...f, note:e.target.value }))} style={inp} />
      </div>
      <div style={{ marginBottom:14 }}>
        <input type="date" value={form.date}
          onChange={e => setForm(f => ({ ...f, date:e.target.value }))} style={inp} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:16 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setForm(f => ({ ...f, category:c }))}
            style={{ padding:"8px 4px", borderRadius:9,
              border:`1.5px solid ${form.category===c ? CAT_COLORS[c] : T.inputBorder}`,
              background: form.category===c ? CAT_COLORS[c]+"18" : "transparent",
              cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <i className={`ti ${CAT_ICONS[c]}`}
              style={{ fontSize:18, color: form.category===c ? CAT_COLORS[c] : T.textMuted }} />
            <span style={{ fontSize:10, color: form.category===c ? CAT_COLORS[c] : T.textMuted,
              fontWeight: form.category===c ? 600 : 400 }}>{c}</span>
          </button>
        ))}
      </div>
      <button onClick={handleSubmit}
        style={{ width:"100%", padding:13, borderRadius:10, border:"none",
          background:T.accent, color:"#fff", cursor:"pointer", fontSize:15, fontWeight:600 }}>
        Add Expense
      </button>
    </>
  );
}