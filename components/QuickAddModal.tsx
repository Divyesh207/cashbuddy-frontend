import React, { useState } from 'react';
import { X, Plus, DollarSign, Tag, FileText, CheckCircle, Loader } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';

interface QuickAddModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = [
    "Food", "Travel", "Shopping", "Entertainment", "Utilities", "Health", "Education", "Salary", "Investment", "Other"
];

const QuickAddModal: React.FC<QuickAddModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [type, setType] = useState<'Income' | 'Expense'>('Expense');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !amount) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/transactions?user_id=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description || category,
                    amount: parseFloat(amount),
                    type,
                    category,
                    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString()
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert("Failed to add transaction");
            }
        } catch (err) {
            console.error(err);
            alert("Error processing request");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl rounded-b-none sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up transform transition-all border-t border-white/20 dark:border-slate-700 sm:border"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 flex items-center justify-between">
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>

                    <h2 className="text-2xl font-display font-bold text-white relative z-10">Quick Add</h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors relative z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Amount</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-bold text-lg">₹</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                autoFocus
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl text-3xl font-bold text-slate-900 dark:text-white outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('Expense')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'Expense'
                                ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('Income')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'Income'
                                ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    {/* Category & Description */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl appearance-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Description</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Coffee, Taxi..."
                                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transform active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Save Transaction</span>
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default QuickAddModal;
