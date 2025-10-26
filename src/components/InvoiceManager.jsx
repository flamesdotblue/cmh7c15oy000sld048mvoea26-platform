import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Printer, Mail, DollarSign, Calendar } from 'lucide-react';

export default function InvoiceManager({ invoices, onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [successBurst, setSuccessBurst] = useState(false);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (inv) => {
    setEditing(inv);
    setOpen(true);
  };

  const sorted = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [invoices]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Invoices</h2>
          <p className="text-slate-500 text-sm">Create, manage, and track invoices</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white shadow hover:shadow-md">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>#</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th className="text-right">Subtotal</Th>
              <Th className="text-right">Tax</Th>
              <Th className="text-right">Total</Th>
              <Th className="text-right">Due</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-10 text-slate-500">No invoices yet. Create your first invoice.</td>
              </tr>
            )}
            {sorted.map((inv) => (
              <tr key={inv.id} className="border-t">
                <Td>{inv.number}</Td>
                <Td>{formatDate(inv.date)}</Td>
                <Td>
                  <div className="font-medium">{inv.customer?.name}</div>
                  <div className="text-xs text-slate-500">{inv.customer?.gstin || 'No GSTIN'}</div>
                </Td>
                <Td>
                  <StatusBadge status={computeStatus(inv)} dueDate={inv.dueDate} />
                </Td>
                <Td className="text-right">{money(inv.subtotal)}</Td>
                <Td className="text-right">{money(inv.taxTotal)}</Td>
                <Td className="text-right">{money(inv.total)}</Td>
                <Td className="text-right">{money(Math.max(inv.total - (inv.amountPaid || 0), 0))}</Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <IconBtn title="Print / Save PDF" onClick={() => window.print()} icon={Printer} />
                    <a
                      title="Share via email"
                      href={`mailto:?subject=Invoice%20${encodeURIComponent(inv.number)}&body=${encodeURIComponent('Please find the invoice details below: ' + window.location.href)}`}
                      className="p-2 rounded-md border hover:bg-slate-50 text-slate-600"
                    >
                      <Mail size={16} />
                    </a>
                    <IconBtn title="Edit" onClick={() => openEdit(inv)} icon={Edit} />
                    <IconBtn title="Delete" onClick={() => onDelete(inv.id)} icon={Trash2} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>{successBurst && <SuccessBurst onDone={() => setSuccessBurst(false)} />}</AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border overflow-hidden">
              <div className="p-4 sm:p-6 flex items-center justify-between border-b">
                <div>
                  <h3 className="text-lg font-semibold">{editing ? 'Edit Invoice' : 'New Invoice'}</h3>
                  <p className="text-slate-500 text-sm">Add customer details, items, discounts, and taxes</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-700">Close</button>
              </div>
              <InvoiceForm
                initial={editing}
                onCancel={() => setOpen(false)}
                onSave={(data) => {
                  if (editing) {
                    onUpdate(editing.id, data);
                  } else {
                    onAdd(data);
                  }
                  setOpen(false);
                  setEditing(null);
                  setSuccessBurst(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Th({ children, className = '' }) {
  return <th className={`text-left font-medium px-4 py-3 ${className}`}>{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function IconBtn({ onClick, icon: Icon, title }) {
  return (
    <button onClick={onClick} title={title} className="p-2 rounded-md border hover:bg-slate-50 text-slate-600">
      <Icon size={16} />
    </button>
  );
}

function StatusBadge({ status, dueDate }) {
  const map = {
    Draft: 'bg-slate-100 text-slate-700',
    Sent: 'bg-blue-100 text-blue-700',
    Paid: 'bg-emerald-100 text-emerald-700',
    Overdue: 'bg-red-100 text-red-700',
  };
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-slate-100'}`}>
      <span>{status}</span>
      {status !== 'Paid' && dueDate && (
        <span className="inline-flex items-center gap-1 text-[10px] ml-1">
          <Calendar size={10} /> {formatDate(dueDate)}
        </span>
      )}
    </div>
  );
}

function SuccessBurst({ onDone }) {
  return (
    <motion.div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], y: -120 - Math.random() * 120, x: (Math.random() - 0.5) * 240, rotate: Math.random() * 180, scale: [0.6, 1, 0.8] }}
          transition={{ duration: 1.2, delay: i * 0.03 }}
          onAnimationComplete={() => i === 15 && onDone()}
          className="absolute"
        >
          <div className="p-2 rounded-full bg-emerald-500 shadow-lg">
            <DollarSign className="text-white" size={16} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function InvoiceForm({ initial, onCancel, onSave }) {
  const [number, setNumber] = useState(initial?.number || generateInvoiceNumber());
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(initial?.dueDate || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10));
  const [status, setStatus] = useState(initial?.status || 'Draft');
  const [amountPaid, setAmountPaid] = useState(initial?.amountPaid || 0);
  const [customer, setCustomer] = useState(initial?.customer || { name: '', email: '', phone: '', gstin: '' });
  const [items, setItems] = useState(initial?.items || [emptyItem()]);

  const calc = useMemo(() => calculateTotals(items), [items]);

  const handleItemChange = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const data = {
      id: initial?.id || crypto.randomUUID(),
      number,
      date,
      dueDate,
      status,
      amountPaid: Number(amountPaid) || 0,
      customer,
      items,
      subtotal: calc.subtotal,
      taxTotal: calc.taxTotal,
      total: calc.total,
    };
    // Auto-status update
    const computed = computeStatus(data);
    onSave({ ...data, status: computed });
  };

  return (
    <div className="p-4 sm:p-6 grid gap-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Invoice #">
          <input className="input" value={number} onChange={(e) => setNumber(e.target.value)} />
        </Field>
        <Field label="Date">
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Due Date">
          <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Field label="Customer Name">
          <input className="input" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
        </Field>
        <Field label="Email">
          <input className="input" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input className="input" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
        </Field>
        <Field label="GSTIN">
          <input className="input" value={customer.gstin} onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })} />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Items</h4>
          <button onClick={addItem} className="text-sm px-3 py-1.5 rounded-md border hover:bg-slate-50 inline-flex items-center gap-2"><Plus size={14} /> Add Item</button>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>Description</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-right">Discount %</Th>
                <Th>Tax Type</Th>
                <Th className="text-right">CGST %</Th>
                <Th className="text-right">SGST %</Th>
                <Th className="text-right">IGST %</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <Td>
                    <input className="input" placeholder="Item name/desc" value={it.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} />
                  </Td>
                  <Td className="text-right">
                    <input type="number" min="0" className="input text-right" value={it.quantity} onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} />
                  </Td>
                  <Td className="text-right">
                    <input type="number" min="0" className="input text-right" value={it.price} onChange={(e) => handleItemChange(idx, 'price', Number(e.target.value))} />
                  </Td>
                  <Td className="text-right">
                    <input type="number" min="0" className="input text-right" value={it.discount || 0} onChange={(e) => handleItemChange(idx, 'discount', Number(e.target.value))} />
                  </Td>
                  <Td>
                    <select className="input" value={it.taxType} onChange={(e) => handleItemChange(idx, 'taxType', e.target.value)}>
                      <option value="CGST_SGST">CGST+SGST</option>
                      <option value="IGST">IGST</option>
                      <option value="NONE">None</option>
                    </select>
                  </Td>
                  <Td className="text-right">
                    <input type="number" min="0" className="input text-right" value={it.cgst || 0} onChange={(e) => handleItemChange(idx, 'cgst', Number(e.target.value))} />
                  </Td>
                  <Td className="text-right">
                    <input type="number" min="0" className="input text-right" value={it.sgst || 0} onChange={(e) => handleItemChange(idx, 'sgst', Number(e.target.value))} />
                  </Td>
                  <Td className="text-right">
                    <input type="number" min="0" className="input text-right" value={it.igst || 0} onChange={(e) => handleItemChange(idx, 'igst', Number(e.target.value))} />
                  </Td>
                  <Td>
                    <button className="p-2 rounded-md border hover:bg-slate-50 text-slate-600" onClick={() => removeItem(idx)}>
                      <Trash2 size={16} />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 items-end">
        <Field label="Status">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Draft</option>
            <option>Sent</option>
            <option>Paid</option>
          </select>
        </Field>
        <Field label="Amount Paid">
          <input type="number" className="input" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <div className="bg-slate-50 border rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
            <div className="text-slate-600">Subtotal</div>
            <div className="text-right font-medium">{money(calc.subtotal)}</div>
            <div className="text-slate-600">Tax</div>
            <div className="text-right font-medium">{money(calc.taxTotal)}</div>
            <div className="text-slate-600">Total</div>
            <div className="text-right font-semibold">{money(calc.total)}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-emerald-600 text-white shadow hover:shadow-md">Save Invoice</button>
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

function emptyItem() {
  return { description: '', quantity: 1, price: 0, discount: 0, taxType: 'CGST_SGST', cgst: 9, sgst: 9, igst: 0 };
}

function calculateTotals(items) {
  let subtotal = 0;
  let taxTotal = 0;
  for (const it of items) {
    const base = (Number(it.quantity) || 0) * (Number(it.price) || 0);
    const discountAmt = base * ((Number(it.discount) || 0) / 100);
    const lineSubtotal = Math.max(base - discountAmt, 0);
    let tax = 0;
    if (it.taxType === 'CGST_SGST') {
      tax = lineSubtotal * (((Number(it.cgst) || 0) + (Number(it.sgst) || 0)) / 100);
    } else if (it.taxType === 'IGST') {
      tax = lineSubtotal * ((Number(it.igst) || 0) / 100);
    }
    subtotal += lineSubtotal;
    taxTotal += tax;
  }
  const total = subtotal + taxTotal;
  return { subtotal, taxTotal, total };
}

function computeStatus(inv) {
  if ((inv.amountPaid || 0) >= (inv.total || 0)) return 'Paid';
  const today = new Date().setHours(0, 0, 0, 0);
  const due = new Date(inv.dueDate).setHours(0, 0, 0, 0);
  if (due < today) return 'Overdue';
  return inv.status || 'Draft';
}

function generateInvoiceNumber() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `INV-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(Math.random() * 900 + 100)}`;
}

function formatDate(d) {
  try {
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(d));
  } catch {
    return d;
  }
}

function money(v) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v) || 0);
  } catch {
    return `$${(Number(v) || 0).toFixed(2)}`;
  }
}
