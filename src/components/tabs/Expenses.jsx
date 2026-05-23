import React, { useState, useMemo } from 'react';
import { CATEGORIES, CAT_ICONS, CAT_COLORS, fmtINR, getMonthKey } from '../../constants';

export default function Expenses({ expenses, onDelete, onExport, T }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterMonth, setFilterMonth] = useState(getMonthKey());

  const filtered = useMemo(() => expenses.filter(e => {
    const ms = !search || e.note?.toLowerCase().includes(search.toLowerCase())
      || e.category.toLowerCase().includes(search.toLowerCase());
    return ms && (filterCat==="All" || e.category===filterCat)
      && (!filterMonth || e.date.startsWith(filterMonth));
  }), [expenses, search, filterCat, filterMonth]);

  const total = filtered.reduce((s,e) => s+e.amount, 0);

  const inp = { boxSizing:"border-box", background:T.inputBg, border:`1px solid ${T.inputBorder}`,
    borderRadius:10, padding:"11px 13px", color:T.text, fontSize:15, outline:"none" };
  const row = { display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"11px 0", borderBottom:`1px solid ${T.divider}` };
  const card = { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16,
    padding:"1rem", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };

  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input type="text" placeholder="🔍 Search..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ ...inp, flex:1 }} />
      </div>
      <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:10, paddingBottom:4 }}>
        {["All",...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{ padding:"7px 13px", fontSize:12, borderRadius:9, whiteSpace:"nowrap", flexShrink:0,
              border:`1.5px solid ${filterCat===c ? T.accent : T.inputBorder}`,
              background: filterCat===c ? T.accent+"18" : "transparent",
              color: filterCat===c ? T.accent : T.textSec, cursor:"pointer",
              fontWeight: filterCat===c ? 600 : 400 }}>{c}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          style={{ ...inp, flex:1 }} />
        <button onClick={onExport}
          style={{ padding:"9px 14px", borderRadius:9, border:`1.5px solid ${T.success}`,
            background: T.success+"14", color:T.success, cursor:"pointer", fontSize:13,
            fontWeight:400, display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
          <i className="ti ti-download" /> CSV
        </button>
      </div>
      <div style={{ fontSize:12, color:T.textMuted, marginBottom:8, paddingLeft:2 }}>
        {filtered.length} entries · <strong style={{ color:T.text }}>{fmtINR(total)}</strong>
      </div>
      <div style={card}>
        {filtered.length === 0
          ? <div style={{ fontSize:13, color:T.textMuted, textAlign:"center", padding:"20px 0" }}>No matching expenses</div>
          : filtered.map(e => (
            <div key={e.id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:CAT_COLORS[e.category]+"18",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <i className={`ti ${CAT_ICONS[e.category]}`} style={{ fontSize:18, color:CAT_COLORS[e.category] }} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{e.note || e.category}</div>
                  <div style={{ fontSize:11, color:T.textMuted }}>{e.date} · {e.category}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <span style={{ fontWeight:700, color:T.text }}>{fmtINR(e.amount)}</span>
                <button onClick={() => onDelete(e.id)}
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