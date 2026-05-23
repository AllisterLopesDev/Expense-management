// ✅ Defined OUTSIDE App — prevents remount on every render
import React from 'react';

export default function Modal({ show, onClose, title, children, T }) {
  if (!show) return null;
  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"flex-end",
        justifyContent:"center", background:"rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        style={{ background:T.card, borderRadius:"20px 20px 0 0", width:"100%",
          maxWidth:520, padding:"1.25rem 1.25rem 2rem", maxHeight:"90vh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width:36, height:4, background:T.cardBorder, borderRadius:99, margin:"0 auto 16px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:17, fontWeight:700, color:T.text }}>{title}</span>
          <button onClick={onClose}
            style={{ background:"none", border:"none", fontSize:24, color:T.textMuted, cursor:"pointer", lineHeight:1 }}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}