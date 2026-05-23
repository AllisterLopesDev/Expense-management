import React from 'react';
import { CAT_ICONS, CAT_COLORS, fmtINR } from '../../constants';

export default function Dashboard({ T, monthExp, totalSpent, budget, pct, barColor,
  totalLent, totalBorrowed, totalToReceive, catData, onAddExpense, onNavigate }) {
  const card = { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16,
    padding:"1rem", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };
  const row = { display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"11px 0", borderBottom:`1px solid ${T.divider}` };

  return (
    <>
      {/* Hero card */}
      <div style={{ background:T.accent, borderRadius:20, padding:"18px", marginBottom:14,
        color:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100,
          borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
        <div style={{ fontSize:12, opacity:0.75, marginBottom:4, fontWeight:500 }}>TOTAL SPENT THIS MONTH</div>
        <div style={{ fontSize:32, fontWeight:800, marginBottom:12 }}>{fmtINR(totalSpent)}</div>
        {budget > 0 ? (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, opacity:0.85, marginBottom:6 }}>
              <span>Budget: {fmtINR(budget)}</span>
              <span style={{ fontWeight:600 }}>{Math.round(pct)}% used</span>
            </div>
            <div style={{ height:7, background:"rgba(255,255,255,0.25)", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`,
                background: pct>=100 ? "#ef4444" : pct>=80 ? "#f59e0b" : "#fff",
                borderRadius:99, transition:"width 0.5s" }} />
            </div>
            {pct >= 100 && <div style={{ marginTop:6, fontSize:12, fontWeight:600, color:"#fecaca" }}>⚠ Over budget!</div>}
            {pct >= 80 && pct < 100 && <div style={{ marginTop:6, fontSize:12, fontWeight:600, color:"#fef3c7" }}>⚠ Nearing limit</div>}
          </>
        ) : (
          <div style={{ fontSize:12, opacity:0.65 }}>Tap Budget tab to set a monthly limit</div>
        )}
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
        {[
          { label:"Remaining", val: budget ? fmtINR(Math.max(budget-totalSpent,0)) : "—", col: budget&&totalSpent>budget ? T.danger : T.success },
          { label:"You lent",  val: fmtINR(totalLent),      col: T.warning },
          { label:"To receive",val: fmtINR(totalToReceive), col: T.info },
        ].map((m,i) => (
          <div key={i} style={{ background:T.card, borderRadius:12, padding:"10px", textAlign:"center",
            border:`1px solid ${T.cardBorder}`, borderTop:`2px solid ${m.col}` }}>
            <div style={{ fontSize:10, color:T.textMuted, fontWeight:500, marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:14, fontWeight:700, color:m.col }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Borrow summary */}
      {(totalBorrowed > 0 || totalLent > 0) && (
        <div style={{ ...card, display:"flex", padding:0, overflow:"hidden", marginBottom:12 }}>
          <div style={{ flex:1, padding:"12px", textAlign:"center", borderRight:`1px solid ${T.cardBorder}` }}>
            <div style={{ fontSize:10, color:T.textMuted, fontWeight:500, marginBottom:3 }}>YOU BORROWED</div>
            <div style={{ fontSize:16, fontWeight:700, color:T.danger }}>{fmtINR(totalBorrowed)}</div>
          </div>
          <div style={{ flex:1, padding:"12px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:T.textMuted, fontWeight:500, marginBottom:3 }}>YOU LENT</div>
            <div style={{ fontSize:16, fontWeight:700, color:T.warning }}>{fmtINR(totalLent)}</div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {catData.length > 0 && (
        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:12 }}>This month</div>
          {catData.map(c => (
            <div key={c.cat} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span style={{ display:"flex", alignItems:"center", gap:6, color:T.textSec }}>
                  <i className={`ti ${CAT_ICONS[c.cat]}`} style={{ color:CAT_COLORS[c.cat], fontSize:14 }} />
                  {c.cat}
                </span>
                <span style={{ fontWeight:600, color:T.text }}>{fmtINR(c.total)}</span>
              </div>
              <div style={{ height:6, background:T.barBg, borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${totalSpent>0?(c.total/totalSpent)*100:0}%`,
                  background:CAT_COLORS[c.cat], borderRadius:99 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent */}
      <div style={card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:14, fontWeight:700, color:T.text }}>Recent</span>
          <button onClick={() => onNavigate("expenses")}
            style={{ fontSize:12, color:T.accent, background:"none", border:"none", cursor:"pointer", fontWeight:500 }}>
            See all →
          </button>
        </div>
        {monthExp.length === 0
          ? <div style={{ fontSize:13, color:T.textMuted, textAlign:"center", padding:"16px 0" }}>No expenses yet this month</div>
          : monthExp.slice(0,5).map(e => (
            <div key={e.id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:CAT_COLORS[e.category]+"18",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <i className={`ti ${CAT_ICONS[e.category]}`} style={{ fontSize:17, color:CAT_COLORS[e.category] }} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{e.note || e.category}</div>
                  <div style={{ fontSize:11, color:T.textMuted }}>{e.date}</div>
                </div>
              </div>
              <span style={{ fontWeight:700, color:T.text, fontSize:14 }}>{fmtINR(e.amount)}</span>
            </div>
          ))
        }
      </div>

      {/* FAB */}
      <button onClick={onAddExpense}
        style={{ position:"fixed", bottom:76, right:16, width:52, height:52, borderRadius:"50%",
          background:T.accent, border:"none", color:"#fff", fontSize:26, cursor:"pointer",
          boxShadow:"0 4px 16px rgba(37,99,235,0.4)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:99 }}>
        <i className="ti ti-plus" />
      </button>
    </>
  );
}