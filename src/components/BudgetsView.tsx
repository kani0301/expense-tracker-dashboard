import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { 
  Percent, 
  Trash2, 
  AlertTriangle, 
  Sliders, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BudgetsView: React.FC = () => {
  const { transactions, budgets, saveBudget, deleteBudget, notifications } = useAppState();

  const [showAdd, setShowAdd] = useState(false);
  const [formCategory, setFormCategory] = useState('Food');
  const [formLimit, setFormLimit] = useState('');

  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Bills', 'Rent', 'Investment', 'Other'];

  // Current month prefix (YYYY-MM)
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  // Computes active actual spendings per category for the current month
  const actualCategorySpending = categories.reduce((acc, cat) => {
    const total = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === cat.toLowerCase() && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
    acc[cat.toLowerCase()] = total;
    return acc;
  }, {} as Record<string, number>);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLimit || parseFloat(formLimit) <= 0) return;

    const success = await saveBudget(formCategory, parseFloat(formLimit));
    if (success) {
      setShowAdd(false);
      setFormLimit('');
    }
  };

  const handleDelete = async (category: string) => {
    if (confirm(`Remove the monthly budget limit for "${category}"?`)) {
      await deleteBudget(category);
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-[#ef4444]';
    if (percent >= 80) return 'bg-[#f59e0b]';
    return 'bg-[#10b981]';
  };

  const getProgressBgColor = (percent: number) => {
    if (percent >= 100) return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
    if (percent >= 80) return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
  };

  const getTextProgressColor = (percent: number) => {
    if (percent >= 100) return 'text-rose-400';
    if (percent >= 80) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white animate-fade-in">
            Budgets Mapping
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Map financial guidelines and monitor real-time monthly outgoings.
          </p>
        </div>

        <button
          id="add-budget-btn"
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 font-sans"
        >
          <Sliders className="w-4.5 h-4.5" />
          <span>Configure Budget Target</span>
        </button>
      </div>

      {/* REACTION SYSTEM ALERTS FOR OVER BUDGETS */}
      {notifications.some(n => n.type === 'warning' && !n.read) && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3.5 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300 font-display">
              Budget Boundaries Warning!
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 font-sans">
              One or more spend parameters have breached mapped thresholds. Review targets or reduce card usage immediately.
            </p>
          </div>
        </div>
      )}

      {/* BUDGET CARDS GRID */}
      {budgets.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-3xl text-center shadow-xl max-w-xl mx-auto">
          <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto text-emerald-405 mb-4">
            <Percent className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white font-display">No Budgets Mapped</h3>
          <p className="text-xs text-slate-400 mt-2 font-sans max-w-sm mx-auto leading-relaxed">
            Configure monthly boundaries to enable live monitoring dashboards and lock in high financial scores.
          </p>
          <button
            id="empty-add-budget-btn"
            onClick={() => setShowAdd(true)}
            className="mt-5 px-4.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#10b981] text-xs font-bold rounded-xl cursor-pointer transition-all font-sans"
          >
            Create Your First Budget Threshold
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const actual = actualCategorySpending[b.category.toLowerCase()] || 0;
            const percent = Math.min(100, Math.round((actual / b.limit_amount) * 100));
            const activeThresholdBg = getProgressBgColor(percent);

            return (
              <div 
                key={b.category}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between hover:scale-[1.01] hover:bg-white/8 transition-all relative overflow-hidden"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">Category</span>
                    <h3 className="font-bold text-white font-display text-base mt-0.5">{b.category}</h3>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(b.category)}
                    className="p-1.5 text-slate-400 hover:text-rose-455 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress metrics */}
                <div className="my-5 space-y-2">
                  <div className="flex justify-between items-end text-xs font-sans">
                    <div>
                      <span className="text-[10px] text-slate-455 block font-mono">Spent This Month</span>
                      <span className="text-base font-bold text-white">${actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-455 block font-mono">Mapped boundary</span>
                      <span className="font-semibold text-slate-200">${b.limit_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>

                  {/* Progress gauge bar */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Warning/Status note */}
                  <div className={`p-2.5 rounded-xl border text-[11px] font-medium font-sans flex items-center justify-between mt-3 ${activeThresholdBg}`}>
                    <span className="flex items-center gap-1.5">
                      {percent >= 100 ? (
                        <>🎚️ Spent Exceeded</>
                      ) : percent >= 80 ? (
                        <>🎛️ Approaching Limit</>
                      ) : (
                        <>🧼 Budget Safe</>
                      )}
                    </span>
                    <span className={`font-mono font-bold ${getTextProgressColor(percent)}`}>{percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIGURE MODAL */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b101c]/95 backdrop-blur-xl border border-white/20 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white font-display text-lg">
                  Map Category Budget
                </h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Category select */}
                <div className="space-y-1">
                  <label htmlFor="form-budget-cat" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Finance Sector</label>
                  <select
                    id="form-budget-cat"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none font-sans"
                  >
                    {categories.map(c => (
                      <option key={c} value={c} className="bg-[#0b101c]">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Limit Amount */}
                <div className="space-y-1">
                  <label htmlFor="form-budget-limit" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Monthly Outgoing Boundary ($)</label>
                  <input
                    id="form-budget-limit"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 500"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition-all font-sans"
                  />
                </div>

                {/* Submit */}
                <button
                  id="form-budget-save-btn"
                  type="submit"
                  className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center cursor-pointer font-sans border border-emerald-500/30"
                >
                  Confirm Budget Boundary
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
