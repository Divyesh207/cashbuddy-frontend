import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, PiggyBank, RotateCcw, Target, Sparkles, Settings2, Bot, ArrowRight, Coins, Undo2 } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { BudgetData } from '../types';

const Budget = () => {
  const { user } = useAuth();
  const [data, setData] = useState<BudgetData | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configForm, setConfigForm] = useState({ income: '', savings: '', aiMode: false });

  const fetchBudget = () => {
    if(user?.id) {
       fetch(`${API_URL}/budget?user_id=${user.id}`)
         .then(res => res.json())
         .then((d) => {
            setData(d);
            if (!d.is_configured) setIsConfiguring(true);
         });
    }
  };

  useEffect(() => { fetchBudget(); }, [user]);

  const handleConfigure = async (e: React.FormEvent) => {
     e.preventDefault();
     if(!user?.id) return;
     
     await fetch(`${API_URL}/budget/configure?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            monthly_income: parseFloat(configForm.income), 
            target_savings: parseFloat(configForm.savings),
            ai_mode: configForm.aiMode
        })
     });
     setIsConfiguring(false);
     fetchBudget();
  };

  const handleSweep = async () => {
    if (!data?.surplus || !user?.id) return;
    await fetch(`${API_URL}/budget/sweep?user_id=${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.floor(data.surplus) })
    });
    fetchBudget();
  };

  const handleUndoSweep = async () => {
    if(!user?.id) return;
    try {
        const res = await fetch(`${API_URL}/budget/sweep/undo?user_id=${user.id}`, { method: 'POST' });
        if(!res.ok) {
            const err = await res.json();
            alert(err.detail || "Failed to undo");
        }
        fetchBudget();
    } catch(e) {
        console.error(e);
    }
  };

  const triggerAI = () => {
     const income = parseFloat(configForm.income) || 0;
     if (income > 0) {
        // 50/30/20 Rule: 20% Savings
        setConfigForm(prev => ({ ...prev, savings: Math.floor(income * 0.2).toString(), aiMode: true }));
     } else {
        alert("Please enter income first for AI calculation.");
     }
  };

  if (!data && !isConfiguring) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading budget data...</div>;

  if (isConfiguring) {
      return (
         <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Setup Your Smart Budget</h2>
               <p className="text-slate-500 dark:text-slate-400">Let's calculate your daily spending limit and savings targets.</p>
            </div>
            
            <form onSubmit={handleConfigure} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Income / Budget</label>
                    <input 
                      id="budget-income"
                      type="number" 
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                      placeholder="e.g. 50000"
                      value={configForm.income}
                      onChange={e => setConfigForm({...configForm, income: e.target.value})}
                      required
                    />
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-300">Savings Target</label>
                       <button 
                         type="button" 
                         onClick={triggerAI}
                         className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                       >
                         <Bot size={14} /> <span>Let AI Decide</span>
                       </button>
                    </div>
                    <input 
                      id="budget-savings"
                      type="number" 
                      className="w-full p-3 border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                      placeholder="e.g. 10000"
                      value={configForm.savings}
                      onChange={e => setConfigForm({...configForm, savings: e.target.value})}
                      required
                    />
                    <p className="text-xs text-indigo-400 mt-2">Pay yourself first! This amount is removed from your daily limit.</p>
                </div>

                <button id="budget-save-btn" type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none">
                    Start Budgeting
                </button>
                
                {data?.is_configured && (
                    <button type="button" onClick={() => setIsConfiguring(false)} className="w-full text-slate-400 text-sm hover:text-slate-600 dark:hover:text-slate-300">Cancel</button>
                )}
            </form>
         </div>
      )
  }

  const usedPercent = data && data.daily_limit > 0 ? Math.min((data.used_today / data.daily_limit) * 100, 100) : 0;
  
  const hasSweptToday = data?.sweeps.some(s => new Date(s.date).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Budget</h2>
           <p className="text-slate-500 dark:text-slate-400">Daily tracking and automated micro-savings.</p>
        </div>
        <button id="budget-config-btn" onClick={() => setIsConfiguring(true)} className="flex items-center space-x-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all w-full md:w-auto justify-center">
           <Settings2 size={16} />
           <span>Reconfigure Budget</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Daily Limit */}
         <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={100} /></div>
            <div className="flex items-center space-x-2 mb-4 opacity-80 relative z-10">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Daily Limit</span>
            </div>
            <p className="text-4xl font-bold mb-1 relative z-10">₹{Math.floor(data?.daily_limit || 0)}</p>
            <p className="text-indigo-200 text-sm relative z-10">Max allowed daily spend</p>
         </div>

         {/* Used Today */}
         <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center space-x-2 mb-4 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Used Today</span>
            </div>
            <p className="text-4xl font-bold text-emerald-800 dark:text-emerald-300 mb-1">₹{Math.floor(data?.used_today || 0)}</p>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Includes expenses & sweeps</p>
         </div>

         {/* Savings This Month */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <div className="flex items-center space-x-2 mb-4 text-amber-500">
              <Coins className="w-5 h-5" />
              <span className="font-medium">Saved (Month)</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">₹{Math.floor(data?.savings_this_month || 0)}</p>
            <p className="text-slate-400 text-sm">Total swept to savings this month</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
             <Target className="w-5 h-5 text-slate-400" />
             <span>Today's Progress</span>
           </h3>
           
           <div className="mb-2 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Used (Spent + Swept)</span>
              <span>{usedPercent.toFixed(0)}%</span>
           </div>
           <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 mb-8">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${usedPercent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{width: `${usedPercent}%`}}
              ></div>
           </div>

           {data && data.surplus > 0 ? (
             <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center">
                   <Sparkles className="w-4 h-4 mr-2" /> Budget Surplus!
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">You have <span className="font-bold">₹{Math.floor(data.surplus)}</span> left for today.</p>
                <button 
                  onClick={handleSweep}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                   Sweep ₹{Math.floor(data.surplus)} to Savings
                </button>
             </div>
           ) : (
             <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                You have reached your daily budget limit.
             </div>
           )}

           {hasSweptToday && (
               <button 
                 onClick={handleUndoSweep}
                 className="mt-4 w-full py-2 flex items-center justify-center space-x-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
               >
                 <Undo2 size={16} />
                 <span>Undo Last Sweep</span>
               </button>
           )}
        </div>

        {/* Sweep History */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
             <RotateCcw className="w-5 h-5 text-slate-400" />
             <span>Sweep History (This Month)</span>
           </h3>
           <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
             {data?.sweeps.map((s, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <PiggyBank className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{new Date(s.date).toISOString().split('T')[0]}</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+₹{Math.floor(s.amount)}</span>
               </div>
             ))}
             {data?.sweeps.length === 0 && <p className="text-slate-400 text-center text-sm py-8">No savings swept yet. Stay under budget to save!</p>}
           </div>
        </div>
      </div>

      {/* Category Estimates */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
         <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-900 dark:text-white">Category Monthly Estimates</h3>
             <div title="AI Estimated">
                <Bot className="text-indigo-500 w-5 h-5" />
             </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {data?.category_estimates.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{cat.category}</span>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">
                            <span className={cat.spent > cat.limit ? 'text-red-500 font-bold' : 'text-slate-800 dark:text-slate-200'}>₹{Math.floor(cat.spent)}</span> / ₹{Math.floor(cat.limit)}
                        </p>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 ml-auto">
                            <div 
                                className={`h-1.5 rounded-full ${cat.spent > cat.limit ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                style={{width: `${Math.min((cat.spent/cat.limit)*100, 100)}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Budget;