import React, { useState } from 'react';
import { CAT_ICONS, CAT_COLORS, MONTHS, fmtINR, getMonthKey } from '../../constants';

export default function Charts({ expenses, T }) {
  const [view, setView] = useState("category");
  const monthKey = getMonthKey();
  const monthExp = expenses.filter(e => e.date.startsWith(monthKey));
  const totalSpent = monthExp.reduce((s,e) => s+e.amount, 0);

  const catData = Object.entries(
    monthExp.reduce((acc,e) => { acc[e.category]=(acc[e.category]||0)+e.amount; return acc; }, {})
  ).sort((a,b)=>b[1]-a[1]);

  const now = new Date();
  const trendData = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const mk = getMonthKey(d);
    return { label:MONTHS[d.getMonth()], total:expenses.filter(e=>e.date.startsWith(mk)).reduce((s,e)=>s+e.amount,0), mk };
  });
  const maxTrend = Math.max(...trendData.map(t=>t.total), 1);

  const card = { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16,
    padding:"1rem", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };
  const divider = { padding:"8px 0", borderBottom:`1px solid ${T.divider}`, display:"flex",
    justifyContent:"space-between", fontSize:13 };

  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[["category","By Category"],["trend","6-Month Trend"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ flex:1, padding:"10px", borderRadius:10,
              border:`1.5px solid ${view===v ? T.accent : T.cardBorder}`,
              background: view===v ? T.accent : "transparent",
              color: view===v ? "#fff" : T.textSec, cursor:"pointer", fontSize:13,
              fontWeight: view===v ? 700 : 400 }}>{l}</button>
        ))}
      </div>

      {view === "category" && (
        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:14 }}>This month by category</div>
          {catData.length === 0
            ? <div style={{ fontSize:13, color:T.textMuted, textAlign:"center", padding:"20px 0" }}>No data yet</div>
            : catData.map(([cat, total]) => {
              const p = totalSpent > 0 ? ((total/totalSpent)*100).toFixed(1) : 0;
              return (
                <div key={cat} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:7, color:T.textSec }}>
                      <i className={`ti ${CAT_ICONS[cat]}`} style={{ color:CAT_COLORS[cat], fontSize:15 }} />{cat}
                    </span>
                    <span style={{ color:T.text, fontWeight:600 }}>{fmtINR(total)} <span style={{ color:T.textMuted, fontSize:11 }}>({p}%)</span></span>
                  </div>
                  <div style={{ height:22, background:T.barBg, borderRadius:8, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${p}%`, background:CAT_COLORS[cat], borderRadius:8, transition:"width 0.5s" }} />
                  </div>
                </div>
              );
            })
          }
          {catData.length > 0 && (
            <div style={{ paddingTop:10, borderTop:`1px solid ${T.divider}`, display:"flex", justifyContent:"space-between", fontSize:14 }}>
              <span style={{ color:T.textSec, fontWeight:500 }}>Total</span>
              <span style={{ fontWeight:700, color:T.text }}>{fmtINR(totalSpent)}</span>
            </div>
          )}
        </div>
      )}

      {view === "trend" && (
        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:14 }}>Last 6 months</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:160, marginBottom:8 }}>
            {trendData.map((t,i) => {
              const h = maxTrend > 0 ? (t.total/maxTrend)*140 : 4;
              const isCur = t.mk === monthKey;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <div style={{ fontSize:9, color:T.textMuted, fontWeight:500, height:14, display:"flex", alignItems:"center" }}>
                    {t.total > 0 ? fmtINR(t.total) : ""}
                  </div>
                  <div style={{ width:"100%", height:`${Math.max(h,4)}px`, background: isCur ? T.accent : T.barBg,
                    borderRadius:"6px 6px 0 0", border:`1px solid ${isCur ? T.accent : T.cardBorder}`, transition:"height 0.5s" }} />
                  <div style={{ fontSize:10, color: isCur ? T.accent : T.textMuted, fontWeight: isCur ? 700 : 400 }}>{t.label}</div>
                </div>
              );
            })}
          </div>
          {trendData.slice().reverse().map((t,i) => (
            <div key={i} style={divider}>
              <span style={{ color: t.mk===monthKey ? T.accent : T.textSec, fontWeight: t.mk===monthKey ? 600 : 400 }}>
                {t.label} {t.mk.split("-")[0]}
              </span>
              <span style={{ fontWeight:600, color:T.text }}>{t.total > 0 ? fmtINR(t.total) : "—"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}