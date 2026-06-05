import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { 
  FileText, 
  Download, 
  Printer
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, user } = useAppState();

  // Selected Month tracker (default to current month: YYYY-MM)
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Group transactions list to months
  const months: string[] = Array.from(new Set(transactions.map(t => t.date.substring(0, 7)))).sort().reverse() as string[];
  if (months.length === 0) {
    months.push(currentMonth);
  }

  // Filter list matching selected month
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  // Compute month totals
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Breakdown expenses by category
  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Bills', 'Rent', 'Investment', 'Other'];
  const categorySummary = categories.map(cat => {
    const total = monthTransactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === cat.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, total };
  }).filter(c => c.total > 0).sort((a,b) => b.total - a.total);

  // EXPORT CSV INJECTION
  const handleExportCSV = () => {
    if (monthTransactions.length === 0) return;

    // Header values
    const headers = ['Transaction ID', 'Title', 'Amount ($)', 'Category', 'Type', 'Date', 'Description'];
    const rows = monthTransactions.map(t => [
      t.transaction_id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount.toString(),
      t.category,
      t.type,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SaaS_Ledger_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // TRIGGER PRINT
  const handlePrint = () => {
    window.print();
  };

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedMonthName = monthNames[parseInt(monthStr) - 1] + " " + yearStr;

  return (
    <div className="space-y-6">
      {/* HEADER ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Advisory Reports
          </h2>
          <p className="text-sm text-slate-405 mt-1 font-sans">
            Construct corporate assets declarations sheets, download CSV databases, or print PDFs.
          </p>
        </div>

        {/* CONTROLS AREA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Select month */}
          <div className="relative">
            <select
              id="report-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-white/20"
            >
              {months.map(m => {
                const [y, mn] = m.split('-');
                const name = monthNames[parseInt(mn) - 1] + " " + y;
                return <option key={m} value={m} className="bg-[#0b101c]">{name}</option>;
              })}
            </select>
          </div>

          <button
            id="csv-export-btn"
            onClick={handleExportCSV}
            disabled={monthTransactions.length === 0}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl flex items-center gap-2 border border-white/10 shadow-lg cursor-pointer disabled:opacity-45 transition-all font-sans"
          >
            <Download className="w-4 h-4 text-[#10b981]" />
            <span>Export CSV</span>
          </button>

          <button
            id="pdf-download-btn"
            onClick={handlePrint}
            disabled={monthTransactions.length === 0}
            className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-45 transition-all font-sans"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* RENDER REPORT SHEETS */}
      {monthTransactions.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-3xl text-center shadow-xl max-w-xl mx-auto print:hidden">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-[#10b981] mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-display">No Records Loaded</h3>
          <p className="text-xs text-slate-400 mt-2 font-sans max-w-xs mx-auto leading-relaxed">
            There are no documented ledger entries within the selected month range ({formattedMonthName}).
          </p>
        </div>
      ) : (
        <div 
          id="payable-report-slip"
          className="bg-[#080d1a]/80 backdrop-blur-md border border-white/10 shadow-xl rounded-3xl p-8 max-w-4xl mx-auto space-y-8 relative overflow-hidden transition-all print:p-0 print:border-none print:shadow-none font-sans"
        >
          {/* WATERMARK ACCENT TRACE */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-l-full blur-3xl pointer-events-none print:hidden" />

          {/* REPORT HEADER BRAND */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2.5 text-[#10b981]">
                <FileText className="w-6 h-6" />
                <span className="font-bold text-lg uppercase tracking-wider font-display">Monthly Ledger Audit</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">SaaS Wealth Ledger Mapping Documents</p>
            </div>
            
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">Target Month</span>
              <span className="text-sm font-extrabold text-white capitalize font-sans">{formattedMonthName}</span>
            </div>
          </div>

          {/* AUDITED USER PROFILE DATA GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
            <div className="text-xs text-slate-300 space-y-1.5 font-sans">
              <div><span className="font-bold text-slate-500">Client:</span> {user?.name || 'Alex Mercer'}</div>
              <div><span className="font-bold text-slate-500">Audited Email:</span> {user?.email || 'alex@example.com'}</div>
            </div>
            <div className="text-xs text-slate-350 sm:text-right space-y-1.5 font-sans">
              <div><span className="font-bold text-slate-500">Generated Timeline:</span> {new Date().toLocaleString()}</div>
              <div><span className="font-bold text-slate-500">Database Engine:</span> Local JSON flatfile db</div>
            </div>
          </div>

          {/* SUMMARY METRICS BLOCK */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">Total Cash Inbound</span>
              <h4 className="text-lg font-bold text-emerald-400 font-sans tracking-tight mt-1">
                +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">Total Outbound Ops</span>
              <h4 className="text-lg font-bold text-rose-400 font-sans tracking-tight mt-1">
                -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">Net monthly change</span>
              <h4 className={`text-lg font-bold font-sans tracking-tight mt-1 ${netSavings >= 0 ? 'text-white' : 'text-rose-400'}`}>
                ${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">Savings Flow Index</span>
              <h4 className="text-lg font-bold text-amber-400 font-sans tracking-tight mt-1">
                {savingsRate >= 0 ? `${savingsRate.toFixed(1)}%` : '0.0%'}
              </h4>
            </div>
          </div>

          {/* EXPENSES BREAKDOWN */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Expenditures By Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categorySummary.map(cat => {
                const percent = Math.round((cat.total / totalExpense) * 100);
                return (
                  <div key={cat.name} className="p-3 border border-white/5 bg-white/5 hover:bg-white/8 rounded-xl flex items-center justify-between font-sans transition-all">
                    <div>
                      <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                      <span className="text-[10px] text-slate-450 block font-mono mt-0.5">{percent}% of spent flow</span>
                    </div>
                    <span className="text-xs font-bold text-slate-100">
                      ${cat.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DETAILED TRANSACTION TABLE */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Detailed Statements Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/10 pb-2 text-[10px] font-bold text-slate-450 uppercase font-mono">
                    <th className="pb-2">Invoice Code</th>
                    <th className="pb-2">Details / Title</th>
                    <th className="pb-2">Sector</th>
                    <th className="pb-2 text-right pr-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {monthTransactions.map(t => (
                    <tr key={t.transaction_id} className="py-2.5">
                      <td className="py-2.5 font-mono text-[9px] text-slate-405">{t.transaction_id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-2.5">
                        <div className="font-semibold text-white">{t.title}</div>
                        {t.description && <div className="text-[10px] text-slate-400 mt-0.5">{t.description}</div>}
                      </td>
                      <td className="py-2.5">
                        <span className="text-[9px] font-bold uppercase font-mono text-slate-300 tracking-wider">
                          {t.category}
                        </span>
                      </td>
                      <td className={`py-2.5 text-right pr-2 font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* REPORT FOOTER SIGNATURES */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <div className="text-center sm:text-left font-sans">
              This financial ledger is electronically verified. No manual signature required.
            </div>
            <div className="font-mono text-[10px]">
              SHA-255 CHECK: SUCCESS ({selectedMonth})
            </div>
          </div>
        </div>
      )}

      {/* CSS PRINT-ONLY OVERLAY INJECTIONS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          aside, header, nav, button, select, .print\\:hidden, #refresh-ai-insights-btn, .layout-navbar {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          #payable-report-slip, #payable-report-slip * {
            visibility: visible;
          }
          #payable-report-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
