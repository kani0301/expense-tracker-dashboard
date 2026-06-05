import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRight,
  Filter,
  Activity,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from '../types.js';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const { transactions, budgets, goals, insights, loadingInsights, user } = useAppState();

  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'week'>('month');

  // Helper date queries
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfCurrentMonth.setHours(0, 0, 0, 0);

  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - now.getDay());
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  // Filter transactions
  const filteredT = transactions.filter(t => {
    const tDate = new Date(t.date);
    if (dateFilter === 'month') return tDate >= startOfCurrentMonth;
    if (dateFilter === 'week') return tDate >= startOfCurrentWeek;
    return true;
  });

  // METRICS CALCULATIONS
  const totalIncome = filteredT
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredT
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // CATEGORY AGGREGATIONS FOR PIE/DONUT
  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Bills', 'Rent', 'Investment', 'Other'];
  
  const categoryColors: Record<string, string> = {
    Food: '#10B981', // emerald
    Travel: '#3B82F6', // blue
    Shopping: '#EC4899', // pink
    Entertainment: '#F59E0B', // amber
    Healthcare: '#EF4444', // red
    Education: '#8B5CF6', // purple
    Bills: '#6366F1', // indigo
    Rent: '#06B6D4', // cyan
    Investment: '#14B8A6', // teal
    Other: '#64748B' // slate
  };

  const categorySpending = categories.reduce((acc, cat) => {
    const amount = filteredT
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === cat.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    if (amount > 0) {
      acc.push({ name: cat, value: amount, color: categoryColors[cat] || '#CBD5E1' });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]).sort((a,b) => b.value - a.value);

  const totalExpenseAll = categorySpending.reduce((sum, c) => sum + c.value, 0);

  // WEEKLY ANALYSIS (Map Mon-Sun transaction density)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailySpending = weekdays.map((day, dIdx) => {
    const amount = filteredT
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date.getDay() === dIdx;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    return { day, amount };
  });
  const maxDailySpending = Math.max(...dailySpending.map(d => d.amount), 1);

  // DONUT GRAPH ARC SEGMENTS
  let accumulatedAngle = 0;
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = categorySpending.map((catSpec) => {
    const percent = totalExpenseAll > 0 ? catSpec.value / totalExpenseAll : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += percent * circumference;
    return {
      ...catSpec,
      strokeDasharray,
      strokeDashoffset,
      percent
    };
  });

  return (
    <div className="space-y-6">
      {/* HEADER ROW WITH QUICK FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Welcome Back, {user?.name || 'Authorized Client'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Track operational spendings and real-time ledger distributions with frosted glass analytics.
          </p>
        </div>

        {/* TIME CONTROLLER BUTTON CONTAINER */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl shadow-lg">
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              dateFilter === 'week'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-350 hover:bg-white/10'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              dateFilter === 'month'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-350 hover:bg-white/10'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-350 hover:bg-white/10'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* INTELLIGENT AI SPENDING HIGHLIGHT BAR */}
      <div 
        onClick={() => setCurrentTab('insights')}
        className="cursor-pointer bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl hover:border-emerald-500/50 hover:shadow-emerald-500/5 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-full bg-emerald-500/5 rounded-l-full blur-2xl group-hover:scale-110 transition-transform" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-450 rounded-xl text-white border border-emerald-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white font-display text-sm flex items-center gap-2">
              Gemini AI Wealth Guidance Active 
              {insights && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/25 text-emerald-300 rounded-full font-bold">
                  Score: {insights.healthScore}/100
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300 font-sans mt-0.5 line-clamp-2 md:line-clamp-1 pr-6">
              {loadingInsights 
                ? 'Regenerating latest spent audits...' 
                : insights?.overallAssessment || 'Check dynamic wealth metrics and customized recommendations to reduce wasteful outgoing operations.'}
            </p>
          </div>
        </div>
        <div className="flex items-center text-xs font-extrabold text-emerald-400 gap-1 flex-shrink-0 group-hover:translate-x-1.5 transition-transform z-10 font-sans">
          <span>Explore AI Insights</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: BALANCE */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/10 transition-all hover:scale-[1.01] hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Net Balance</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold font-sans tracking-tight ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${balance >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {balance >= 0 ? 'Liquid Surplus' : 'Aqueous Deficit'}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">For filtered days</span>
            </div>
          </div>
        </div>

        {/* CARD 2: INCOME */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/10 transition-all hover:scale-[1.01] hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Total Income</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white font-sans tracking-tight">
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400 font-sans">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Inbound transfers auditing complete</span>
            </div>
          </div>
        </div>

        {/* CARD 3: EXPENSES */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/10 transition-all hover:scale-[1.01] hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Total Expense</span>
            <TrendingDown className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white font-sans tracking-tight">
              ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400 font-sans">
              <ArrowDownLeft className="w-4 h-4 text-indigo-400" />
              <span>Matching filtered category allocations</span>
            </div>
          </div>
        </div>

        {/* CARD 4: SAVINGS SPEED */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/10 transition-all hover:scale-[1.01] hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Savings Rate</span>
            <PiggyBank className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white font-sans tracking-tight">
              {savingsRate >= 0 ? `${savingsRate.toFixed(1)}%` : '0.0%'}
            </h3>
            {/* SAVINGS RATE BAR */}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-md shadow-amber-500/20"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRAPHICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DONUT CATEGORY BREAKDOWN (7 columns) */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white font-display text-base">Expense Distributions</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Sectors distribution tracking chart</p>
            </div>
            <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[10px] font-bold text-slate-300 uppercase font-mono tracking-wider">Top spending sectors</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 py-2">
            {/* SVG DONUT CONTAINER */}
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
              {totalExpenseAll === 0 ? (
                <div className="absolute inset-0 rounded-full border-4 border-white/5 flex items-center justify-center p-3 text-center text-xs text-slate-400">
                  No Expense Records Loaded
                </div>
              ) : (
                <>
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                    <circle 
                      cx="80" 
                      cy="80" 
                      r={radius} 
                      fill="none" 
                      stroke="rgba(255, 255, 255, 0.04)" 
                      strokeWidth={strokeWidth} 
                    />
                    {donutSegments.map((seg, idx) => (
                      <circle
                         key={idx}
                         cx="80"
                         cy="80"
                         r={radius}
                         fill="none"
                         stroke={seg.color}
                         strokeWidth={strokeWidth}
                         strokeDasharray={seg.strokeDasharray}
                         strokeDashoffset={seg.strokeDashoffset}
                         strokeLinecap="round"
                         style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                       />
                    ))}
                  </svg>
                  {/* CENTRAL TEXT OVERLAY */}
                  <div className="absolute flex flex-col items-center justify-center bg-[#0d1222]/90 w-28 h-28 rounded-full shadow-inner border border-white/10 z-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Spent Sum</span>
                    <span className="text-lg font-bold text-white font-sans mt-0.5">
                      ${totalExpenseAll >= 1000 ? `${(totalExpenseAll / 1000).toFixed(1)}k` : totalExpenseAll.toFixed(0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* SECTORS MATRIX LEDGER */}
            <div className="flex-1 w-full space-y-2.5">
              {categorySpending.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Log expenses in transactions index to view custom visual charts.</p>
              ) : (
                categorySpending.slice(0, 5).map((seg, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 animate-ping-once" style={{ backgroundColor: seg.color }} />
                      <span className="font-semibold text-slate-200">{seg.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">
                        {((seg.value / totalExpenseAll) * 100).toFixed(0)}%
                      </span>
                      <span className="font-bold text-white">
                        ${seg.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {categorySpending.length > 5 && (
                <div className="text-right pt-1 pb-1">
                  <span className="text-[10px] italic text-slate-400 font-sans">
                    + {categorySpending.length - 5} more categories active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WEEKLY ACTIVITY LEVEL CURVE (5 columns) */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white font-display text-base">Weekly Activity Curve</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Distribution of spends across calendar days</p>
          </div>

          <div className="flex items-end justify-between h-36 gap-2 pt-6">
            {dailySpending.map((item, idx) => {
              const hPercent = (item.amount / maxDailySpending) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  {/* SPEED PIN TOOLTIP */}
                  <div className="relative group w-full flex justify-center">
                    <div className="absolute -top-8 px-1.5 py-0.5 bg-slate-950 text-white text-[9px] font-mono rounded border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      ${item.amount.toFixed(0)}
                    </div>
                    <div 
                      className="w-3.5 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer h-24 flex items-end justify-center overflow-hidden border border-white/5"
                    >
                      <div 
                        className="bg-gradient-to-t from-indigo-500 to-teal-400 w-full rounded-full transition-all duration-500"
                        style={{ height: `${hPercent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS ROW LEDGER */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-white font-display text-base">Recent Ledger Operations</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Most recent income and expense invoices</p>
          </div>
          <button
            onClick={() => setCurrentTab('transactions')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-sans"
          >
            <span>Auditing Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">
                <th className="pb-3.5 pl-2">Details</th>
                <th className="pb-3.5">Category</th>
                <th className="pb-3.5">Date</th>
                <th className="pb-3.5 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-sans">
                    Log invoices inside Transactions section to pop ledger reports.
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 5).map((t) => (
                  <tr key={t.transaction_id} className="hover:bg-white/5 transition-all font-sans">
                    <td className="py-3 pl-2 max-w-[200px] truncate">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${
                          t.type === 'income' 
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        }`}>
                          {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-semibold text-white truncate">{t.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.description || 'No memo text'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold bg-white/5 text-slate-250 px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/5">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-400 font-mono">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className={`py-3 text-right pr-2 text-xs font-bold ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
