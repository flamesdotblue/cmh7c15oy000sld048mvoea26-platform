import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Upload } from 'lucide-react';

const CATEGORIES = ['Utilities', 'Rent', 'Salaries', 'Software', 'Travel', 'Misc'];

export default function ExpenseManager({ expenses, onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    return expenses.filter((e) => (filter === 'All' ? true : e.category === filter));
  }, [expenses, filter]);

  const totalByCategory = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) map[cat] = 0;
    for (const e of expenses) map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    return map;
  }, [expenses]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Expenses</h2>
          <p className="text-slate-500 text-sm">Track and categorize your spending</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white shadow hover:shadow-md">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="p-4 rounded-xl bg-white border shadow-sm">
            <div className="text-slate-500 text-sm">{cat}</div>
            <div className="text-xl font-semibold mt-1">{money(totalByCategory[cat] || 0)}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-slate-500">No expenses in this category.</motion.div>
          )}
        </AnimatePresence>
        {filtered.map((e) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-white border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{e.title} <span className="text-slate-400">• {e.category}</span></div>
              <div className="text-slate-500 text-sm">{formatDate(e.date)}</div>
              {e.receipt && (
                <a href={e.receipt} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">View receipt</a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right mr-2 font-semibold">{money(e.amount)}</div>
              <button onClick={() => { setEditing(e); setOpen(true); }} className="p-2 rounded-md border hover:bg-slate-50 text-slate-600">
                <Edit size={16} />
              </button>
              <button onClick={() => onDelete(e.id)} className="p-2 rounded-md border hover:bg-slate-50 text-slate-600">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden">
            <div className="p-4 sm:p-6 flex items-center justify-between border-b">
              <div>
                <h3 className="text-lg font-semibold">{editing ? 'Edit Expense' : 'New Expense'}</h3>
                <p className="text-slate-500 text-sm">Attach receipts and categorize</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>
            <ExpenseForm
              initial={editing}
              onCancel={() => setOpen(false)}
              onSave={(data) => {
                if (editing) onUpdate(editing.id, data); else onAdd(data);
                setOpen(false);
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ExpenseForm({ initial, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState(initial?.amount || 0);
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(initial?.category || 'Utilities');
  const [receipt, setReceipt] = useState(initial?.receipt || '');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setReceipt(url);
  };

  const submit = () => {
    const payload = { id: initial?.id || crypto.randomUUID(), title, amount: Number(amount) || 0, date, category, receipt };
    onSave(payload);
  };

  return (
    <div className="p-4 sm:p-6 grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Amount"><input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Date"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Category">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Receipt">
          <label className="input flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            <span>Upload image</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </Field>
      </div>
      {receipt && (
        <div className="rounded-lg border p-2">
          <img src={receipt} alt="Receipt" className="max-h-48 object-contain mx-auto" />
        </div>
      )}
      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border">Cancel</button>
        <button onClick={submit} className="px-4 py-2 rounded-lg bg-slate-900 text-white shadow hover:shadow-md">Save Expense</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function money(v) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v) || 0);
  } catch {
    return `$${(Number(v) || 0).toFixed(2)}`;
  }
}

function formatDate(d) {
  try {
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(d));
  } catch {
    return d;
  }
}
