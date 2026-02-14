import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Search, ArrowUpCircle, ArrowDownCircle, ChevronRight, PieChart as PieIcon, Wallet, ChevronLeft, X } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const History = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Month Picker State
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(parseInt(selectedMonth.split('-')[0]));

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/transactions?user_id=${user.id}`).then(res => res.json()).then(setTransactions);
  }, [user]);

  // Grouping Logic
  const { groupedData, monthlyStats, categoryData } = useMemo(() => {
    // Filter by selected month
    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));

    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    // Group by Date & Calculate Stats
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      const dateStr = t.date.split('T')[0];
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);

      if (t.type === 'Income') income += t.amount;
      else {
        expense += t.amount;
        if (t.category !== 'Savings') {
          catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        }
      }
    });

    // Prepare Chart Data
    const chartData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Sort dates descending
    const sortedGroups = Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));

    return {
      groupedData: sortedGroups,
      monthlyStats: { income, expense, savings: income - expense },
      categoryData: chartData
    };
  }, [transactions, selectedMonth]);

  const toggleGroup = (date: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(date)) newSet.delete(date);
    else newSet.add(date);
    setExpandedGroups(newSet);
  };

  // Auto-expand all on load
  useEffect(() => {
    if (groupedData.length > 0) {
      setExpandedGroups(new Set(groupedData.map(g => g[0])));
    }
  }, [groupedData.length]);

  const getDaySummary = (txs: Transaction[]) => {
    const income = txs.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
    const expense = txs.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense };
  };

  const handleMonthSelect = (monthIndex: number) => {
    const monthStr = (monthIndex + 1).toString().padStart(2, '0');
    setSelectedMonth(`${pickerYear}-${monthStr}`);
    setShowMonthPicker(false);
  };

  const selectedYear = parseInt(selectedMonth.split('-')[0]);
  const selectedMonthIndex = parseInt(selectedMonth.split('-')[1]) - 1;

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Financial History</h2>
          <p className="text-slate-500 dark:text-slate-400">Analyze your spending patterns over time.</p>
        </div>

        {/* Custom Month Picker Trigger */}
        <button
          onClick={() => {
            setPickerYear(parseInt(selectedMonth.split('-')[0]));
            setShowMonthPicker(true);
          }}
          className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg mr-3 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left mr-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Month</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-2 rotate-90" />
        </button>
      </div>

      {/* Month Picker Modal */}
      {showMonthPicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in" onClick={() => setShowMonthPicker(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Select Month</h3>
              <button onClick={() => setShowMonthPicker(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setPickerYear(prev => prev - 1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{pickerYear}</h4>
                <button
                  onClick={() => setPickerYear(prev => prev + 1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {MONTHS.map((month, index) => {
                  const isSelected = pickerYear === selectedYear && index === selectedMonthIndex;
                  const isCurrentMonth = pickerYear === new Date().getFullYear() && index === new Date().getMonth();

                  return (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(index)}
                      className={`
                        py-3 px-2 rounded-xl text-sm font-semibold transition-all relative overflow-hidden
                        ${isSelected
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }
                        ${isCurrentMonth && !isSelected ? 'border-2 border-indigo-100 dark:border-indigo-900/50' : ''}
                      `}
                    >
                      {month.slice(0, 3)}
                      {isCurrentMonth && !isSelected && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Income</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹{monthlyStats.income.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <ArrowUpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">₹{monthlyStats.expense.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <ArrowDownCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-indigo-500">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Savings</p>
            <h3 className={`text-2xl font-bold mt-1 ${monthlyStats.savings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'}`}>
              ₹{monthlyStats.savings.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Charts & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Breakdown */}
        <div className="lg:col-span-1 glass-card p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Spending Breakdown
          </h3>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <PieIcon className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">No expenses to display</p>
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="lg:col-span-2 space-y-4">
          {groupedData.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center opacity-80">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Record Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions found for {new Date(selectedMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}.</p>
            </div>
          ) : (
            groupedData.map(([date, txs]) => {
              const { income, expense } = getDaySummary(txs);
              const isExpanded = expandedGroups.has(date);

              return (
                <div key={date} className="glass-card !p-0 overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-300">
                  <button
                    onClick={() => toggleGroup(date)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-1 rounded-lg transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 dark:text-white">
                          {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{txs.length} Transactions</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-6">
                      {income > 0 && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end"><ArrowUpCircle className="w-3 h-3 mr-1" /> ₹{income}</span>}
                      {expense > 0 && <span className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center justify-end"><ArrowDownCircle className="w-3 h-3 mr-1" /> ₹{expense}</span>}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 animate-slide-up">
                      {txs.map(tx => (
                        <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors pl-14">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${tx.type === 'Income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.description}</p>
                              <p className="text-xs text-slate-500">{tx.category}</p>
                            </div>
                          </div>
                          <span className={`font-display font-bold text-sm ${tx.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default History;