import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { DashboardStats, SavingsGoal, CategoryBreakdown, BudgetData } from '../types';
import { Link, useNavigate } from 'react-router-dom';

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

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Dynamic Greeting & Quote */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-center">
         <div className="mb-4 md:mb-0">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Lightbulb className="text-yellow-400 w-4 h-4 md:w-5 md:h-5" />
              <span>Daily Wisdom</span>
            </h2>
            <p className="text-slate-300 italic mt-1 text-sm md:text-base">"{quote}"</p>
         </div>
         <div className="text-right w-full md:w-auto">
            <p className="text-xs md:text-sm text-slate-400">Welcome back,</p>
            <p className="font-bold text-base md:text-lg">{user?.full_name}</p>
         </div>
      </div>

      {/* Overspending Alert */}
      {isOverBudget && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center space-x-3 animate-pulse">
           <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
           </div>
           <div>
              <h3 className="font-bold text-red-700 dark:text-red-400">Budget Alert</h3>
              <p className="text-red-600 dark:text-red-300 text-sm">You have used <span className="font-bold">{budgetPercent}%</span> of your daily budget (₹{Math.floor(budgetData?.used_today || 0)} / ₹{Math.floor(budgetData?.daily_limit || 0)}). Slow down!</p>
           </div>
        </div>
      )}

      {/* Stats Cards - Updated grid for mobile */}
      <div id="dashboard-stats" className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 transition-colors">
          <div className="p-2 md:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Income</p>
            <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white truncate">₹{stats?.income || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 transition-colors">
          <div className="p-2 md:p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
            <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Expenses</p>
            <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white truncate">₹{stats?.expenses || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 transition-colors col-span-2 md:col-span-1">
          <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <IndianRupee className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
            <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white truncate">₹{stats?.balance || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Spending by Category</h3>
                <Link to="/categories" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">View Details</Link>
             </div>
             <div className="h-48 md:h-64 flex justify-center items-center">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{color: '#94a3b8', fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm">No spending data for this month.</p>
                )}
             </div>
        </div>

        {/* Savings Goals Visualization */}
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col transition-colors">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Savings Goals</h3>
             <Link to="/savings" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">View All</Link>
           </div>
           
           <div className="flex-1 flex flex-col justify-center">
             {goals.length === 0 ? (
               <div className="text-center text-slate-400 text-sm">No goals set yet.</div>
             ) : (goals.length <= 2 ? (
                <div className="flex justify-around items-center">
                   {goals.map(g => {
                     const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
                     return (
                       <div key={g.id} className="flex flex-col items-center">
                          <div className="relative w-20 h-20 md:w-24 md:h-24">
                             <svg className="w-full h-full transform -rotate-90">
                               <circle cx="50%" cy="50%" r="40%" stroke="#f1f5f9" className="dark:stroke-slate-700" strokeWidth="8" fill="none"/>
                               <circle cx="50%" cy="50%" r="40%" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray={`${pct * (2 * Math.PI * 40 / 100)} ${(2 * Math.PI * 40)}`} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base">
                               {pct.toFixed(0)}%
                             </div>
                          </div>
                          <span className="mt-2 text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[80px] md:max-w-[100px]">{g.name}</span>
                       </div>
                     )
                   })}
                </div>
             ) : (
                <div className="h-48">
                   <div className="space-y-4 overflow-y-auto max-h-full">
                    {goals.map(g => (
                        <div key={g.id}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium truncate text-slate-700 dark:text-slate-300">{g.name}</span>
                                <span className="text-slate-500 dark:text-slate-400">{Math.floor((g.current_amount/g.target_amount)*100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${Math.min((g.current_amount/g.target_amount)*100, 100)}%`}}></div>
                            </div>
                        </div>
                    ))}
                   </div>
                </div>
             ))}
           </div>
        </div>

        {/* Spending Trend */}
        <div 
            onClick={() => navigate('/trends')}
            className="lg:col-span-3 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Spending Trend Analysis</h3>
            <div className="flex items-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm">
                <span>View Full Report</span>
                <ChevronRight size={16} />
            </div>
          </div>
          <div className="h-48 md:h-64">
             {trendData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: '12px'}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}} />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
               </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Not enough data</div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;