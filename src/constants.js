export const CATEGORIES = ["Food","Transport","Bills","Shopping","Health","Entertainment","Other"];

export const CAT_ICONS = {
  Food: "ti-salad", Transport: "ti-car", Bills: "ti-file-invoice",
  Shopping: "ti-shopping-cart", Health: "ti-heart-rate-monitor",
  Entertainment: "ti-device-tv", Other: "ti-dots"
};

export const CAT_COLORS = {
  Food: "#3b82f6", Transport: "#0ea5e9", Bills: "#6366f1",
  Shopping: "#8b5cf6", Health: "#22c55e", Entertainment: "#14b8a6", Other: "#94a3b8"
};

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const NAV_TABS = [
  { id: "dashboard", icon: "ti-layout-dashboard", label: "Home" },
  { id: "expenses",  icon: "ti-receipt",           label: "Expenses" },
  { id: "borrows",   icon: "ti-arrows-exchange",   label: "Borrow" },
  { id: "budget",    icon: "ti-target",            label: "Budget" },
  { id: "more",      icon: "ti-dots",              label: "More" },
];

export const MORE_TABS = [
  { id: "charts",    icon: "ti-chart-bar", label: "Charts" },
  { id: "recurring", icon: "ti-refresh",  label: "Recurring" },
];

export const getMonthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const fmtINR = n => `₹${Number(n).toLocaleString("en-IN")}`;

export const today = () => new Date().toISOString().split("T")[0];