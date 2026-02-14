import React from 'react';
import { LayoutDashboard, CreditCard, Sparkles, History, Search, Filter, PieChart, ArrowUpCircle, ArrowDownCircle, Wallet, Moon, Menu, Play } from 'lucide-react';
import { useTour } from '../context/TourContext';

const Help = () => {
    const { startTour } = useTour();

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="text-center space-y-4 py-8 relative">
                <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                    Welcome to <span className="text-emerald-500">Cashbuddy</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Your ultimate personal finance companion. Here's how to make the most of your new financial dashboard.
                </p>

                <button
                    onClick={startTour}
                    className="mt-6 inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                >
                    <Play className="w-5 h-5 mr-2" fill="currentColor" />
                    Start Interactive Tour
                </button>
            </div>

            {/* Section 1: Dashboard */}
            <section className="glass-card p-8 border-l-4 border-l-emerald-500">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-4">
                    <LayoutDashboard className="w-6 h-6 mr-3 text-emerald-500" />
                    1. The Dashboard
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Your command center gives you an instant snapshot of your month.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                            <ArrowUpCircle className="w-4 h-4" /> <span>Total Income</span>
                        </div>
                        <p className="text-xs text-slate-500">Your total earnings (Salary, etc.)</p>
                    </div>
                    <div className="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800">
                        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold mb-2">
                            <ArrowDownCircle className="w-4 h-4" /> <span>Total Expenses</span>
                        </div>
                        <p className="text-xs text-slate-500">Everything you've spent this month.</p>
                    </div>
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                            <Wallet className="w-4 h-4" /> <span>Net Balance</span>
                        </div>
                        <p className="text-xs text-slate-500">Income minus Expenses.</p>
                    </div>
                </div>
            </section>

            {/* Section 2: Transactions & Magic Import */}
            <section className="glass-card p-8 border-l-4 border-l-indigo-500">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-4">
                    <CreditCard className="w-6 h-6 mr-3 text-indigo-500" />
                    2. Managing Transactions
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                            Magic Import (AI Powered)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-3">
                            Don't type manually! Just copy your bank SMS and paste it into the <b>Magic Import</b> tool.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-400 mb-3">
                            "Paid Rs 140 to Zomato via UPI on 12-02-26" <span className="text-emerald-500">→</span> <span className="font-bold text-slate-900 dark:text-white">Food, ₹140.00</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Supports <b>UPI</b>, <b>Card</b>, and <b>Bank Credit</b> messages.</li>
                            <li>Auto-detects <b>Date</b>, <b>Merchant</b>, and <b>Amount</b>.</li>
                            <li>Lets you <b>Review</b> before saving.</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                                <Search className="w-4 h-4 mr-2" /> Search
                            </h4>
                            <p className="text-sm text-slate-500">Find any transaction by description (e.g., "Uber") or amount.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                                <Filter className="w-4 h-4 mr-2" /> Filters
                            </h4>
                            <p className="text-sm text-slate-500">Filter by <b>Category</b> (Food, Travel) or <b>Specific Date</b>.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: History & Insights */}
            <section className="glass-card p-8 border-l-4 border-l-purple-500">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-4">
                    <History className="w-6 h-6 mr-3 text-purple-500" />
                    3. Financial History
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Dive deep into your past spending habits on the History page.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <PieChart className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Spending Breakdown</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                A visual pie chart shows you exactly where your money went (e.g., 40% Food).
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Menu className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Monthly Archives</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                Transactions are grouped by month and date for easy browsing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Tips */}
            <section className="glass-card p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <h2 className="text-xl font-bold flex items-center mb-4">
                    <Moon className="w-5 h-5 mr-3 text-yellow-400" />
                    Pro Tip: Dark Mode
                </h2>
                <p className="text-slate-300 mb-0">
                    Cashbuddy looks stunning in the dark. Click the <Moon className="w-4 h-4 inline mx-1" /> icon in the sidebar to toggle themes.
                </p>
            </section>
        </div>
    );
};

export default Help;
