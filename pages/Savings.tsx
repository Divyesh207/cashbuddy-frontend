import React, { useEffect, useState } from 'react';
import { Plus, Target, TrendingUp, Minus, Trash2, X } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { SavingsGoal } from '../types';

const Savings = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '' });

  // Deposit Modal State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);

  const fetchGoals = () => {
    if(user?.id) {
       fetch(`${API_URL}/savings?user_id=${user.id}`)
         .then(res => res.json())
         .then(setGoals);
    }
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const handleCreate = async () => {
    if(!user?.id) return;
    await fetch(`${API_URL}/savings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newGoal.name, 
        target_amount: parseFloat(newGoal.target_amount),
        user_id: user.id 
      })
    });
    setShowModal(false);
    fetchGoals();
  };

  const openDepositModal = (goal: SavingsGoal, withdraw: boolean) => {
    setSelectedGoal(goal);
    setIsWithdraw(withdraw);
    setDepositAmount('');
    setShowDepositModal(true);
  };

  const handleTransaction = async () => {
    if(!user?.id || !selectedGoal) return;
    
    let amount = parseFloat(depositAmount);
    if(isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    if(isWithdraw) amount = -amount;

    await fetch(`${API_URL}/savings/${selectedGoal.id}/deposit?user_id=${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    
    setShowDepositModal(false);
    fetchGoals();
  };

  const deleteGoal = async (id: number) => {
    if(!confirm("Delete this savings goal?")) return;
    await fetch(`${API_URL}/savings/${id}`, { method: 'DELETE' });
    fetchGoals();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h2>
           <p className="text-slate-500 dark:text-slate-400">Track your progress for big purchases.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all">
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 && (
           <div className="col-span-full text-center py-10 text-slate-400">
              No savings goals yet. Create one to get started!
           </div>
        )}
        {goals.map(goal => {
          const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          return (
            <div key={goal.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative group transition-colors">
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">{progress.toFixed(0)}%</span>
              </div>
              
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{goal.name}</h3>
              <div className="flex justify-between items-end mb-4">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{goal.current_amount}</span>
                <span className="text-sm text-slate-400 mb-1">/ ₹{goal.target_amount}</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-6">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => openDepositModal(goal, false)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-sm font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" /> <span>Deposit</span>
                </button>
                <button 
                   onClick={() => openDepositModal(goal, true)}
                   className="flex-1 flex items-center justify-center space-x-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium transition-colors"
                >
                  <Minus className="w-3 h-3" /> <span>Withdraw</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-96 animate-fade-in shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Create Savings Goal</h3>
            <div className="space-y-4">
               <input className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white" placeholder="Goal Name (e.g., New Car)" onChange={e => setNewGoal({...newGoal, name: e.target.value})} />
               <input className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white" type="number" placeholder="Target Amount" onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} />
               <button onClick={handleCreate} className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700">Create Goal</button>
               <button onClick={() => setShowModal(false)} className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit/Withdraw Modal */}
      {showDepositModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-96 animate-fade-in shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {isWithdraw ? 'Withdraw from' : 'Deposit to'} {selectedGoal.name}
                    </h3>
                    <button onClick={() => setShowDepositModal(false)}><X className="text-slate-400" /></button>
                </div>
                
                <div className="mb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        {isWithdraw 
                            ? "Withdrawing money will add it back to your spendable balance." 
                            : "Depositing money will deduct it from your spendable balance."}
                    </p>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                        <input 
                            type="number" 
                            autoFocus
                            className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white" 
                            placeholder="Enter amount" 
                            value={depositAmount} 
                            onChange={e => setDepositAmount(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button onClick={() => setShowDepositModal(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">Cancel</button>
                    <button 
                        onClick={handleTransaction} 
                        className={`flex-1 py-2 text-white rounded-lg ${isWithdraw ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Savings;