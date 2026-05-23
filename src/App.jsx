import { useState, useEffect, useCallback } from "react";
import { CATEGORIES, getMonthKey, today, fmtINR } from './constants';
import { THEMES } from './themes';
import { usePWAInstall } from './hooks/usePWAInstall';

// Layout
import Header       from './components/Header';
import BottomNav    from './components/BottomNav';
import Modal        from './components/Modal';
import Toast        from './components/Toast';
import InstallBanner from './components/InstallBanner';

// Tabs
import Dashboard  from './components/tabs/Dashboard';
import Expenses   from './components/tabs/Expenses';
import Borrows    from './components/tabs/Borrows';
import Budget     from './components/tabs/Budget';
import Charts     from './components/tabs/Charts';
import Recurring  from './components/tabs/Recurring';

// Forms (inside modals — isolated state, no cursor jump)
import AddExpenseForm   from './components/forms/AddExpenseForm';
import AddBorrowForm    from './components/forms/AddBorrowForm';
import AddRecurringForm from './components/forms/AddRecurringForm';

const load = () => { try { const s=localStorage.getItem("xpns_v7"); return s?JSON.parse(s):null; } catch{return null;} };

export default function App() {
  const saved = load();
  const [themeKey, setThemeKey]     = useState(saved?.theme || "light");
  const [tab, setTab]               = useState("dashboard");
  const [showMore, setShowMore]     = useState(false);
  const [expenses, setExpenses]     = useState(saved?.expenses   || []);
  const [borrows, setBorrows]       = useState(saved?.borrows    || []);
  const [budgets, setBudgets]       = useState(saved?.budgets    || {});
  const [recurrings, setRecurrings] = useState(saved?.recurrings || []);
  const [showAddExp, setShowAddExp]         = useState(false);
  const [showAddBorrow, setShowAddBorrow]   = useState(false);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [toast, setToast] = useState(null);

  const T = THEMES[themeKey];
  const monthKey = getMonthKey();
  const budget = budgets[monthKey] || 0;
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  useEffect(() => {
    try { localStorage.setItem("xpns_v7", JSON.stringify({expenses,borrows,budgets,recurrings,theme:themeKey})); }
    catch {}
  }, [expenses, borrows, budgets, recurrings, themeKey]);

  // Auto-apply recurring expenses
  useEffect(() => {
    if (!recurrings.length) return;
    const now = new Date(), mk = getMonthKey(now);
    const updates = [];
    recurrings.forEach(r => {
      if (!expenses.some(e=>e.recurringId===r.id&&e.date.startsWith(mk)) && now.getDate()>=Number(r.day)) {
        const d = new Date(now.getFullYear(), now.getMonth(), Math.min(Number(r.day), new Date(now.getFullYear(),now.getMonth()+1,0).getDate()));
        updates.push({ id:Date.now()+Math.random(), amount:Number(r.amount), category:r.category,
          note:r.name+" (recurring)", date:d.toISOString().split("T")[0], recurringId:r.id });
      }
    });
    if (updates.length) setExpenses(p => [...updates, ...p]);
  }, [recurrings]);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  // Derived
  const monthExp   = expenses.filter(e => e.date.startsWith(monthKey));
  const totalSpent = monthExp.reduce((s,e) => s+Number(e.amount), 0);
  const pct        = budget>0 ? Math.min((totalSpent/budget)*100,100) : 0;
  const barColor   = pct>=100 ? T.danger : pct>=80 ? T.warning : T.success;
  const unsettled  = borrows.filter(b => !b.settled);
  const totalLent       = unsettled.filter(b=>b.type==="lent").reduce((s,b)=>s+b.amount,0);
  const totalBorrowed   = unsettled.filter(b=>b.type==="borrowed").reduce((s,b)=>s+b.amount,0);
  const totalToReceive  = unsettled.filter(b=>b.type==="to_receive").reduce((s,b)=>s+b.amount,0);
  const catData = CATEGORIES
    .map(c => ({ cat:c, total:monthExp.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0) }))
    .filter(c => c.total>0).sort((a,b)=>b.total-a.total);

  // Handlers
  const addExpense = useCallback((data) => {
    setExpenses(p => [{ id:Date.now(), ...data }, ...p]);
    setShowAddExp(false); showToast("Expense added!");
  }, []);

  const addBorrow = useCallback((data) => {
    setBorrows(p => [{ id:Date.now(), ...data, settled:false }, ...p]);
    setShowAddBorrow(false); showToast("Entry added!");
  }, []);

  const addRecurring = useCallback((data) => {
    setRecurrings(p => [{ id:Date.now(), ...data }, ...p]);
    setShowAddRecurring(false); showToast("Recurring added!");
  }, []);

  const saveBudget = useCallback((amount) => {
    setBudgets(p => ({ ...p, [monthKey]: amount }));
    showToast("Budget saved!");
  }, [monthKey]);

  const exportCSV = useCallback(() => {
    const rows = [["Date","Category","Note","Amount"], ...expenses.map(e=>[e.date,e.category,e.note||"",e.amount])];
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n"));
    a.download = "expenses.csv"; a.click();
    showToast("CSV exported!");
  }, [expenses]);

  const handleNavTab = (id) => {
    if (id === "more") { setShowMore(v => !v); return; }
    setTab(id); setShowMore(false);
  };

  return (
    <div style={{ fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column" }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: ${T.textMuted}; }
        select option { background: ${T.card}; color: ${T.text}; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius:99px; }
      `}</style>

      <InstallBanner isInstallable={isInstallable} isInstalled={isInstalled} onInstall={promptInstall} T={T} />

      <Header themeKey={themeKey} setThemeKey={setThemeKey} T={T}
        onInstallClick={promptInstall} isInstalled={isInstalled} />

      <Toast toast={toast} T={T} />

      {/* More drawer */}
      {showMore && (
        <div style={{ position:"fixed", bottom:65, left:0, right:0, zIndex:150, padding:"0 12px 8px" }}>
          <div style={{ background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16,
            padding:"8px", boxShadow:"0 -4px 24px rgba(0,0,0,0.15)", display:"flex", gap:8 }}>
            {[{id:"charts",icon:"ti-chart-bar",label:"Charts"},{id:"recurring",icon:"ti-refresh",label:"Recurring"}].map(t => (
              <button key={t.id} onClick={()=>{setTab(t.id);setShowMore(false);}}
                style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                  padding:"10px 8px", borderRadius:10,
                  border:`1px solid ${tab===t.id ? T.accent : T.cardBorder}`,
                  background: tab===t.id ? T.accent+"18" : "transparent", cursor:"pointer" }}>
                <i className={`ti ${t.icon}`} style={{ fontSize:20, color:tab===t.id ? T.accent : T.textMuted }} />
                <span style={{ fontSize:11, color:tab===t.id ? T.accent : T.textMuted, fontWeight:tab===t.id?600:400 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 12px", paddingBottom:80 }}>
        {tab==="dashboard" && (
          <Dashboard T={T} monthExp={monthExp} totalSpent={totalSpent}
            budget={budget} pct={pct} barColor={barColor}
            totalLent={totalLent} totalBorrowed={totalBorrowed} totalToReceive={totalToReceive}
            catData={catData} onAddExpense={()=>setShowAddExp(true)} onNavigate={setTab} />
        )}
        {tab==="expenses" && (
          <Expenses expenses={expenses} onDelete={id=>setExpenses(p=>p.filter(e=>e.id!==id))}
            onExport={exportCSV} T={T} />
        )}
        {tab==="borrows" && (
          <Borrows borrows={borrows}
            onSettle={id=>setBorrows(p=>p.map(b=>b.id===id?{...b,settled:true}:b))}
            onDelete={id=>setBorrows(p=>p.filter(b=>b.id!==id))}
            onAdd={()=>setShowAddBorrow(true)} T={T} />
        )}
        {tab==="budget" && (
          <Budget budgets={budgets} expenses={expenses} onSave={saveBudget} T={T} />
        )}
        {tab==="charts" && <Charts expenses={expenses} T={T} />}
        {tab==="recurring" && (
          <Recurring recurrings={recurrings}
            onDelete={id=>setRecurrings(p=>p.filter(r=>r.id!==id))}
            onAdd={()=>setShowAddRecurring(true)} T={T} />
        )}
      </div>

      <BottomNav tab={tab} showMore={showMore} onTabClick={handleNavTab} T={T} />

      {/* Modals — components defined outside App, state isolated in form components */}
      <Modal show={showAddExp} onClose={()=>setShowAddExp(false)} title="Add Expense" T={T}>
        <AddExpenseForm onSubmit={addExpense} T={T} />
      </Modal>

      <Modal show={showAddBorrow} onClose={()=>setShowAddBorrow(false)} title="Log Borrow / Lend" T={T}>
        <AddBorrowForm onSubmit={addBorrow} T={T} />
      </Modal>

      <Modal show={showAddRecurring} onClose={()=>setShowAddRecurring(false)} title="Add Recurring Expense" T={T}>
        <AddRecurringForm onSubmit={addRecurring} T={T} />
      </Modal>
    </div>
  );
}