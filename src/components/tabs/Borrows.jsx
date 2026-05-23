import React from 'react';
import { fmtINR } from '../../constants';

export default function Borrows({ borrows, onSettle, onDelete, onAdd, T }) {
  const unsettled = borrows.filter(b => !b.settled);
  const totalLent = unsettled.filter(b=>b.type==="lent").reduce((s,b)=>s+b.amount,0);
  const totalBorrowed = unsettled.filter(b=>b.type==="borrowed").reduce((s,b)=>s+b.amount,0);
  const totalToReceive = unsettled.filter(b=>b.type==="to_receive").reduce((s,b)=>s+b.amount,0);

  const card = { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16,
    padding:"1rem", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };
  const row = { display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"11px 0", borderBottom:`1px solid ${T.divider}` };

  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[["lent","Lent",T.warning],["borrowed","Borrowed",T.danger],["to_receive","To Receive",T.success]].map(([v,l,col]) => (
          <div key={v} style={{ flex:1, background:T.card, border:`1px solid ${T.cardBorder}`,
            borderTop:`3px solid ${col}`, borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:T.textMuted, fontWeight:500, marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:15, fontWeight:700, color:col }}>
              {fmtINR(v==="lent" ? totalLent : v==="borrowed" ? totalBorrowed : totalToReceive)}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onAdd}
        style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:T.info,
          color:"#fff", cursor:"pointer", fontSize:15, fontWeight:600, marginBottom:14 }}>
        <i className="ti ti-plus" style={{ marginRight:6 }} />Add entry
      </button>
      {[["lent","Lent by you",T.warning],["borrowed","Borrowed by you",T.danger],["to_receive","To receive",T.success]].map(([type,label,col]) => {
        const entries = borrows.filter(b => b.type===type);
        if (!entries.length) return null;
        return (
          <div key={type} style={{ ...card, borderTop:`3px solid ${col}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:14, fontWeight:700, color:col }}>{label}</span>
              <span style={{ fontSize:13, fontWeight:600, color:col }}>
                {fmtINR(entries.filter(b=>!b.settled).reduce((s,b)=>s+b.amount,0))}
              </span>
            </div>
            {entries.map(b => (
              <div key={b.id} style={{ ...row, opacity:b.settled ? 0.45 : 1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:col+"15",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <i className="ti ti-user" style={{ fontSize:17, color:col }} />
                  </div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{b.person}</span>
                      {b.settled && (
                        <span style={{ fontSize:10, background:T.success+"18", color:T.success,
                          padding:"2px 7px", borderRadius:6, fontWeight:600 }}>✓ settled</span>
                      )}
                    </div>
                    {b.note && <div style={{ fontSize:11, color:T.textSec }}>{b.note}</div>}
                    <div style={{ fontSize:11, color:T.textMuted }}>{b.date}</div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
                  <span style={{ fontWeight:700, color:col, fontSize:14 }}>{fmtINR(b.amount)}</span>
                  <div style={{ display:"flex", gap:5 }}>
                    {!b.settled && (
                      <button onClick={() => onSettle(b.id)}
                        style={{ background:T.success+"18", border:"none", borderRadius:7,
                          padding:"5px 8px", cursor:"pointer", color:T.success, fontSize:11, fontWeight:600 }}>
                        Settle
                      </button>
                    )}
                    <button onClick={() => onDelete(b.id)}
                      style={{ background:T.danger+"18", border:"none", borderRadius:7,
                        padding:"5px 7px", cursor:"pointer", color:T.danger }}>
                      <i className="ti ti-trash" style={{ fontSize:14 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}