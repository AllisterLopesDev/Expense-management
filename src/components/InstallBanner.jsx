import React from 'react';

// Shows on Android Chrome (beforeinstallprompt) AND has a manual install button in header
export default function InstallBanner({ isInstallable, isInstalled, onInstall, T }) {
  if (isInstalled || !isInstallable) return null;
  return (
    <div style={{ background:T.accent, padding:"10px 16px", display:"flex",
      alignItems:"center", justifyContent:"space-between", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <i className="ti ti-download" style={{ fontSize:20, color:"#fff" }} />
        <span style={{ fontSize:13, color:"#fff", fontWeight:500 }}>Install as app for offline use</span>
      </div>
      <button onClick={onInstall}
        style={{ padding:"6px 14px", borderRadius:8, border:"2px solid rgba(255,255,255,0.7)",
          background:"rgba(255,255,255,0.2)", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>
        Install
      </button>
    </div>
  );
}