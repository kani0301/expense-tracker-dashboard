import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  Trash2, 
  Edit3, 
  X, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types.js';

export const TransactionsView: React.FC = () => {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useAppState();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Add/Edit transaction states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formDesc, setFormDesc] = useState('');

  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Bills', 'Rent', 'Investment', 'Other'];

  const handleOpenAdd = (type: 'income' | 'expense') => {
    setFormType(type);
    setFormTitle('');
    setFormAmount('');
    setFormCategory(type === 'income' ? 'Investment' : 'Food');
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormDesc('');
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setEditingId(t.transaction_id);
    setFormType(t.type);
    setFormTitle(t.title);
    setFormAmount(t.amount.toString());
    setFormCategory(t.category);
    setFormDate(t.date);
    setFormDesc(t.description || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount || parseFloat(formAmount) <= 0) return;

    const payload = {
      title: formTitle.trim(),
      amount: parseFloat(formAmount),
      category: formCategory,
      type: formType,
      date: formDate,
      description: formDesc.trim() || undefined
    };

    let success = false;
    if (editingId) {
      success = await editTransaction(editingId, payload);
    } else {
      success = await addTransaction(payload);
    }

    if (success) {
      setShowModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you absolute sure you want to delete this transaction from the ledger? This action cannot be reversed.')) {
      await deleteTransaction(id);
    }
  };

  // MULTI-STAGE QUERY MATRIX FILTERING & SORTING
  const filtered = transactions.filter(t => {
    // 1. Text Search query
    const matchText = t.title.toLowerCase().includes(search.toLowerCase()) || 
                      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    
    // 2. Type matches
    const matchType = typeFilter === 'all' || t.type === typeFilter;

    // 3. Category match
    const matchCat = categoryFilter === 'all' || t.category.toLowerCase() === categoryFilter.toLowerCase();

    // 4. Date ranges
    const matchStart = !dateRange.start || t.date >= dateRange.start;
    const matchEnd = !dateRange.end || t.date <= dateRange.end;

    return matchText && matchType && matchCat && matchStart && matchEnd;
  }).sort((a,b) => {
    let comp = 0;
    if (sortField === 'date') {
      comp = a.date.localeCompare(b.date);
    } else if (sortField === 'amount') {
      comp = a.amount - b.amount;
    }
    return sortOrder === 'asc' ? comp : -comp;
  });

  // Pages
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const pagedTransactions = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white animate-fade-in">
            Ledger Audit Center
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Check audit histories, apply precise filters, and deposit operational funds.
          </p>
        </div>

        {/* CORE FUNDING INJECTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('income')}
            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all font-sans"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => handleOpenAdd('expense')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-white/10 shadow-lg cursor-pointer active:scale-95 transition-all font-sans"
          >
            <Plus className="w-4.5 h-4.5 text-emerald-450" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            id="ledger-search"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search memo or invoice code..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-emerald-550/50 transition-all font-sans"
          />
        </div>

        {/* Date Filters */}
        <div className="md:col-span-4 flex items-center gap-2.5 pb-1 md:pb-0">
          <div className="flex-1 relative">
            <input
              id="date-start"
              type="date"
              value={dateRange.start}
              onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none font-sans"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">To</span>
          <div className="flex-1 relative">
            <input
              id="date-end"
              type="date"
              value={dateRange.end}
              onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none font-sans"
            />
          </div>
        </div>

        {/* Type selects */}
        <div className="md:col-span-2">
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
            className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none font-sans"
          >
            <option value="all" className="bg-[#0b101c]">All Types</option>
            <option value="income" className="bg-[#0b101c]">Incomes Audits</option>
            <option value="expense" className="bg-[#0b101c]">Expenses Audits</option>
          </select>
        </div>

        {/* Category select */}
        <div className="md:col-span-2">
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none font-sans"
          >
            <option value="all" className="bg-[#0b101c]">All Sectors</option>
            {categories.map(c => (
              <option key={c} value={c} className="bg-[#0b101c]">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* REACTION DATA TABLE CARD */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto animate-fade-in">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-4 pl-4">Invoiced Detail</th>
                <th 
                  className="py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date Timeline</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-450" />
                  </div>
                </th>
                <th className="py-4">Sector</th>
                <th 
                  className="py-4 cursor-pointer hover:text-white transition-colors text-right pr-4"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Valuation</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-455" />
                  </div>
                </th>
                <th className="py-4 pr-4 text-center">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pagedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-sans">
                    No corresponding invoices matched query parameters.
                  </td>
                </tr>
              ) : (
                pagedTransactions.map((t) => (
                  <tr key={t.transaction_id} className="hover:bg-white/5 transition-all font-sans">
                    <td className="py-3.5 pl-4 max-w-xs truncate">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${
                          t.type === 'income' 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                        }`}>
                          {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-semibold text-white truncate">{t.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.description || 'No custom memo'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-slate-400 font-mono">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono bg-white/5 border border-white/5 text-slate-200">
                        {t.category}
                      </span>
                    </td>
                    <td className={`py-3.5 text-right pr-4 text-xs font-semibold ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.transaction_id)}
                          className="p-1 text-slate-400 hover:text-rose-455 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGING FOOTER CONTROL */}
        <div className="p-4 bg-white/2 border-t border-white/10 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-mono">
            Showing {filtered.length === 0 ? 0 : (page - 1) * itemsPerPage + 1} - {Math.min(filtered.length, page * itemsPerPage)} of {filtered.length} records
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 text-slate-350 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg disabled:opacity-30 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-xs font-bold text-slate-300 px-3 py-1 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 text-slate-350 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg disabled:opacity-30 cursor-pointer transition-all"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LEDGER INJECTIONS MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b101c]/95 backdrop-blur-xl border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white font-display text-lg">
                  {editingId ? 'Edit Ledger Invoice' : `Add New ${formType === 'income' ? 'Income' : 'Expense'}`}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form type switcher (only if creating new) */}
              {!editingId && (
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/10 mb-5">
                  <button
                    type="button"
                    onClick={() => { setFormType('expense'); setFormCategory('Food'); }}
                    className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      formType === 'expense'
                        ? 'bg-white/10 border border-white/10 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('income'); setFormCategory('Investment'); }}
                    className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      formType === 'income'
                        ? 'bg-white/10 border border-white/10 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Income
                  </button>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label htmlFor="form-title" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Invoice Title</label>
                  <input
                    id="form-title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Whole Foods Pantry"
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition-all font-sans"
                  />
                </div>

                {/* Amount & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="form-amount" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Amount ($)</label>
                    <input
                      id="form-amount"
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="form-category" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sector Category</label>
                    <select
                      id="form-category"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none font-sans"
                    >
                      {categories.map(c => (
                        <option key={c} value={c} className="bg-[#0b101c]">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label htmlFor="form-date" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Settlement Date</label>
                  <input
                    id="form-date"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none font-sans"
                  />
                </div>

                {/* Description memo */}
                <div className="space-y-1">
                  <label htmlFor="form-desc" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Memo Note (Optional)</label>
                  <textarea
                    id="form-desc"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Short description..."
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition-all font-sans"
                  />
                </div>

                {/* Save button */}
                <button
                  id="form-save-btn"
                  type="submit"
                  className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center cursor-pointer font-sans border border-emerald-500/30"
                >
                  Save Transaction Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
