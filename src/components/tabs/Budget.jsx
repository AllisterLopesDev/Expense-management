import React, { useState } from 'react';
import { fmtINR, getMonthKey } from '../../constants';

export default function Budget({ budgets, expenses, onSave, T }) {
  const [input, setInput] = useState("");
  const monthKey = getMonthKey();
  const budget = budgets[monthKey] || 0;
  const totalSpent = expenses.filter(e=>e.date.startsWith(monthKey)).reduce((s,e)=>s+e.amount,0);
  const pct = budget>0 ? Math.min((totalSpent/budget)*100,100) : 0;
  const barColor = pct>=100 ? T.danger : pct>=80 ? T.warning : T.success;

  const inp = { boxSizing:"border-box", background:"rgba(255,255,255,0.2)",
    border:"1px solid rgba(255,255,255,0.3)", borderRadius:10, padding:"11px 13px",
    color:"#fff", fontSize:14, outline:"none", width:"100%" };

  const card = { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16,
    padding:"1rem", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };

  const handleSave = () => {
    if (!input || isNaN(input) || Number(input) <= 0) return;
    onSave(Number(input));
    setInput("");
  };

  return (
    <>
      <div style={{ background:T.accent, borderRadius:20, padding:"20px", marginBottom:14, color:"#fff" }}>
        <div style={{ fontSize:12, opacity:0.75, marginBottom:4, fontWeight:500 }}>
          {new Date().toLocaleString("default",{month:"long",year:"numeric"}).toUpperCase()}
        </div>
        <div style={{ fontSize:13, opacity:0.8, marginBottom:8 }}>Current budget</div>
        <div style={{ fontSize:30, fontWeight:800, marginBottom:14 }}>{budget ? fmtINR(budget) : "Not set"}</div>
        <div style={{ display:"flex", gap:10 }}>
          <input type="number" placeholder="Set new limit (₹)" value={input}
            onChange={e => setInput(e.target.value)} style={inp} />
          <button onClick={handleSave}
            style={{ padding:"11px 18px", borderRadius:10, border:"2px solid rgba(255,255,255,0.5)",
              background:"rgba(255,255,255,0.2)", color:"#fff", cursor:"pointer",
              fontWeight:700, fontSize:14, whiteSpace:"nowrap" }}>Save</button>
        </div>
      </div>

      {budget > 0 && (
        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:14 }}>This month's usage</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
            {[{l:"Budget",v:fmtINR(budget),c:T.accent},{l:"Spent",v:fmtINR(totalSpent),c:T.danger},
              {l:"Left",v:fmtINR(Math.max(budget-totalSpent,0)),c:totalSpent>budget?T.danger:T.success}].map((m,i)=>(
              <div key={i} style={{ background:T.metricBg, borderRadius:10, padding:"10px",
                textAlign:"center", border:`1px solid ${T.cardBorder}` }}>
                <div style={{ fontSize:10, color:T.textMuted, marginBottom:3, fontWeight:500 }}>{m.l}</div>
                <div style={{ fontSize:14, fontWeight:700, color:m.c }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{ height:14, background:T.barBg, borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:99, transition:"width 0.5s" }} />
          </div>
          <div style={{ textAlign:"right", marginTop:6, fontSize:12, color:T.textMuted, fontWeight:500 }}>{Math.round(pct)}% used</div>
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:12 }}>Past budgets</div>
        {Object.keys(budgets).length === 0
          ? <div style={{ fontSize:13, color:T.textMuted, textAlign:"center", padding:"16px 0" }}>No budgets set yet</div>
          : Object.entries(budgets).sort((a,b)=>b[0].localeCompare(a[0])).map(([k,v]) => {
            const [yr,mo] = k.split("-");
            const lbl = new Date(Number(yr),Number(mo)-1).toLocaleString("default",{month:"short",year:"numeric"});
            const spent = expenses.filter(e=>e.date.startsWith(k)).reduce((s,e)=>s+e.amount,0);
            const p = Math.min((spent/v)*100,100);
            return (
              <div key={k} style={{ padding:"10px 0", borderBottom:`1px solid ${T.divider}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                  <span style={{ color:T.textSec, fontWeight:500 }}>{lbl}</span>
                  <span style={{ color:T.text, fontWeight:600 }}>{fmtINR(spent)} <span style={{ color:T.textMuted, fontWeight:400 }}>/ {fmtINR(v)}</span></span>
                </div>
                <div style={{ height:5, background:T.barBg, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${p}%`, background:p>=100?T.danger:T.success, borderRadius:99 }} />
                </div>
              </div>
            );
          })
        }
      </div>
    </>
  );
}