import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';

interface MagicImportModalProps {
    onClose: () => void;
    onSuccess: (data: any) => void;
}

const MagicImportModal: React.FC<MagicImportModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [magicText, setMagicText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleMagicImport = async () => {
        if (!user?.id || !magicText.trim()) return;
        setIsLoading(true);
        try {
            // 1. Dry Run to get parsed data
            const res = await fetch(`${API_URL}/transactions/import?user_id=${user.id}&dry_run=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: magicText })
            });
            const data = await res.json();

            onSuccess(data);
            onClose();
        } catch (e) {
            console.error("Import error", e);
            alert("Failed to parse SMS.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 animate-fade-in">
            <div id="magic-modal-content" className="bg-white dark:bg-slate-900 p-8 rounded-t-3xl rounded-b-none sm:rounded-3xl w-full max-w-lg shadow-2xl border-t border-white/20 dark:border-slate-700 sm:border transform transition-all scale-100 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Magic Import</h3>
                            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">AI Powered</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Paste your bank SMS or transaction text below. Our AI will automatically extract the <span className="font-bold text-slate-900 dark:text-white">amount</span>, <span className="font-bold text-slate-900 dark:text-white">date</span>, and <span className="font-bold text-slate-900 dark:text-white">category</span> for you.
                    </p>
                </div>

                <textarea
                    className="w-full h-32 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none resize-none text-base text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 transition-all placeholder-slate-400"
                    placeholder="e.g., 'Sent Rs. 350 to Uber via UPI on 22-10-2023'"
                    value={magicText}
                    onChange={(e) => setMagicText(e.target.value)}
                    autoFocus
                ></textarea>

                <button
                    onClick={handleMagicImport}
                    disabled={isLoading}
                    className={`w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex justify-center items-center space-x-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isLoading ? (
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    ) : (
                        <Sparkles className="w-5 h-5" />
                    )}
                    <span>{isLoading ? 'Processing...' : 'Extract & Review'}</span>
                </button>
            </div>
        </div>
    );
};

export default MagicImportModal;
