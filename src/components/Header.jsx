import React from 'react';

export default function Header({ themeKey, setThemeKey, T, onInstallClick, isInstalled }) {
  return (
    <div style={{ background:T.header, borderBottom:`1px solid ${T.headerBorder}`,
      padding:"14px 16px 12px", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"#2563eb",
            display:"flex", alignItems:"center", justifyContent:"center",
            border:"2px solid rgba(255,255,255,0.25)" }}>
            <i className="ti ti-wallet" style={{ fontSize:18, color:"#fff" }} />
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:T.headerText }}>Expense Manager</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>
              {new Date().toLocaleString("default", { month:"long", year:"numeric" })}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          {/* Manual install button — always visible until installed */}
          {!isInstalled && (
            <button onClick={onInstallClick}
              title="Install App"
              style={{ width:32, height:32, borderRadius:8,
                border:"1px solid rgba(255,255,255,0.3)",
                background:"rgba(255,255,255,0.15)",
                color:T.headerText, cursor:"pointer", fontSize:16,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              <i className="ti ti-download" />
            </button>
          )}
          {[["light","☀️"],["dark","🌙"],["night","🌑"]].map(([k, ic]) => (
            <button key={k} onClick={() => setThemeKey(k)}
              style={{ width:32, height:32, borderRadius:8,
                border:`1px solid ${themeKey===k ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)"}`,
                background: themeKey===k ? "rgba(255,255,255,0.2)" : "transparent",
                color:T.headerText, cursor:"pointer", fontSize:14,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              {ic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}