import { useState, useEffect, useMemo } from "react";

const CATEGORIES = ["Food","Transport","Bills","Shopping","Health","Entertainment","Other"];
const CAT_ICONS = { Food:"ti-salad", Transport:"ti-car", Bills:"ti-file-invoice", Shopping:"ti-shopping-cart", Health:"ti-heart-rate-monitor", Entertainment:"ti-device-tv", Other:"ti-dots" };
const CAT_COLORS = { Food:"#3b82f6", Transport:"#0ea5e9", Bills:"#6366f1", Shopping:"#8b5cf6", Health:"#22c55e", Entertainment:"#14b8a6", Other:"#94a3b8" };

const getMonthKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const fmtINR = n => `₹${Number(n).toLocaleString("en-IN")}`;
const today = () => new Date().toISOString().split("T")[0];
const load = () => { try { const s=localStorage.getItem("xpns_v6"); return s?JSON.parse(s):null; } catch{return null;} };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const THEMES = {
  light:{ bg:"#f0f4f8", card:"#ffffff", cardBorder:"#e2e8f0", text:"#0f172a", textSec:"#475569", textMuted:"#94a3b8", header:"#1e40af", headerText:"#ffffff", headerBorder:"#1d4ed8", tabBg:"transparent", tabActive:"#ffffff", tabText:"rgba(255,255,255,0.7)", tabActiveText:"#1e40af", inputBg:"#f8fafc", inputBorder:"#cbd5e1", metricBg:"#f8fafc", barBg:"#e2e8f0", divider:"#f1f5f9", accent:"#2563eb", success:"#16a34a", danger:"#dc2626", warning:"#d97706", info:"#0284c7", bottomNav:"#ffffff", bottomNavBorder:"#e2e8f0" },
  dark:{ bg:"#0f172a", card:"#1e293b", cardBorder:"#334155", text:"#f1f5f9", textSec:"#94a3b8", textMuted:"#475569", header:"#0f172a", headerText:"#f1f5f9", headerBorder:"#1e293b", tabBg:"transparent", tabActive:"#1e40af", tabText:"rgba(148,163,184,0.8)", tabActiveText:"#ffffff", inputBg:"#0f172a", inputBorder:"#334155", metricBg:"#0f172a", barBg:"#334155", divider:"#1e293b", accent:"#3b82f6", success:"#22c55e", danger:"#ef4444", warning:"#f59e0b", info:"#38bdf8", bottomNav:"#1e293b", bottomNavBorder:"#334155" },
  night:{ bg:"#060a14", card:"#0d1526", cardBorder:"#1a2540", text:"#cbd5e1", textSec:"#64748b", textMuted:"#374151", header:"#060a14", headerText:"#93c5fd", headerBorder:"#0d1526", tabBg:"transparent", tabActive:"#0d1f40", tabText:"rgba(147,197,253,0.5)", tabActiveText:"#93c5fd", inputBg:"#060a14", inputBorder:"#1a2540", metricBg:"#060a14", barBg:"#1a2540", divider:"#0d1526", accent:"#1d4ed8", success:"#15803d", danger:"#b91c1c", warning:"#b45309", info:"#0369a1", bottomNav:"#0d1526", bottomNavBorder:"#1a2540" }
};

const NAV_TABS = [
  {id:"dashboard",icon:"ti-layout-dashboard",label:"Home"},
  {id:"expenses",icon:"ti-receipt",label:"Expenses"},
  {id:"borrows",icon:"ti-arrows-exchange",label:"Borrow"},
  {id:"budget",icon:"ti-target",label:"Budget"},
  {id:"more",icon:"ti-dots",label:"More"},
];
const MORE_TABS = [
  {id:"charts",icon:"ti-chart-bar",label:"Charts"},
  {id:"recurring",icon:"ti-refresh",label:"Recurring"},
];

export default function App() {
  const saved = load();
  const [themeKey, setThemeKey] = useState(saved?.theme||"light");
  const [tab, setTab] = useState("dashboard");
  const [showMore, setShowMore] = useState(false);
  const [expenses, setExpenses] = useState(saved?.expenses||[]);
  const [borrows, setBorrows] = useState(saved?.borrows||[]);
  const [budgets, setBudgets] = useState(saved?.budgets||{});
  const [recurrings, setRecurrings] = useState(saved?.recurrings||[]);
  const [showAddExp, setShowAddExp] = useState(false);
  const [showAddBorrow, setShowAddBorrow] = useState(false);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [form, setForm] = useState({amount:"",category:"Food",note:"",date:today()});
  const [bForm, setBForm] = useState({type:"lent",person:"",amount:"",note:"",date:today()});
  const [rForm, setRForm] = useState({name:"",amount:"",category:"Bills",day:"1"});
  const [budgetInput, setBudgetInput] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterMonth, setFilterMonth] = useState(getMonthKey());
  const [chartView, setChartView] = useState("category");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  const T = THEMES[themeKey];
  const monthKey = getMonthKey();
  const budget = budgets[monthKey]||0;

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setDeferredPrompt(null);
  };

  useEffect(()=>{ try{localStorage.setItem("xpns_v6",JSON.stringify({expenses,borrows,budgets,recurrings,theme:themeKey}))}catch{} },[expenses,borrows,budgets,recurrings,themeKey]);

  useEffect(()=>{
    if (!recurrings.length) return;
    const now=new Date(), mk=getMonthKey(now);
    const updates=[];
    recurrings.forEach(r=>{
      if (!expenses.some(e=>e.recurringId===r.id&&e.date.startsWith(mk))&&now.getDate()>=Number(r.day)){
        const d=new Date(now.getFullYear(),now.getMonth(),Math.min(Number(r.day),new Date(now.getFullYear(),now.getMonth()+1,0).getDate()));
        updates.push({id:Date.now()+Math.random(),amount:Number(r.amount),category:r.category,note:r.name+" (recurring)",date:d.toISOString().split("T")[0],recurringId:r.id});
      }
    });
    if (updates.length) setExpenses(p=>[...updates,...p]);
  },[recurrings]);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};
  const monthExp=expenses.filter(e=>e.date.startsWith(monthKey));
  const totalSpent=monthExp.reduce((s,e)=>s+Number(e.amount),0);
  const pct=budget>0?Math.min((totalSpent/budget)*100,100):0;
  const barColor=pct>=100?T.danger:pct>=80?T.warning:T.success;

  const addExpense=()=>{
    if (!form.amount||isNaN(form.amount)||Number(form.amount)<=0) return showToast("Enter a valid amount","error");
    setExpenses(p=>[{id:Date.now(),...form,amount:Number(form.amount)},...p]);
    setForm(f=>({...f,amount:"",note:""})); setShowAddExp(false); showToast("Expense added!");
  };
  const addBorrow=()=>{
    if (!bForm.person||!bForm.amount||Number(bForm.amount)<=0) return showToast("Fill all fields","error");
    setBorrows(p=>[{id:Date.now(),...bForm,amount:Number(bForm.amount),settled:false},...p]);
    setBForm(f=>({...f,person:"",amount:"",note:""})); setShowAddBorrow(false); showToast("Entry added!");
  };
  const addRecurring=()=>{
    if (!rForm.name||!rForm.amount||Number(rForm.amount)<=0) return showToast("Fill all fields","error");
    setRecurrings(p=>[{id:Date.now(),...rForm,amount:Number(rForm.amount)},...p]);
    setRForm({name:"",amount:"",category:"Bills",day:"1"}); setShowAddRecurring(false); showToast("Recurring added!");
  };
  const settleEntry=id=>setBorrows(p=>p.map(b=>b.id===id?{...b,settled:true}:b));
  const deleteExpense=id=>setExpenses(p=>p.filter(e=>e.id!==id));
  const deleteBorrow=id=>setBorrows(p=>p.filter(b=>b.id!==id));
  const deleteRecurring=id=>setRecurrings(p=>p.filter(r=>r.id!==id));
  const saveBudget=()=>{
    if (!budgetInput||isNaN(budgetInput)||Number(budgetInput)<=0) return showToast("Enter valid budget","error");
    setBudgets(p=>({...p,[monthKey]:Number(budgetInput)})); setBudgetInput(""); showToast("Budget saved!");
  };
  const exportCSV=()=>{
    const rows=[["Date","Category","Note","Amount"],...expenses.map(e=>[e.date,e.category,e.note||"",e.amount])];
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n")); a.download="expenses.csv"; a.click(); showToast("CSV exported!");
  };

  const unsettled=borrows.filter(b=>!b.settled);
  const totalLent=unsettled.filter(b=>b.type==="lent").reduce((s,b)=>s+b.amount,0);
  const totalBorrowed=unsettled.filter(b=>b.type==="borrowed").reduce((s,b)=>s+b.amount,0);
  const totalToReceive=unsettled.filter(b=>b.type==="to_receive").reduce((s,b)=>s+b.amount,0);
  const catData=CATEGORIES.map(c=>({cat:c,total:monthExp.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)})).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);
  const trendData=useMemo(()=>{const now=new Date();return Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);const mk=getMonthKey(d);return{label:MONTHS[d.getMonth()],total:expenses.filter(e=>e.date.startsWith(mk)).reduce((s,e)=>s+e.amount,0),mk};});},[expenses]);
  const maxTrend=Math.max(...trendData.map(t=>t.total),1);
  const filteredExp=useMemo(()=>expenses.filter(e=>{const ms=!search||e.note?.toLowerCase().includes(search.toLowerCase())||e.category.toLowerCase().includes(search.toLowerCase());return ms&&(filterCat==="All"||e.category===filterCat)&&(!filterMonth||e.date.startsWith(filterMonth));}),[expenses,search,filterCat,filterMonth]);
  const filteredTotal=filteredExp.reduce((s,e)=>s+e.amount,0);

  const card={background:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:16,padding:"1rem",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"};
  const inp={boxSizing:"border-box",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:15,outline:"none",width:"100%",WebkitAppearance:"none"};
  const row={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${T.divider}`};
  const badge=(col)=>({fontSize:11,background:col+"18",color:col,padding:"3px 9px",borderRadius:6,fontWeight:600,border:`1px solid ${col}25`});
  const btnSolid=(col)=>({width:"100%",padding:"13px",borderRadius:10,border:"none",background:col,color:"#fff",cursor:"pointer",fontSize:15,fontWeight:600});
  const btnOutline=(col,active)=>({padding:"9px 14px",borderRadius:9,border:`1.5px solid ${active?col:T.inputBorder}`,background:active?col+"18":"transparent",color:active?col:T.textSec,cursor:"pointer",fontSize:13,fontWeight:active?600:400});

  const Modal=({show,onClose,title,children})=>{
    if (!show) return null;
    return (
      <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.5)"}} onClick={onClose}>
        <div style={{background:T.card,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,padding:"1.25rem 1.25rem 2rem",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{width:36,height:4,background:T.cardBorder,borderRadius:99,margin:"0 auto 16px"}} />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{fontSize:17,fontWeight:700,color:T.text}}>{title}</span>
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,color:T.textMuted,cursor:"pointer",lineHeight:1}}>&times;</button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const handleNavTab=(id)=>{ if(id==="more"){setShowMore(v=>!v);return;} setTab(id);setShowMore(false); };

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <style>{`
        *{-webkit-tap-highlight-color:transparent}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input::placeholder{color:${T.textMuted}}
        select option{background:${T.card};color:${T.text}}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:${T.cardBorder};border-radius:99px}
      `}</style>

      {/* Install Banner */}
      {showInstall&&(
        <div style={{background:T.accent,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <i className="ti ti-download" style={{fontSize:20,color:"#fff"}} />
            <span style={{fontSize:13,color:"#fff",fontWeight:500}}>Install Expense Manager as an app</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleInstall} style={{padding:"6px 14px",borderRadius:8,border:"2px solid rgba(255,255,255,0.7)",background:"rgba(255,255,255,0.2)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>Install</button>
            <button onClick={()=>setShowInstall(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:20,lineHeight:1}}>&times;</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:T.header,borderBottom:`1px solid ${T.headerBorder}`,padding:"14px 16px 12px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid rgba(255,255,255,0.25)"}}>
              <i className="ti ti-wallet" style={{fontSize:18,color:"#fff"}} />
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:T.headerText}}>Expense Manager</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{new Date().toLocaleString("default",{month:"long",year:"numeric"})}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {[["light","☀️"],["dark","🌙"],["night","🌑"]].map(([k,ic])=>(
              <button key={k} onClick={()=>setThemeKey(k)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${themeKey===k?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.15)"}`,background:themeKey===k?"rgba(255,255,255,0.2)":"transparent",color:T.headerText,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{ic}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast&&(<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:300,background:toast.type==="error"?T.danger:T.success,color:"#fff",padding:"10px 24px",borderRadius:99,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>{toast.msg}</div>)}

      {/* More Drawer */}
      {showMore&&(
        <div style={{position:"fixed",bottom:65,left:0,right:0,zIndex:150,padding:"0 12px 8px"}}>
          <div style={{background:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:16,padding:"8px",boxShadow:"0 -4px 24px rgba(0,0,0,0.15)",display:"flex",gap:8}}>
            {MORE_TABS.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setShowMore(false);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 8px",borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.cardBorder}`,background:tab===t.id?T.accent+"18":"transparent",cursor:"pointer"}}>
                <i className={`ti ${t.icon}`} style={{fontSize:20,color:tab===t.id?T.accent:T.textMuted}} />
                <span style={{fontSize:11,color:tab===t.id?T.accent:T.textMuted,fontWeight:tab===t.id?600:400}}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 12px",paddingBottom:80}}>

        {tab==="dashboard"&&<>
          <div style={{background:T.accent,borderRadius:20,padding:"18px",marginBottom:14,color:"#fff",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}} />
            <div style={{fontSize:12,opacity:0.75,marginBottom:4,fontWeight:500}}>TOTAL SPENT THIS MONTH</div>
            <div style={{fontSize:32,fontWeight:800,marginBottom:12}}>{fmtINR(totalSpent)}</div>
            {budget>0&&<>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,opacity:0.85,marginBottom:6}}>
                <span>Budget: {fmtINR(budget)}</span><span style={{fontWeight:600}}>{Math.round(pct)}% used</span>
              </div>
              <div style={{height:7,background:"rgba(255,255,255,0.25)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:pct>=100?"#ef4444":pct>=80?"#f59e0b":"#fff",borderRadius:99,transition:"width 0.5s"}} />
              </div>
              {pct>=100&&<div style={{marginTop:6,fontSize:12,fontWeight:600,color:"#fecaca"}}>⚠ Over budget!</div>}
              {pct>=80&&pct<100&&<div style={{marginTop:6,fontSize:12,fontWeight:600,color:"#fef3c7"}}>⚠ Nearing budget limit</div>}
            </>}
            {!budget&&<div style={{fontSize:12,opacity:0.65}}>Tap Budget tab to set a monthly limit</div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[{label:"Remaining",val:budget?fmtINR(Math.max(budget-totalSpent,0)):"—",col:budget&&totalSpent>budget?T.danger:T.success},{label:"You lent",val:fmtINR(totalLent),col:T.warning},{label:"To receive",val:fmtINR(totalToReceive),col:T.info}].map((m,i)=>(
              <div key={i} style={{background:T.card,borderRadius:12,padding:"10px",textAlign:"center",border:`1px solid ${T.cardBorder}`,borderTop:`2px solid ${m.col}`}}>
                <div style={{fontSize:10,color:T.textMuted,fontWeight:500,marginBottom:4}}>{m.label}</div>
                <div style={{fontSize:14,fontWeight:700,color:m.col}}>{m.val}</div>
              </div>
            ))}
          </div>
          {(totalBorrowed>0||totalLent>0)&&<div style={{...card,display:"flex",gap:0,padding:0,overflow:"hidden",marginBottom:12}}>
            <div style={{flex:1,padding:"12px",textAlign:"center",borderRight:`1px solid ${T.cardBorder}`}}>
              <div style={{fontSize:10,color:T.textMuted,fontWeight:500,marginBottom:3}}>YOU BORROWED</div>
              <div style={{fontSize:16,fontWeight:700,color:T.danger}}>{fmtINR(totalBorrowed)}</div>
            </div>
            <div style={{flex:1,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.textMuted,fontWeight:500,marginBottom:3}}>YOU LENT</div>
              <div style={{fontSize:16,fontWeight:700,color:T.warning}}>{fmtINR(totalLent)}</div>
            </div>
          </div>}
          {catData.length>0&&<div style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>This month</div>
            {catData.map(c=>(
              <div key={c.cat} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                  <span style={{display:"flex",alignItems:"center",gap:6,color:T.textSec}}><i className={`ti ${CAT_ICONS[c.cat]}`} style={{color:CAT_COLORS[c.cat],fontSize:14}} />{c.cat}</span>
                  <span style={{fontWeight:600,color:T.text}}>{fmtINR(c.total)}</span>
                </div>
                <div style={{height:6,background:T.barBg,borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${totalSpent>0?(c.total/totalSpent)*100:0}%`,background:CAT_COLORS[c.cat],borderRadius:99}} />
                </div>
              </div>
            ))}
          </div>}
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:14,fontWeight:700,color:T.text}}>Recent</span>
              <button onClick={()=>setTab("expenses")} style={{fontSize:12,color:T.accent,background:"none",border:"none",cursor:"pointer",fontWeight:500}}>See all →</button>
            </div>
            {monthExp.length===0?<div style={{fontSize:13,color:T.textMuted,textAlign:"center",padding:"16px 0"}}>No expenses yet this month</div>:
              monthExp.slice(0,5).map(e=>(
                <div key={e.id} style={row}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:10,background:CAT_COLORS[e.category]+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${CAT_ICONS[e.category]}`} style={{fontSize:17,color:CAT_COLORS[e.category]}} />
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>{e.note||e.category}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>{e.date}</div>
                    </div>
                  </div>
                  <span style={{fontWeight:700,color:T.text,fontSize:14}}>{fmtINR(e.amount)}</span>
                </div>
              ))
            }
          </div>
          <button onClick={()=>setShowAddExp(true)} style={{position:"fixed",bottom:76,right:16,width:52,height:52,borderRadius:"50%",background:T.accent,border:"none",color:"#fff",fontSize:26,cursor:"pointer",boxShadow:"0 4px 16px rgba(37,99,235,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99}}>
            <i className="ti ti-plus" />
          </button>
        </>}

        {tab==="expenses"&&<>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input type="text" placeholder="🔍 Search expenses..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,flex:1}} />
            <button onClick={()=>setShowAddExp(true)} style={{padding:"11px 16px",borderRadius:10,border:"none",background:T.accent,color:"#fff",cursor:"pointer",flexShrink:0}}><i className="ti ti-plus" style={{fontSize:16}} /></button>
          </div>
          <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:10,paddingBottom:4}}>
            {["All",...CATEGORIES].map(c=>(<button key={c} onClick={()=>setFilterCat(c)} style={{...btnOutline(T.accent,filterCat===c),whiteSpace:"nowrap",flexShrink:0,padding:"7px 13px",fontSize:12}}>{c}</button>))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
            <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{...inp,flex:1}} />
            <button onClick={exportCSV} style={{...btnOutline(T.success,false),flexShrink:0,display:"flex",alignItems:"center",gap:5}}><i className="ti ti-download" /> CSV</button>
          </div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:8,paddingLeft:2}}>{filteredExp.length} entries · <strong style={{color:T.text}}>{fmtINR(filteredTotal)}</strong></div>
          <div style={card}>
            {filteredExp.length===0?<div style={{fontSize:13,color:T.textMuted,textAlign:"center",padding:"20px 0"}}>No matching expenses</div>:
              filteredExp.map(e=>(
                <div key={e.id} style={row}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:CAT_COLORS[e.category]+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${CAT_ICONS[e.category]}`} style={{fontSize:18,color:CAT_COLORS[e.category]}} />
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>{e.note||e.category}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>{e.date} · {e.category}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    <span style={{fontWeight:700,color:T.text}}>{fmtINR(e.amount)}</span>
                    <button onClick={()=>deleteExpense(e.id)} style={{background:T.danger+"18",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:T.danger}}><i className="ti ti-trash" style={{fontSize:15}} /></button>
                  </div>
                </div>
              ))
            }
          </div>
        </>}

        {tab==="borrows"&&<>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[["lent","Lent",T.warning],["borrowed","Borrowed",T.danger],["to_receive","To Receive",T.success]].map(([v,l,col])=>(
              <div key={v} style={{flex:1,background:T.card,border:`1px solid ${T.cardBorder}`,borderTop:`3px solid ${col}`,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:10,color:T.textMuted,fontWeight:500,marginBottom:2}}>{l}</div>
                <div style={{fontSize:15,fontWeight:700,color:col}}>{fmtINR(v==="lent"?totalLent:v==="borrowed"?totalBorrowed:totalToReceive)}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowAddBorrow(true)} style={{...btnSolid(T.info),marginBottom:14}}><i className="ti ti-plus" style={{marginRight:6}} />Add entry</button>
          {[["lent","Lent by you",T.warning],["borrowed","Borrowed by you",T.danger],["to_receive","To receive",T.success]].map(([type,label,col])=>{
            const entries=borrows.filter(b=>b.type===type);
            if (!entries.length) return null;
            return (
              <div key={type} style={{...card,borderTop:`3px solid ${col}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:14,fontWeight:700,color:col}}>{label}</span>
                  <span style={{fontSize:13,fontWeight:600,color:col}}>{fmtINR(entries.filter(b=>!b.settled).reduce((s,b)=>s+b.amount,0))}</span>
                </div>
                {entries.map(b=>(
                  <div key={b.id} style={{...row,opacity:b.settled?0.45:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:col+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <i className="ti ti-user" style={{fontSize:17,color:col}} />
                      </div>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:13,fontWeight:600,color:T.text}}>{b.person}</span>
                          {b.settled&&<span style={{fontSize:10,background:T.success+"18",color:T.success,padding:"2px 7px",borderRadius:6,fontWeight:600}}>✓ settled</span>}
                        </div>
                        {b.note&&<div style={{fontSize:11,color:T.textSec}}>{b.note}</div>}
                        <div style={{fontSize:11,color:T.textMuted}}>{b.date}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                      <span style={{fontWeight:700,color:col,fontSize:14}}>{fmtINR(b.amount)}</span>
                      <div style={{display:"flex",gap:5}}>
                        {!b.settled&&<button onClick={()=>settleEntry(b.id)} style={{background:T.success+"18",border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",color:T.success,fontSize:11,fontWeight:600}}>Settle</button>}
                        <button onClick={()=>deleteBorrow(b.id)} style={{background:T.danger+"18",border:"none",borderRadius:7,padding:"5px 7px",cursor:"pointer",color:T.danger}}><i className="ti ti-trash" style={{fontSize:14}} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </>}

        {tab==="budget"&&<>
          <div style={{background:T.accent,borderRadius:20,padding:"20px",marginBottom:14,color:"#fff"}}>
            <div style={{fontSize:12,opacity:0.75,marginBottom:4,fontWeight:500}}>{new Date().toLocaleString("default",{month:"long",year:"numeric"}).toUpperCase()}</div>
            <div style={{fontSize:13,opacity:0.8,marginBottom:8}}>Current budget</div>
            <div style={{fontSize:30,fontWeight:800,marginBottom:14}}>{budget?fmtINR(budget):"Not set"}</div>
            <div style={{display:"flex",gap:10}}>
              <input type="number" placeholder="Set new limit (₹)" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} style={{...inp,flex:1,background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",fontSize:14}} />
              <button onClick={saveBudget} style={{padding:"11px 18px",borderRadius:10,border:"2px solid rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.2)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14,whiteSpace:"nowrap"}}>Save</button>
            </div>
          </div>
          {budget>0&&<div style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>This month's usage</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
              {[{l:"Budget",v:fmtINR(budget),c:T.accent},{l:"Spent",v:fmtINR(totalSpent),c:T.danger},{l:"Left",v:fmtINR(Math.max(budget-totalSpent,0)),c:totalSpent>budget?T.danger:T.success}].map((m,i)=>(
                <div key={i} style={{background:T.metricBg,borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${T.cardBorder}`}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:3,fontWeight:500}}>{m.l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{height:14,background:T.barBg,borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:99,transition:"width 0.5s"}} />
            </div>
            <div style={{textAlign:"right",marginTop:6,fontSize:12,color:T.textMuted,fontWeight:500}}>{Math.round(pct)}% used</div>
          </div>}
          <div style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Past budgets</div>
            {Object.keys(budgets).length===0?<div style={{fontSize:13,color:T.textMuted,textAlign:"center",padding:"16px 0"}}>No budgets set yet</div>:
              Object.entries(budgets).sort((a,b)=>b[0].localeCompare(a[0])).map(([k,v])=>{
                const [yr,mo]=k.split("-");
                const lbl=new Date(Number(yr),Number(mo)-1).toLocaleString("default",{month:"short",year:"numeric"});
                const spent=expenses.filter(e=>e.date.startsWith(k)).reduce((s,e)=>s+e.amount,0);
                const p=Math.min((spent/v)*100,100);
                return (
                  <div key={k} style={{padding:"10px 0",borderBottom:`1px solid ${T.divider}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                      <span style={{color:T.textSec,fontWeight:500}}>{lbl}</span>
                      <span style={{color:T.text,fontWeight:600}}>{fmtINR(spent)} <span style={{color:T.textMuted,fontWeight:400}}>/ {fmtINR(v)}</span></span>
                    </div>
                    <div style={{height:5,background:T.barBg,borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${p}%`,background:p>=100?T.danger:T.success,borderRadius:99}} />
                    </div>
                  </div>
                );
              })
            }
          </div>
        </>}

        {tab==="charts"&&<>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[["category","By Category"],["trend","6-Month Trend"]].map(([v,l])=>(
              <button key={v} onClick={()=>setChartView(v)} style={{flex:1,padding:"10px",borderRadius:10,border:`1.5px solid ${chartView===v?T.accent:T.cardBorder}`,background:chartView===v?T.accent:"transparent",color:chartView===v?"#fff":T.textSec,cursor:"pointer",fontSize:13,fontWeight:chartView===v?700:400}}>{l}</button>
            ))}
          </div>
          {chartView==="category"&&<div style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>This month by category</div>
            {catData.length===0?<div style={{fontSize:13,color:T.textMuted,textAlign:"center",padding:"20px 0"}}>No data yet</div>:
              catData.map(c=>{
                const p=totalSpent>0?((c.total/totalSpent)*100).toFixed(1):0;
                return (
                  <div key={c.cat} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                      <span style={{display:"flex",alignItems:"center",gap:7,color:T.textSec}}><i className={`ti ${CAT_ICONS[c.cat]}`} style={{color:CAT_COLORS[c.cat],fontSize:15}} />{c.cat}</span>
                      <span style={{color:T.text,fontWeight:600}}>{fmtINR(c.total)} <span style={{color:T.textMuted,fontSize:11}}>({p}%)</span></span>
                    </div>
                    <div style={{height:22,background:T.barBg,borderRadius:8,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${p}%`,background:CAT_COLORS[c.cat],borderRadius:8,transition:"width 0.5s"}} />
                    </div>
                  </div>
                );
              })
            }
            {catData.length>0&&<div style={{paddingTop:10,borderTop:`1px solid ${T.divider}`,display:"flex",justifyContent:"space-between",fontSize:14}}>
              <span style={{color:T.textSec,fontWeight:500}}>Total</span><span style={{fontWeight:700,color:T.text}}>{fmtINR(totalSpent)}</span>
            </div>}
          </div>}
          {chartView==="trend"&&<div style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Last 6 months</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:160,marginBottom:8}}>
              {trendData.map((t,i)=>{
                const h=maxTrend>0?(t.total/maxTrend)*140:4;
                const isCur=t.mk===monthKey;
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:9,color:T.textMuted,fontWeight:500,height:14,display:"flex",alignItems:"center"}}>{t.total>0?fmtINR(t.total):""}</div>
                    <div style={{width:"100%",height:`${Math.max(h,4)}px`,background:isCur?T.accent:T.barBg,borderRadius:"6px 6px 0 0",border:`1px solid ${isCur?T.accent:T.cardBorder}`,transition:"height 0.5s"}} />
                    <div style={{fontSize:10,color:isCur?T.accent:T.textMuted,fontWeight:isCur?700:400}}>{t.label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:8}}>
              {trendData.slice().reverse().map((t,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.divider}`,fontSize:13}}>
                  <span style={{color:t.mk===monthKey?T.accent:T.textSec,fontWeight:t.mk===monthKey?600:400}}>{t.label} {t.mk.split("-")[0]}</span>
                  <span style={{fontWeight:600,color:T.text}}>{t.total>0?fmtINR(t.total):"—"}</span>
                </div>
              ))}
            </div>
          </div>}
        </>}

        {tab==="recurring"&&<>
          <button onClick={()=>setShowAddRecurring(true)} style={{...btnSolid(T.accent),marginBottom:14}}><i className="ti ti-plus" style={{marginRight:6}} />Add recurring expense</button>
          <div style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Active ({recurrings.length})</div>
            {recurrings.length===0?<div style={{fontSize:13,color:T.textMuted,textAlign:"center",padding:"20px 0"}}>No recurring expenses set</div>:
              recurrings.map(r=>(
                <div key={r.id} style={row}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:CAT_COLORS[r.category]+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${CAT_ICONS[r.category]}`} style={{fontSize:18,color:CAT_COLORS[r.category]}} />
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>{r.name}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>Every month · Day {r.day} · {r.category}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    <span style={{fontWeight:700,color:T.accent}}>{fmtINR(r.amount)}</span>
                    <button onClick={()=>deleteRecurring(r.id)} style={{background:T.danger+"18",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:T.danger}}><i className="ti ti-trash" style={{fontSize:15}} /></button>
                  </div>
                </div>
              ))
            }
          </div>
        </>}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.bottomNav,borderTop:`1px solid ${T.bottomNavBorder}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        {NAV_TABS.map(t=>{
          const isActive=t.id==="more"?showMore:(tab===t.id&&!showMore);
          return (
            <button key={t.id} onClick={()=>handleNavTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px 8px",background:"none",border:"none",cursor:"pointer",position:"relative"}}>
              {t.id==="more"&&MORE_TABS.some(m=>m.id===tab)&&<div style={{position:"absolute",top:8,right:"25%",width:7,height:7,borderRadius:"50%",background:T.accent}} />}
              <i className={`ti ${t.icon}`} style={{fontSize:20,color:isActive?T.accent:T.textMuted}} />
              <span style={{fontSize:10,color:isActive?T.accent:T.textMuted,fontWeight:isActive?700:400}}>{t.label}</span>
              {isActive&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:2.5,background:T.accent,borderRadius:"0 0 3px 3px"}} />}
            </button>
          );
        })}
      </div>

      {/* Add Expense Modal */}
      <Modal show={showAddExp} onClose={()=>setShowAddExp(false)} title="Add Expense">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} style={inp} autoFocus />
          <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inp}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        </div>
        <div style={{marginBottom:10}}><input type="text" placeholder="Note (optional)" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} style={inp} /></div>
        <div style={{marginBottom:14}}><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inp} /></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setForm(f=>({...f,category:c}))} style={{padding:"8px 4px",borderRadius:9,border:`1.5px solid ${form.category===c?CAT_COLORS[c]:T.inputBorder}`,background:form.category===c?CAT_COLORS[c]+"18":"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <i className={`ti ${CAT_ICONS[c]}`} style={{fontSize:18,color:form.category===c?CAT_COLORS[c]:T.textMuted}} />
              <span style={{fontSize:10,color:form.category===c?CAT_COLORS[c]:T.textMuted,fontWeight:form.category===c?600:400}}>{c}</span>
            </button>
          ))}
        </div>
        <button style={btnSolid(T.accent)} onClick={addExpense}>Add Expense</button>
      </Modal>

      {/* Add Borrow Modal */}
      <Modal show={showAddBorrow} onClose={()=>setShowAddBorrow(false)} title="Log Borrow / Lend">
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["lent","I lent",T.warning],["borrowed","I borrowed",T.danger],["to_receive","To receive",T.success]].map(([v,l,col])=>(
            <button key={v} onClick={()=>setBForm(f=>({...f,type:v}))} style={{flex:1,padding:"9px 4px",fontSize:12,borderRadius:9,border:`1.5px solid ${bForm.type===v?col:T.inputBorder}`,background:bForm.type===v?col+"18":"transparent",color:bForm.type===v?col:T.textSec,cursor:"pointer",fontWeight:bForm.type===v?600:400}}>{l}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <input type="text" placeholder="Person's name" value={bForm.person} onChange={e=>setBForm(f=>({...f,person:e.target.value}))} style={inp} />
          <input type="number" placeholder="Amount (₹)" value={bForm.amount} onChange={e=>setBForm(f=>({...f,amount:e.target.value}))} style={inp} />
        </div>
        <div style={{marginBottom:10}}><input type="text" placeholder="Note (optional)" value={bForm.note} onChange={e=>setBForm(f=>({...f,note:e.target.value}))} style={inp} /></div>
        <div style={{marginBottom:16}}><input type="date" value={bForm.date} onChange={e=>setBForm(f=>({...f,date:e.target.value}))} style={inp} /></div>
        <button style={btnSolid(T.info)} onClick={addBorrow}>Add Entry</button>
      </Modal>

      {/* Add Recurring Modal */}
      <Modal show={showAddRecurring} onClose={()=>setShowAddRecurring(false)} title="Add Recurring Expense">
        <div style={{fontSize:13,color:T.textMuted,marginBottom:14}}>Auto-logged every month on the selected day.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <input type="text" placeholder="Name (e.g. Netflix)" value={rForm.name} onChange={e=>setRForm(f=>({...f,name:e.target.value}))} style={inp} />
          <input type="number" placeholder="Amount (₹)" value={rForm.amount} onChange={e=>setRForm(f=>({...f,amount:e.target.value}))} style={inp} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <select value={rForm.category} onChange={e=>setRForm(f=>({...f,category:e.target.value}))} style={inp}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
          <select value={rForm.day} onChange={e=>setRForm(f=>({...f,day:e.target.value}))} style={inp}>{Array.from({length:28},(_,i)=><option key={i+1} value={i+1}>Day {i+1}</option>)}</select>
        </div>
        <button style={btnSolid(T.accent)} onClick={addRecurring}>Add Recurring</button>
      </Modal>
    </div>
  );
}