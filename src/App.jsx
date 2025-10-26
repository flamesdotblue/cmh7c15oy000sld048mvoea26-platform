import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Wallet, BarChart2 } from 'lucide-react';
import HeroCover from './components/HeroCover';
import InvoiceManager from './components/InvoiceManager';
import ExpenseManager from './components/ExpenseManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useLocalStorage('mvp_invoices', []);
  const [expenses, setExpenses] = useLocalStorage('mvp_expenses', []);

  // Derived financials
  const totals = useMemo(() => {
    const revenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const taxCollected = invoices.reduce((acc, inv) => acc + (inv.taxTotal || 0), 0);
    const expenseTotal = expenses.reduce((acc, ex) => acc + (Number(ex.amount) || 0), 0);
    const profit = revenue - expenseTotal;
    return { revenue, expenseTotal, taxCollected, profit };
  }, [invoices, expenses]);

  // Handlers to pass to components
  const addInvoice = (invoice) => {
    setInvoices((prev) => [{ ...invoice }, ...prev]);
  };
  const updateInvoice = (id, patch) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };
  const deleteInvoice = (id) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const addExpense = (expense) => {
    setExpenses((prev) => [{ ...expense }, ...prev]);
  };
  const updateExpense = (id, patch) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeroCover onCTAClick={() => setActiveTab('invoices')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200">
          <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Quick Stats</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <StatPill label="Revenue" value={totals.revenue} />
              <StatPill label="Expenses" value={totals.expenseTotal} />
              <StatPill label="Tax" value={totals.taxCollected} />
              <StatPill label="Profit" value={totals.profit} positive />
            </div>
          </div>

          <div className="px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto">
              <TabButton icon={Receipt} active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')}>Invoices</TabButton>
              <TabButton icon={Wallet} active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')}>Expenses</TabButton>
              <TabButton icon={BarChart2} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>Analytics</TabButton>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'invoices' && (
                <motion.div key="invoices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <InvoiceManager
                    invoices={invoices}
                    onAdd={addInvoice}
                    onUpdate={updateInvoice}
                    onDelete={deleteInvoice}
                  />
                </motion.div>
              )}
              {activeTab === 'expenses' && (
                <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <ExpenseManager
                    expenses={expenses}
                    onAdd={addExpense}
                    onUpdate={updateExpense}
                    onDelete={deleteExpense}
                  />
                </motion.div>
              )}
              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AnalyticsDashboard invoices={invoices} expenses={expenses} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-center text-slate-500">
        Built for a delightful billing MVP experience
      </footer>
    </div>
  );
}

function TabButton({ icon: Icon, active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${
        active
          ? 'bg-slate-900 text-white border-slate-900 shadow'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
      }`}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}

function StatPill({ label, value, positive }) {
  const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value || 0);
  return (
    <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm flex items-center gap-2">
      <span className="text-slate-500">{label}:</span>
      <motion.span
        key={formatted}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        className={positive ? 'text-emerald-600 font-semibold' : 'text-slate-900 font-semibold'}
      >
        {formatted}
      </motion.span>
    </div>
  );
}
