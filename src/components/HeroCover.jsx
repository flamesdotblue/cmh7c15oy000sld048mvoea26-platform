import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function HeroCover({ onCTAClick }) {
  return (
    <section className="relative h-[60vh] w-full">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/IKzHtP5ThSO83edK/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 flex items-center">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900"
          >
            Smart Billing, Expenses, and Analytics — Beautifully Crafted
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 text-slate-600 text-lg"
          >
            Create invoices, track expenses, manage taxes, and gain insights with delightful animations.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6 flex gap-3">
            <button onClick={onCTAClick} className="px-5 py-3 rounded-xl bg-slate-900 text-white shadow hover:shadow-md transition">
              + New Invoice
            </button>
            <a href="#analytics" className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition">
              View Analytics
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
