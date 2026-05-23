import React from 'react';
import { NAV_TABS, MORE_TABS } from '../constants';

export default function BottomNav({ tab, showMore, onTabClick, T }) {
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.bottomNav,
      borderTop:`1px solid ${T.bottomNavBorder}`, display:"flex", zIndex:100,
      paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
      {NAV_TABS.map(t => {
        const isActive = t.id === "more" ? showMore : (tab === t.id && !showMore);
        return (
          <button key={t.id} onClick={() => onTabClick(t.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"10px 4px 8px", background:"none", border:"none",
              cursor:"pointer", position:"relative" }}>
            {t.id === "more" && MORE_TABS.some(m => m.id === tab) && (
              <div style={{ position:"absolute", top:8, right:"25%", width:7, height:7,
                borderRadius:"50%", background:T.accent }} />
            )}
            <i className={`ti ${t.icon}`} style={{ fontSize:20, color:isActive ? T.accent : T.textMuted }} />
            <span style={{ fontSize:10, color:isActive ? T.accent : T.textMuted, fontWeight:isActive ? 700 : 400 }}>
              {t.label}
            </span>
            {isActive && (
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                width:24, height:2.5, background:T.accent, borderRadius:"0 0 3px 3px" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}