import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Coins, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SavingsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppState();

  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('');
  const [formDate, setFormDate] = useState('');

  // Deposit adjust parameters
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTarget || !formDate) return;

    const success = await addGoal({
      goal_name: formName.trim(),
      target_amount: parseFloat(formTarget),
      current_amount: formCurrent ? parseFloat(formCurrent) : 0,
      target_date: formDate
    });

    if (success) {
      setShowAdd(false);
      setFormName('');
      setFormTarget('');
      setFormCurrent('');
      setFormDate('');
    }
  };

  const handleAdjustDeposit = async (gId: string, currentVal: number, targetVal: number) => {
    if (!adjustAmount || parseFloat(adjustAmount) <= 0) return;
    const addedVal = parseFloat(adjustAmount);
    const sumVal = Math.min(targetVal, currentVal + addedVal);

    const success = await updateGoal(gId, { current_amount: sumVal });
    if (success) {
      setAdjustingId(null);
      setAdjustAmount('');
    }
  };

  const handleDelete = async (gId: string) => {
    if (confirm('Delete this savings goal tracker card? Mapped balances will cease tracking.')) {
      await deleteGoal(gId);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Savings Goals
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Plan capital purchases, log deposits, and audit milestone velocity.
          </p>
        </div>

        <button
          id="add-goal-btn"
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 font-sans"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Setup Savings Target</span>
        </button>
      </div>

      {/* GOALS GRID */}
      {goals.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-3xl text-center shadow-xl max-w-xl mx-auto">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-emerald-405 mb-4">
            <PiggyBank className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white font-display">No Goals Setup</h3>
          <p className="text-xs text-slate-400 mt-2 font-sans max-w-sm mx-auto leading-relaxed">
            Create capital target trackers (Trips, Investment targets, Nest eggs) to start recording recursive deposits.
          </p>
          <button
            id="empty-add-goal-btn"
            onClick={() => setShowAdd(true)}
            className="mt-5 px-4.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#10b981] text-xs font-bold rounded-xl cursor-pointer transition-all font-sans"
          >
            Setup Savings Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
            const isCompleted = percent >= 100;

            return (
              <div 
                key={g.goal_id}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between hover:scale-[1.01] hover:bg-white/8 transition-all"
              >
                {/* Header title */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white font-display text-base leading-snug">{g.goal_name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                      Target: {new Date(g.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(g.goal_id)}
                    className="p-1.5 text-slate-400 hover:text-rose-450 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar and details */}
                <div className="my-5 space-y-2">
                  <div className="flex items-baseline justify-between text-xs font-sans">
                    <div>
                      <span className="text-[10px] text-slate-405 block font-mono">Deposited</span>
                      <span className="text-base font-bold text-white">${g.current_amount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-405 block font-mono">Boundary Target</span>
                      <span className="font-semibold text-slate-200">${g.target_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress sliding track */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-[#10b981] to-teal-400' : 'bg-amber-400'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono text-slate-450">Milestone velocity</span>
                    <span className={`text-xs font-bold font-mono ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>{percent}%</span>
                  </div>
                </div>

                {/* Micro deposit modifier action */}
                <div className="mt-2 pt-3 border-t border-white/10">
                  {isCompleted ? (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 font-sans">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                      <span>Target Goal Accomplished! 🎉</span>
                    </div>
                  ) : adjustingId === g.goal_id ? (
                    <div className="flex gap-1.5 items-center">
                      <input
                        id={`deposit-${g.goal_id}`}
                        type="number"
                        min="1"
                        placeholder="Amt ($)"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-24 px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleAdjustDeposit(g.goal_id, g.current_amount, g.target_amount)}
                        className="px-3 py-1.5 bg-[#10b981] text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setAdjustingId(null)}
                        className="p-1.5 text-slate-400 hover:text-rose-455 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAdjustingId(g.goal_id); setAdjustAmount(''); }}
                      className="w-full py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                    >
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span>Deposit Capital</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SETUP GOAL MODAL */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
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
                  Setup Savings Goal
                </h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Goal Name */}
                <div className="space-y-1">
                  <label htmlFor="goal-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Savings Objective Name</label>
                  <input
                    id="goal-name"
                    type="text"
                    required
                    placeholder="e.g. Europe Nest Egg, Crypto Fund"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition-all font-sans"
                  />
                </div>

                {/* Target Capital & Initial Capital */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="goal-target" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Target Capital ($)</label>
                    <input
                      id="goal-target"
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5000"
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="goal-initial" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Initial Deposit ($)</label>
                    <input
                      id="goal-initial"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formCurrent}
                      onChange={(e) => setFormCurrent(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Target Date */}
                <div className="space-y-1">
                  <label htmlFor="goal-date" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Target Date Timeline</label>
                  <input
                    id="goal-date"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none font-sans"
                  />
                </div>

                {/* Action button */}
                <button
                  id="form-goal-save-btn"
                  type="submit"
                  className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center cursor-pointer font-sans border border-emerald-500/30"
                >
                  Log Objective Tracker Card
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
