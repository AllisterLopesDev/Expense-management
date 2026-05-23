import React from 'react';

export default function Toast({ toast, T }) {
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", zIndex:300,
      background: toast.type === "error" ? T.danger : T.success,
      color:"#fff", padding:"10px 24px", borderRadius:99, fontSize:13, fontWeight:600,
      boxShadow:"0 4px 16px rgba(0,0,0,0.2)", whiteSpace:"nowrap", pointerEvents:"none" }}>
      {toast.msg}
    </div>
  );
}