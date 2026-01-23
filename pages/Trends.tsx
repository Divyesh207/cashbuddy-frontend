import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';

const Trends = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      // Simulating different timeframe endpoints using the existing trend endpoint structure
      // In a real backend, you would pass ?period=week to the API
      fetch(`${API_URL}/dashboard/trend?user_id=${user.id}&period=${period}`)
        .then(res => res.json())
        .then(fetchedData => {
           // If backend doesn't support period filtering yet, we might get the same data
           // This logic ensures the UI updates regardless
           setData(fetchedData);
           setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, period]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Spending Trends</h2>
           <p className="text-slate-500 dark:text-slate-400">Analyze your financial habits over time.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            {['week', 'month', 'year'].map((p) => (
                <button
                    key={p}
                    onClick={() => setPeriod(p as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                        period === p 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                    This {p}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
         <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{period}ly Analysis</h3>
         </div>

         <div className="h-80 w-full">
            {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Loading data...</div>
            ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    {period === 'year' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                            <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorTrend)" />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No transaction data found for this period.</div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
             <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Total Spent</h4>
             <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{data.reduce((acc, curr) => acc + curr.amount, 0)}</p>
             <p className="text-xs text-indigo-400 mt-1">For selected period</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
             <h4 className="font-bold text-slate-900 dark:text-white mb-2">Highest Spending</h4>
             <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                 ₹{data.length > 0 ? Math.max(...data.map(d => d.amount)) : 0}
             </p>
             <p className="text-xs text-slate-400 mt-1">Peak transaction volume</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
             <h4 className="font-bold text-slate-900 dark:text-white mb-2">Average / Day</h4>
             <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                ₹{data.length > 0 ? (data.reduce((acc, curr) => acc + curr.amount, 0) / data.length).toFixed(0) : 0}
             </p>
             <p className="text-xs text-slate-400 mt-1">Daily average</p>
          </div>
      </div>
    </div>
  );
};

export default Trends;