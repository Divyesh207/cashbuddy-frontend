import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, AlertTriangle, Lightbulb, ChevronRight, Wallet, ArrowUpRight, ArrowDownRight, Target, Sparkles } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { DashboardStats, SavingsGoal, CategoryBreakdown, BudgetData } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import MagicImportModal from '../components/MagicImportModal';

const QUOTES = [
  "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
  "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey",
  "Beware of little expenses. A small leak will sink a great ship. – Benjamin Franklin",
  "The art is not in making money, but in keeping it. – Proverb",
  "Financial freedom is available to those who learn about it and work for it. – Robert Kiyosaki"
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [quote, setQuote] = useState('');
  const [showMagicModal, setShowMagicModal] = useState(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    if (user?.id) {
      fetch(`${API_URL}/dashboard/stats?user_id=${user.id}`).then(res => res.json()).then(setStats);
      fetch(`${API_URL}/dashboard/trend?user_id=${user.id}`).then(res => res.json()).then(setTrendData);
      fetch(`${API_URL}/savings?user_id=${user.id}`).then(res => res.json()).then(setGoals);
      fetch(`${API_URL}/categories/breakdown?user_id=${user.id}`).then(res => res.json()).then(setCategoryData);
      // Fetch budget to check for overspending
      fetch(`${API_URL}/budget?user_id=${user.id}`).then(res => res.json()).then(setBudgetData);
    }
  }, [user]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  // Calculate overspending status
  const isOverBudget = budgetData && budgetData.daily_limit > 0 && (budgetData.used_today / budgetData.daily_limit) >= 0.8;
  const budgetPercent = budgetData && budgetData.daily_limit > 0 ? ((budgetData.used_today / budgetData.daily_limit) * 100).toFixed(0) : 0;

  const handleMagicSuccess = (data: any) => {
    navigate('/transactions', { state: { magicData: data } });
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Dynamic Greeting & Quote */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 shadow-2xl p-8 text-white group hover:shadow-emerald-900/20 transition-all duration-500">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Lightbulb className="text-yellow-300 w-5 h-5" />
              </div>
              <span className="text-emerald-300 font-semibold tracking-wide text-sm uppercase">Daily Wisdom</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-medium leading-relaxed">"{quote}"</h2>
          </div>
          <div className="flex flex-col items-end text-right">
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-2xl">{user?.full_name}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg font-bold">
                  {user?.full_name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards (Moved to Top) */}
      <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} /> +12%
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Income</p>
          <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">₹{stats?.income || 0}</h3>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center gap-1">
              <ArrowDownRight size={12} /> +5%
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Expenses</p>
          <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">₹{stats?.expenses || 0}</h3>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-500/20 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-white/20 text-white rounded-full">Current</span>
          </div>
          <p className="text-blue-100 text-sm font-medium relative z-10">Total Balance</p>
          <h3 className="text-3xl font-display font-bold text-white mt-1 relative z-10">₹{stats?.balance || 0}</h3>
        </div>
      </div>

      {/* Proactive Insight & Magic Import */}
      <div className="grid grid-cols-1 gap-6">
        {/* Magic Import CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden group hover:shadow-indigo-500/30 transition-all">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 h-full flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <h4 className="font-bold text-xl leading-tight">Magic Import</h4>
                <p className="text-indigo-100 mt-1 opacity-90 max-w-lg">
                  Got a bank SMS? Paste it here to auto-add expenses using AI.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMagicModal(true)}
              className="w-full md:w-auto px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Import Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overspending Alert */}
      {isOverBudget && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl flex items-center space-x-4 animate-pulse relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-red-500"></div>
          <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full shrink-0">
            <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-red-700 dark:text-red-400 text-lg">Budget Alert</h3>
            <p className="text-red-600 dark:text-red-300">You have used <span className="font-bold">{budgetPercent}%</span> of your daily budget (₹{Math.floor(budgetData?.used_today || 0)} / ₹{Math.floor(budgetData?.daily_limit || 0)}). Slow down!</p>
          </div>
        </div>
      )}

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Spending Trend */}
        <div
          onClick={() => navigate('/trends')}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Spending Analysis</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your spending patterns over time</p>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
              <ChevronRight size={20} className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
            </div>
          </div>
          <div className="h-72 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: '12px' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: '12px' }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff', padding: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAmt)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 flex-col gap-2">
                <TrendingUp className="w-8 h-8 opacity-20" />
                <span>Not enough data to display trend</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expenses by Category</h3>
            <Link to="/categories" className="text-xs font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">View Details</Link>
          </div>

          <div className="flex-1 flex justify-center items-center relative">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', padding: '8px 12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ color: '#94a3b8', fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 flex flex-col items-center">
                <PieChart className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No spending data</p>
              </div>
            )}
          </div>
        </div>

        {/* Savings Goals Visualization */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Savings Goals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track your progress towards your dreams</p>
            </div>
            <Link to="/savings" className="btn-primary text-sm shadow-md shadow-emerald-500/20">Manage Goals</Link>
          </div>

          <div className="flex-1">
            {goals.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No goals set yet. Start saving today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.slice(0, 3).map(g => {
                  const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
                  return (
                    <div key={g.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r="40%" stroke="#e2e8f0" className="dark:stroke-slate-700" strokeWidth="6" fill="none" />
                          <circle cx="50%" cy="50%" r="40%" stroke={pct >= 100 ? '#10b981' : '#3b82f6'} strokeWidth="6" fill="none" strokeDasharray={`${pct * (2 * Math.PI * 40 / 100)} ${(2 * Math.PI * 40)}`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                          {pct.toFixed(0)}%
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{g.name}</h4>
                        <div className="flex justify-between items-end mt-1">
                          <span className="text-xs text-slate-500">Target: ₹{g.target_amount}</span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{g.current_amount}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
      {showMagicModal && (
        <MagicImportModal
          onClose={() => setShowMagicModal(false)}
          onSuccess={handleMagicSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;