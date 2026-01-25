import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Sparkles, Search, Trash2, ArrowUpCircle, ArrowDownCircle, X, Calendar, AlertTriangle, PiggyBank } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';

const DEFAULT_CATEGORIES = ["Food", "Travel", "Shopping", "Entertainment", "Utilities", "Housing", "Health", "Education", "Other"];

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  
  // State for delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [magicText, setMagicText] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [newTx, setNewTx] = useState({ 
    description: '', 
    amount: '', 
    type: 'Expense',
    category: 'Other',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTx = () => {
    if (!user?.id) return;
    let url = `${API_URL}/transactions?user_id=${user.id}`;
    if(search) url += `&search=${search}`;
    fetch(url).then(res => res.json()).then(setTransactions);
  };

  useEffect(() => { fetchTx(); }, [search, user]);

  // Derive available categories from existing transactions + defaults
  const availableCategories = useMemo(() => {
    const txCats = transactions.map(t => t.category);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...txCats])).sort();
  }, [transactions]);

  // Reset custom category input when modal closes
  useEffect(() => {
    if (!showAddModal) {
        setIsCustomCategory(false);
        // Reset to default if it was a custom one to avoid UI glitches, or keep it. 
        if (!DEFAULT_CATEGORIES.includes(newTx.category)) {
             setNewTx(prev => ({ ...prev, category: 'Other' }));
        }
    }
  }, [showAddModal]);

  const confirmDelete = async () => {
    if (deleteId === null) return;
    await fetch(`${API_URL}/transactions/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null); // Close modal
    fetchTx();
  };

  const handleAdd = async () => {
    if (!user?.id) return;

    // Validate amount to prevent server error
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
          date: new Date(newTx.date).toISOString()
        })
      });

      if (!res.ok) throw new Error("Failed to save");

      setShowAddModal(false);
      setNewTx({ ...newTx, description: '', amount: '' });
      fetchTx();
    } catch (e) {
      alert("Error saving transaction. Please check your inputs.");
      console.error(e);
    }
  };

  const handleMagicImport = async () => {
    if (!user?.id || !magicText.trim()) return;
    try {
      // dry_run=true tells backend to just parse and return data
      const res = await fetch(`${API_URL}/transactions/import?user_id=${user.id}&dry_run=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: magicText })
      });
      const data = await res.json();
      
      // Pre-fill the modal with extracted data
      setNewTx({
        description: data.description || 'Imported Transaction',
        amount: data.amount ? data.amount.toString() : '',
        type: data.type || 'Expense',
        category: data.category || 'Other',
        date: new Date().toISOString().split('T')[0]
      });

      setMagicText('');
      setShowMagicModal(false);
      setShowAddModal(true); // Open the main modal for review
    } catch (e) {
      console.error("Import error", e);
      alert("Failed to parse SMS.");
    }
  };

  // Helper to determine icon and color based on type and category
  const renderTxIcon = (tx: Transaction) => {
    if (tx.category === 'Savings') {
       return <PiggyBank className="w-5 h-5 text-indigo-500" />;
    }
    return tx.type === 'Income' 
       ? <ArrowUpCircle className="w-5 h-5 text-emerald-500" /> 
       : <ArrowDownCircle className="w-5 h-5 text-red-500" />;
  };

  const renderTxAmount = (tx: Transaction) => {
    if (tx.category === 'Savings') {
        return (
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(tx.amount)}
            </span>
        );
    }
    return (
        <span className={`font-bold ${tx.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
             {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(tx.amount)}
        </span>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
           <p className="text-slate-500 dark:text-slate-400">Manage your daily expenses and income.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <button 
            onClick={() => setShowMagicModal(true)}
            className="flex-1 md:flex-none justify-center flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Magic Import</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex-1 md:flex-none justify-center flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
           <div className="relative">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Search transactions..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
             />
           </div>
        </div>

        <div>
          <table className="w-full text-slate-900 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No transactions found. Add one to get started!</td></tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {renderTxIcon(tx)}
                        <span className="font-medium text-slate-900 dark:text-white">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${tx.category === 'Savings' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {renderTxAmount(tx)}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => setDeleteId(tx.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-full mb-4">
                   <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Transaction?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Are you sure you want to delete this transaction? This action cannot be undone and will affect your budget calculations.</p>
             </div>
             <div className="flex space-x-3">
                <button 
                  onClick={() => setDeleteId(null)} 
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Yes, Delete
                </button>
             </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Transaction</h3>
               <button onClick={() => setShowAddModal(false)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Type</label>
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 p-1">
                     <button 
                       onClick={() => setNewTx({...newTx, type: 'Expense'})}
                       className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${newTx.type === 'Expense' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
                     >
                       Expense
                     </button>
                     <button 
                       onClick={() => setNewTx({...newTx, type: 'Income'})}
                       className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${newTx.type === 'Income' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                     >
                       Income
                     </button>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Amount</label>
                  <input 
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                    placeholder="0.00" 
                    type="number"
                    value={newTx.amount} 
                    onChange={e => setNewTx({...newTx, amount: e.target.value})} 
                  />
               </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
              <input 
                className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                placeholder="e.g., Starbucks Coffee" 
                value={newTx.description} 
                onChange={e => setNewTx({...newTx, description: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
                  {isCustomCategory ? (
                    <div className="flex space-x-2">
                        <input 
                            className="flex-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                            placeholder="Enter new category"
                            value={newTx.category}
                            onChange={e => setNewTx({...newTx, category: e.target.value})}
                            autoFocus
                        />
                         <button 
                            onClick={() => {
                                setIsCustomCategory(false);
                                setNewTx({...newTx, category: 'Other'});
                            }}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                         >
                            <X className="w-4 h-4" />
                         </button>
                    </div>
                  ) : (
                      <select 
                        className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                        value={newTx.category}
                        onChange={e => {
                            if (e.target.value === '___NEW_CATEGORY___') {
                                setIsCustomCategory(true);
                                setNewTx({...newTx, category: ''});
                            } else {
                                setNewTx({...newTx, category: e.target.value});
                            }
                        }}
                      >
                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="___NEW_CATEGORY___" className="font-bold text-indigo-600 dark:text-indigo-400">+ Add New Category</option>
                      </select>
                  )}
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Date</label>
                  <div className="relative">
                    <input 
                      type="date"
                      className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                      value={newTx.date}
                      onChange={e => setNewTx({...newTx, date: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            <div className="flex justify-end space-x-2">
               <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium">Cancel</button>
               <button onClick={handleAdd} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Save Transaction</button>
            </div>
          </div>
        </div>
      )}

      {showMagicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
               <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Magic Import</h3>
               </div>
               <button onClick={() => setShowMagicModal(false)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Paste a bank SMS. AI will extract details for your review.</p>
            <textarea
               className="w-full h-32 p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700"
               placeholder="e.g., 'Sent Rs. 350 to Uber via UPI on 22-10-2023'"
               value={magicText}
               onChange={(e) => setMagicText(e.target.value)}
            ></textarea>
            <button 
              onClick={handleMagicImport} 
              className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex justify-center items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract & Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;