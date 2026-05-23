import React from 'react';
import { CAT_ICONS, CAT_COLORS, fmtINR } from '../../constants';

export default function Recurring({ recurrings, onDelete, onAdd, T }) {
  const card = { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16,
    padding:"1rem", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };
  const row = { display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"11px 0", borderBottom:`1px solid ${T.divider}` };

  return (
    <>
      <button onClick={onAdd}
        style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:T.accent,
          color:"#fff", cursor:"pointer", fontSize:15, fontWeight:600, marginBottom:14 }}>
        <i className="ti ti-plus" style={{ marginRight:6 }} />Add recurring expense
      </button>
      <div style={card}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:12 }}>Active ({recurrings.length})</div>
        {recurrings.length === 0
          ? <div style={{ fontSize:13, color:T.textMuted, textAlign:"center", padding:"20px 0" }}>No recurring expenses set</div>
          : recurrings.map(r => (
            <div key={r.id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:CAT_COLORS[r.category]+"18",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <i className={`ti ${CAT_ICONS[r.category]}`} style={{ fontSize:18, color:CAT_COLORS[r.category] }} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{r.name}</div>
                  <div style={{ fontSize:11, color:T.textMuted }}>Every month · Day {r.day} · {r.category}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <span style={{ fontWeight:700, color:T.accent }}>{fmtINR(r.amount)}</span>
                <button onClick={() => onDelete(r.id)}
                  style={{ background:T.danger+"18", border:"none", borderRadius:8,
                    padding:"6px 8px", cursor:"pointer", color:T.danger }}>
                  <i className="ti ti-trash" style={{ fontSize:15 }} />
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );
}