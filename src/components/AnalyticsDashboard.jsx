import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard({ invoices, expenses }) {
  const [range, setRange] = useState('12m');

  const data = useMemo(() => buildSeries(invoices, expenses, range), [invoices, expenses, range]);
  const totals = useMemo(() => {
    const revenue = invoices.reduce((a, i) => a + (i.total || 0), 0);
    const taxes = invoices.reduce((a, i) => a + (i.taxTotal || 0), 0);
    const exp = expenses.reduce((a, e) => a + (e.amount || 0), 0);
    return { revenue, taxes, expenses: exp, profit: revenue - exp };
  }, [invoices, expenses]);

  return (
    <section id="analytics" className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-slate-500 text-sm">Revenue, expenses, taxes, and profit</p>
        </div>
        <select className="input" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="6m">Last 6 months</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <KpiCard label="Revenue" value={totals.revenue} />
        <KpiCard label="Expenses" value={totals.expenses} />
        <KpiCard label="Tax Collected" value={totals.taxes} />
        <KpiCard label="Net Profit" value={totals.profit} accent="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded-xl p-4">
          <div className="text-slate-600 text-sm mb-2">Revenue vs Expenses</div>
          <AnimatedChart data={data} />
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-slate-600 text-sm mb-3">Tax Summary</div>
          <TaxSummary invoices={invoices} />
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, accent }) {
  const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value || 0);
  return (
    <div className={`p-4 rounded-xl bg-white border shadow-sm ${accent ? `ring-1 ring-${accent}-100` : ''}`}>
      <div className="text-slate-500 text-sm">{label}</div>
      <motion.div key={formatted} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-semibold">{formatted}</motion.div>
    </div>
  );
}

function AnimatedChart({ data }) {
  const width = 800;
  const height = 240;
  const padding = 36;
  const months = data.map((d) => d.label);
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.revenue, d.expenses)));

  const x = (i) => padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
  const y = (v) => height - padding - (v / maxVal) * (height - padding * 2);

  const revPath = pathFromSeries(data.map((d, i) => [x(i), y(d.revenue)]));
  const expPath = pathFromSeries(data.map((d, i) => [x(i), y(d.expenses)]));

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        <g>
          {data.map((d, i) => (
            <g key={d.label}>
              <line x1={x(i)} y1={height - padding} x2={x(i)} y2={height - padding + 6} stroke="#94a3b8" />
              <text x={x(i)} y={height - padding + 18} fontSize="10" textAnchor="middle" fill="#64748b">{months[i]}</text>
            </g>
          ))}
        </g>
        <g>
          <motion.path d={revPath} fill="none" stroke="#0ea5e9" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
          <motion.path d={expPath} fill="none" stroke="#ef4444" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />
          {data.map((d, i) => (
            <g key={i}>
              <motion.circle cx={x(i)} cy={y(d.revenue)} r={4} fill="#0ea5e9" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} />
              <motion.circle cx={x(i)} cy={y(d.expenses)} r={4} fill="#ef4444" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function TaxSummary({ invoices }) {
  const totals = useMemo(() => {
    let cgst = 0, sgst = 0, igst = 0;
    for (const inv of invoices) {
      for (const it of inv.items || []) {
        const base = (Number(it.quantity) || 0) * (Number(it.price) || 0);
        const discountAmt = base * ((Number(it.discount) || 0) / 100);
        const lineSubtotal = Math.max(base - discountAmt, 0);
        if (it.taxType === 'CGST_SGST') {
          cgst += lineSubtotal * ((Number(it.cgst) || 0) / 100);
          sgst += lineSubtotal * ((Number(it.sgst) || 0) / 100);
        } else if (it.taxType === 'IGST') {
          igst += lineSubtotal * ((Number(it.igst) || 0) / 100);
        }
      }
    }
    return { cgst, sgst, igst, total: cgst + sgst + igst };
  }, [invoices]);

  const Row = ({ name, value, color }) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-slate-600 text-sm">{name}</span>
      </div>
      <div className="text-sm font-medium">{currency(value)}</div>
    </div>
  );

  const progress = (value) => (totals.total ? Math.round((value / totals.total) * 100) : 0);

  return (
    <div>
      <Row name="CGST" value={totals.cgst} color="bg-blue-500" />
      <div className="h-2 bg-slate-100 rounded mb-2"><div className="h-2 bg-blue-500 rounded" style={{ width: `${progress(totals.cgst)}%` }} /></div>
      <Row name="SGST" value={totals.sgst} color="bg-emerald-500" />
      <div className="h-2 bg-slate-100 rounded mb-2"><div className="h-2 bg-emerald-500 rounded" style={{ width: `${progress(totals.sgst)}%` }} /></div>
      <Row name="IGST" value={totals.igst} color="bg-fuchsia-500" />
      <div className="h-2 bg-slate-100 rounded mb-2"><div className="h-2 bg-fuchsia-500 rounded" style={{ width: `${progress(totals.igst)}%` }} /></div>
      <div className="mt-3 text-right text-slate-500 text-sm">Total: <span className="font-semibold text-slate-800">{currency(totals.total)}</span></div>
    </div>
  );
}

function currency(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(v || 0);
}

function buildSeries(invoices, expenses, range) {
  const monthsBack = range === '6m' ? 6 : 12;
  const now = new Date();
  const labels = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${d.toLocaleString(undefined, { month: 'short' })} ${String(d.getFullYear()).slice(2)}`);
  }
  const sumByKey = (list, getDate, getVal) => {
    const map = Object.fromEntries(labels.map((l) => [l, 0]));
    for (const item of list) {
      const d = new Date(getDate(item));
      const label = `${d.toLocaleString(undefined, { month: 'short' })} ${String(d.getFullYear()).slice(2)}`;
      if (label in map) map[label] += getVal(item);
    }
    return map;
  };
  const rmap = sumByKey(invoices, (i) => i.date, (i) => i.total || 0);
  const emap = sumByKey(expenses, (e) => e.date, (e) => e.amount || 0);

  return labels.map((l) => ({ label: l, revenue: rmap[l] || 0, expenses: emap[l] || 0 }));
}

function pathFromSeries(points) {
  if (!points.length) return '';
  return points.reduce((acc, [x, y], i) => (i === 0 ? `M ${x} ${y}` : acc + ` L ${x} ${y}`), '');
}
