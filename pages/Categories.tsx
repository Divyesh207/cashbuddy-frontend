import React, { useEffect, useState } from 'react';
import { X, Utensils, Plane, ShoppingBag, Film, Lightbulb, Home, Heart, BookOpen, CircleDollarSign } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { CategoryBreakdown, Transaction } from '../types';

const Categories = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CategoryBreakdown[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [catTransactions, setCatTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_URL}/categories/breakdown?user_id=${user.id}`)
        .then(res => res.json())
        .then(setData);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && selectedCategory) {
      let query = `user_id=${user.id}`;
      if (selectedCategory === 'Income') {
        query += `&type=Income`; // Fetch all income regardless of original category
      } else {
        query += `&category=${selectedCategory}&type=Expense`; // Restrict to expenses for other categories
      }

      fetch(`${API_URL}/transactions?${query}`)
        .then(res => res.json())
        .then(setCatTransactions);
    }
  }, [selectedCategory, user]);

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Food': return <Utensils className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />;
      case 'Travel': return <Plane className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />;
      case 'Shopping': return <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />;
      case 'Entertainment': return <Film className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />;
      case 'Utilities': return <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />;
      case 'Housing': return <Home className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />;
      case 'Health': return <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500" />;
      case 'Education': return <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />;
      case 'Income': return <CircleDollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />;
      default: return <CircleDollarSign className="w-5 h-5 md:w-6 md:h-6 text-slate-500" />;
    }
  }

  const getBg = (cat: string) => {
    // In dark mode, we'll make these backgrounds subtle transparent colors
    switch (cat) {
      case 'Food': return 'bg-orange-50 dark:bg-orange-900/20';
      case 'Travel': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'Shopping': return 'bg-pink-50 dark:bg-pink-900/20';
      case 'Entertainment': return 'bg-purple-50 dark:bg-purple-900/20';
      case 'Utilities': return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'Housing': return 'bg-indigo-50 dark:bg-indigo-900/20';
      case 'Health': return 'bg-red-50 dark:bg-red-900/20';
      case 'Education': return 'bg-emerald-50 dark:bg-emerald-900/20';
      case 'Income': return 'bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'bg-slate-50 dark:bg-slate-700';
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h2>
        <p className="text-slate-500 dark:text-slate-400">Click a category to view detailed spending.</p>
      </div>

      <div id="category-list" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {data.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedCategory(item.name)}
            className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className={`p-3 md:p-4 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform ${getBg(item.name)}`}>
              {getIcon(item.name)}
            </div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white truncate w-full">{item.name}</h3>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base md:text-lg mt-1">₹{item.value}</p>
            <p className="text-xs text-slate-400 mt-1">{item.count} txs</p>
          </div>
        ))}
        {data.length === 0 && <p className="text-slate-500 dark:text-slate-400 col-span-full text-center py-12">No data available for this month.</p>}
      </div>

      {/* Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-700 max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getBg(selectedCategory)}`}>{getIcon(selectedCategory)}</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedCategory}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300">Total Spent: <span className="font-bold">₹{data.find(d => d.name === selectedCategory)?.value}</span></p>
                </div>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X /></button>
            </div>
            <div className="overflow-y-auto p-2 flex-1">
              {catTransactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{tx.description}</p>
                    <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-bold ${tx.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'Income' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))}
              {catTransactions.length === 0 && <p className="text-center p-4 text-slate-400">Loading...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;