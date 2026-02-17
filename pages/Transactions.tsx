import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Sparkles, Search, Trash2, ArrowUpCircle, ArrowDownCircle, X, Calendar, AlertTriangle, PiggyBank, Filter, Check } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';
import MagicImportModal from '../components/MagicImportModal';

import { Link, useLocation } from 'react-router-dom';

const DEFAULT_CATEGORIES = ["Food", "Travel", "Shopping", "Entertainment", "Utilities", "Housing", "Health", "Education", "Other"];

const Transactions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  // Filter States
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [newTx, setNewTx] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category: 'Other',
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  });

  const fetchTx = () => {
    if (!user?.id) return;
    // We fetch ALL transactions and filter client-side for better UX responsiveness 
    // or build precise query strings if dataset is huge. 
    // For now, client-side filtering works best for < 1000 items.
    fetch(`${API_URL}/transactions?user_id=${user.id}`)
      .then(res => res.json())
      .then(setTransactions);
  };

  useEffect(() => { fetchTx(); }, [user]);

  // Handle incoming Magic Import data from Dashboard
  useEffect(() => {
    if (location.state?.magicData) {
      const data = location.state.magicData;
      setNewTx({
        description: data.description || 'Imported Transaction',
        amount: data.amount ? data.amount.toString() : '',
        type: data.type || 'Expense',
        category: data.category || 'Other',
        date: data.date || new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
      });
      setShowAddModal(true);
      // Clear state to prevent reopening on refresh (optional, but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const availableCategories = useMemo(() => {
    const txCats = transactions.map(t => t.category);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...txCats])).sort();
  }, [transactions]);

  // Derived filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.amount.toString().includes(search);
      const matchesCategory = filterCategory ? t.category === filterCategory : true;
      const matchesDate = filterDate ? t.date.startsWith(filterDate) : true;

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [transactions, search, filterCategory, filterDate]);

  useEffect(() => {
    if (!showAddModal) {
      setIsCustomCategory(false);
      if (!DEFAULT_CATEGORIES.includes(newTx.category) && newTx.category !== 'Other') {
        // Reset only if it was a weird transient state, but 'Other' is safe fallback
      }
    }
  }, [showAddModal]);

  const confirmDelete = async () => {
    if (deleteId === null) return;
    await fetch(`${API_URL}/transactions/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchTx();
  };

  const handleAdd = async () => {
    if (!user?.id) return;

    const amountVal = parseFloat(newTx.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!newTx.category.trim()) {
      alert("Please enter a category");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/transactions?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newTx.description || 'New Transaction',
          amount: amountVal,
          type: newTx.type,
          category: newTx.category,
          date: newTx.date
        })
      });

      if (!res.ok) throw new Error("Failed to save");

      setShowAddModal(false);
      // Reset form
      setNewTx({
        description: '',
        amount: '',
        type: 'Expense',
        category: 'Other',
        date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
      });
      fetchTx();
    } catch (e) {
      alert("Error saving transaction. Please check your inputs.");
      console.error(e);
    }
  };

  const handleMagicSuccess = (data: any) => {
    setNewTx({
      description: data.description || 'Imported Transaction',
      amount: data.amount ? data.amount.toString() : '',
      type: data.type || 'Expense',
      category: data.category || 'Other',
      date: data.date || new Date().toISOString().split('T')[0]
    });
    setShowAddModal(true); // Open Add Modal with pre-filled data
  };

  const renderTxIcon = (tx: Transaction) => {
    if (tx.category === 'Savings') return <PiggyBank className="w-5 h-5 text-indigo-500" />;
    return tx.type === 'Income'
      ? <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
      : <ArrowDownCircle className="w-5 h-5 text-red-500" />;
  };

  const renderTxAmount = (tx: Transaction) => {
    if (tx.category === 'Savings') {
      return (
        <span className="text-indigo-600 dark:text-indigo-400 font-bold font-display">
          {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(tx.amount)}
        </span>
      );
    }
    return (
      <span className={`font-bold font-display ${tx.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
        {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(tx.amount)}
      </span>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your daily expenses and income history.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <button
            id="tx-magic-btn"
            onClick={() => setShowMagicModal(true)}
            className="flex-1 md:flex-none justify-center flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Magic Import</span>
          </button>
          <button
            id="tx-add-btn"
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none justify-center flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add New</span>
          </button>
        </div>
      </div>

      {/* Main Card with Search & Filters */}
      <div className="glass-card overflow-visible !p-0 border border-slate-200 dark:border-slate-800">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col xl:flex-row gap-4 justify-between items-center relative z-20">

          {/* Search Bar */}
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by description or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
            />
          </div>

          {/* Filter Actions */}
          <div id="filter-bar" className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Categories</option>
              {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />

            {/* Clear Filters Button */}
            {(filterCategory || filterDate || search) && (
              <button
                onClick={() => { setFilterCategory(''); setFilterDate(''); setSearch(''); }}
                className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}


          </div>
        </div>

        {/* Mobile Card List View */}
        <div className="block md:hidden pb-4 px-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">No transactions found.</div>
          ) : (
            filteredTransactions.map(tx => (
              <div key={tx.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    {renderTxIcon(tx)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base max-w-[150px] truncate leading-tight">{tx.description}</h4>
                    <div className="flex items-center text-xs text-slate-400 mt-1 space-x-2">
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{tx.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {renderTxAmount(tx)}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(tx.id); }}
                    className="mt-2 text-slate-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Transactions Table */}
        <div className="hidden md:block overflow-x-auto relative z-10">
          <table className="w-full text-slate-900 dark:text-slate-200">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left whitespace-nowrap first:rounded-tl-none">Date</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">Description</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">Category</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 text-center whitespace-nowrap last:rounded-tr-none">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                    <Search className="w-6 h-6 opacity-20" />
                  </div>
                  <p>No transactions found matching your filters.</p>
                </td></tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-200">
                          {renderTxIcon(tx)}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.category === 'Savings' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-base">
                      {renderTxAmount(tx)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-white/20 dark:border-slate-700 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-full mb-4 ring-4 ring-red-50 dark:ring-red-900/10">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">Delete Transaction?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Are you sure you want to delete this transaction? This action cannot be undone and will affect your budget.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 dark:border-slate-700 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Add Transaction</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => setNewTx({ ...newTx, type: 'Expense' })}
                    className={`flex-1 py-2.5 text-sm rounded-lg font-bold transition-all ${newTx.type === 'Expense' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600'}`}
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => setNewTx({ ...newTx, type: 'Income' })}
                    className={`flex-1 py-2.5 text-sm rounded-lg font-bold transition-all ${newTx.type === 'Income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600'}`}
                  >
                    Income
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-lg">₹</span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl text-2xl font-bold text-slate-900 dark:text-white focus:outline-none transition-all placeholder-slate-300"
                  placeholder="0.00"
                  type="number"
                  value={newTx.amount}
                  onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <input
                className="input-field"
                placeholder="What is this for?"
                value={newTx.description}
                onChange={e => setNewTx({ ...newTx, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                {isCustomCategory ? (
                  <div className="flex space-x-2">
                    <input
                      className="input-field !py-2"
                      placeholder="New category"
                      value={newTx.category}
                      onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                    />
                    <button
                      onClick={() => {
                        setIsCustomCategory(false);
                        setNewTx({ ...newTx, category: 'Other' });
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      className="input-field appearance-none"
                      value={newTx.category}
                      onChange={e => {
                        if (e.target.value === '___NEW_CATEGORY___') {
                          setIsCustomCategory(true);
                          setNewTx({ ...newTx, category: '' });
                        } else {
                          setNewTx({ ...newTx, category: e.target.value });
                        }
                      }}
                    >
                      {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="___NEW_CATEGORY___">+ Add New</option>
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                      <ArrowDownCircle className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={newTx.date}
                  onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleAdd} className="btn-primary px-8 py-3 rounded-xl font-bold shadow-xl shadow-emerald-500/20">Save Transaction</button>
            </div>
          </div>
        </div>
      )}

      {showMagicModal && (
        <MagicImportModal
          onClose={() => setShowMagicModal(false)}
          onSuccess={handleMagicSuccess}
        />
      )}
    </div>
  );
};

export default Transactions;