import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Users, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, Trash2, X, ArrowLeft, ChevronRight, Wallet } from 'lucide-react';
import { API_URL } from '../constants';
import { useAuth } from '../context/AuthContext';
import { DebtItem } from '../types';

interface FriendSummary {
    name: string;
    totalLent: number;
    totalBorrowed: number;
    net: number;
    count: number;
    lastActivity: string;
}

const Debts = () => {
    const { user } = useAuth();
    const [debts, setDebts] = useState<DebtItem[]>([]);
    const [globalTotals, setGlobalTotals] = useState({ lent: 0, borrowed: 0, net: 0 });
    const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
    const [settleAmount, setSettleAmount] = useState('');

    // New Debt Form
    const [newDebt, setNewDebt] = useState({
        friend_name: '',
        type: 'FRIEND_OWES_ME',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchDebts = () => {
        if (!user?.id) return;
        fetch(`${API_URL}/debts?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setDebts(data.debts);
                setGlobalTotals({
                    lent: data.total_lent,
                    borrowed: data.total_borrowed,
                    net: data.net_balance
                });
            });
    };

    useEffect(() => { fetchDebts(); }, [user]);

    // Group debts by friend
    const friendsData = useMemo(() => {
        const map: Record<string, FriendSummary> = {};

        debts.forEach(d => {
            const name = d.friend_name;
            if (!map[name]) {
                map[name] = { name, totalLent: 0, totalBorrowed: 0, net: 0, count: 0, lastActivity: d.date };
            }

            // Update date if newer
            if (new Date(d.date) > new Date(map[name].lastActivity)) {
                map[name].lastActivity = d.date;
            }

            if (d.status !== 'SETTLED') {
                if (d.type === 'FRIEND_OWES_ME') map[name].totalLent += d.amount;
                else map[name].totalBorrowed += d.amount;
            }
            map[name].count++;
        });

        // Calculate Nets
        Object.values(map).forEach(f => {
            f.net = f.totalLent - f.totalBorrowed;
        });

        // Convert to array and sort by most recent activity
        return Object.values(map).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    }, [debts]);

    const handleCreate = async () => {
        if (!user?.id) return;
        if (!newDebt.friend_name || !newDebt.amount) return alert("Name and amount required");

        await fetch(`${API_URL}/debts?user_id=${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newDebt,
                amount: parseFloat(newDebt.amount)
            })
        });

        setShowModal(false);
        // Reset but keep friend name if we are in detail view
        setNewDebt({
            friend_name: selectedFriend || '',
            type: 'FRIEND_OWES_ME',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        fetchDebts();
    };

    const openSettleModal = (debt: DebtItem) => {
        setSelectedDebt(debt);
        setSettleAmount(debt.amount.toString());
        setShowSettleModal(true);
    };

    const handleSettle = async () => {
        if (!user?.id || !selectedDebt) return;

        const payment = parseFloat(settleAmount);
        const newAmount = selectedDebt.amount - payment;
        const status = newAmount <= 0 ? 'SETTLED' : 'PARTIALLY_PAID';
        const finalAmount = Math.max(0, newAmount);

        await fetch(`${API_URL}/debts/${selectedDebt.id}?user_id=${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: finalAmount, status })
        });

        setShowSettleModal(false);
        fetchDebts();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this record?")) return;
        await fetch(`${API_URL}/debts/${id}`, { method: 'DELETE' });
        fetchDebts();
    };

    const openAddModal = () => {
        setNewDebt(prev => ({ ...prev, friend_name: selectedFriend || '' }));
        setShowModal(true);
    };

    // --- RENDER HELPERS ---

    const renderGlobalStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                <div className="flex items-center space-x-2 mb-2 opacity-90">
                    <ArrowUpRight className="w-5 h-5" />
                    <span className="font-medium">Total Lent</span>
                </div>
                <p className="text-3xl font-bold">₹{globalTotals.lent}</p>
                <p className="text-emerald-100 text-sm mt-1">Friends owe you</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg shadow-red-200 dark:shadow-none">
                <div className="flex items-center space-x-2 mb-2 opacity-90">
                    <ArrowDownLeft className="w-5 h-5" />
                    <span className="font-medium">Total Borrowed</span>
                </div>
                <p className="text-3xl font-bold">₹{globalTotals.borrowed}</p>
                <p className="text-red-100 text-sm mt-1">You owe friends</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Net Balance</p>
                <p className={`text-3xl font-bold ${globalTotals.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {globalTotals.net >= 0 ? '+' : '-'}₹{Math.abs(globalTotals.net)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Credit - Debit</p>
            </div>
        </div>
    );

    const renderFriendsList = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Friends</h2>
                    <p className="text-slate-500 dark:text-slate-400">Select a friend to view ledger.</p>
                </div>
                <button
                    id="debts-add-btn"
                    onClick={openAddModal}
                    className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden md:inline">Add Record</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {friendsData.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center group hover:border-emerald-500/50 transition-colors">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-full mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Debts Recorded</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                            Lent money for lunch? Borrowed for a cab? <br />
                            Track it here to keep your friendships stress-free.
                        </p>
                        <button
                            onClick={openAddModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:-translate-y-1"
                        >
                            Add Your First Record
                        </button>
                    </div>
                )}

                {friendsData.map((friend) => (
                    <div
                        key={friend.name}
                        onClick={() => setSelectedFriend(friend.name)}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-600 dark:text-slate-300">
                                    {friend.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{friend.name}</h3>
                                    <p className="text-xs text-slate-400">{new Date(friend.lastActivity).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Net Balance</span>
                                <span className={`font-bold ${friend.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {friend.net >= 0 ? '+' : '-'}₹{Math.abs(friend.net)}
                                </span>
                            </div>
                            {friend.totalLent > 0 && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Owes you</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">₹{friend.totalLent}</span>
                                </div>
                            )}
                            {friend.totalBorrowed > 0 && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">You owe</span>
                                    <span className="text-red-600 dark:text-red-400 font-medium">₹{friend.totalBorrowed}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFriendDetail = () => {
        const friendStats = friendsData.find(f => f.name === selectedFriend);
        const friendTransactions = debts.filter(d => d.friend_name === selectedFriend);

        return (
            <div className="animate-fade-in space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedFriend(null)}
                        className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to List</span>
                    </button>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedFriend}</h2>
                    <button
                        onClick={openAddModal}
                        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden md:inline">Add Record</span>
                    </button>
                </div>

                {/* Friend Stats Cards */}
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 md:p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                        <p className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">They Owe You</p>
                        <p className="text-sm md:text-xl font-bold text-emerald-700 dark:text-emerald-300">₹{friendStats?.totalLent || 0}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 md:p-4 rounded-xl border border-red-100 dark:border-red-800 text-center">
                        <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-bold uppercase">You Owe Them</p>
                        <p className="text-sm md:text-xl font-bold text-red-700 dark:text-red-300">₹{friendStats?.totalBorrowed || 0}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 md:p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Net Balance</p>
                        <p className={`text-sm md:text-xl font-bold ${(friendStats?.net || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {(friendStats?.net || 0) >= 0 ? '+' : '-'}₹{Math.abs(friendStats?.net || 0)}
                        </p>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Transaction History</h3>
                    {friendTransactions.length === 0 && <p className="text-slate-500">No transactions found.</p>}

                    {friendTransactions.map(debt => (
                        <div key={debt.id} className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
                                <div className={`p-3 rounded-full flex-shrink-0 ${debt.type === 'FRIEND_OWES_ME' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {debt.type === 'FRIEND_OWES_ME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{debt.description || (debt.type === 'FRIEND_OWES_ME' ? 'Lent Money' : 'Borrowed Money')}</h3>
                                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(debt.date).toLocaleDateString()}</span>
                                        {debt.status === 'SETTLED' && <span className="text-emerald-500 font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Settled</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <p className={`text-xl font-bold ${debt.type === 'FRIEND_OWES_ME' ? 'text-emerald-600' : 'text-red-600'}`}>₹{debt.amount}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">{debt.type === 'FRIEND_OWES_ME' ? 'You Lent' : 'You Borrowed'}</p>
                                </div>

                                {debt.status !== 'SETTLED' && (
                                    <button
                                        onClick={() => openSettleModal(debt)}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                        title="Settle"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(debt.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!selectedFriend && renderGlobalStats()}
            {selectedFriend ? renderFriendDetail() : renderFriendsList()}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Record</h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${newDebt.type === 'FRIEND_OWES_ME' ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
                                    onClick={() => setNewDebt({ ...newDebt, type: 'FRIEND_OWES_ME' })}
                                >
                                    They Owe Me
                                </button>
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${newDebt.type === 'I_OWE_FRIEND' ? 'bg-white dark:bg-slate-600 shadow-sm text-red-600 dark:text-red-400' : 'text-slate-500'}`}
                                    onClick={() => setNewDebt({ ...newDebt, type: 'I_OWE_FRIEND' })}
                                >
                                    I Owe Them
                                </button>
                            </div>

                            <input
                                id="debt-friend-name"
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                placeholder="Friend's Name"
                                value={newDebt.friend_name}
                                onChange={e => setNewDebt({ ...newDebt, friend_name: e.target.value })}
                                disabled={!!selectedFriend} // Disable editing if inside friend view
                            />

                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400">₹</span>
                                <input
                                    id="debt-amount"
                                    type="number"
                                    className="w-full pl-8 p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="Amount"
                                    value={newDebt.amount}
                                    onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                                />
                            </div>

                            <input
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                placeholder="Description (Optional)"
                                value={newDebt.description}
                                onChange={e => setNewDebt({ ...newDebt, description: e.target.value })}
                            />

                            <input
                                type="date"
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                value={newDebt.date}
                                onChange={e => setNewDebt({ ...newDebt, date: e.target.value })}
                            />

                            <button id="debt-save-btn" onClick={handleCreate} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none mt-2">
                                Save Record
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settle Modal */}
            {showSettleModal && selectedDebt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700">
                        <div className="text-center mb-6">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full inline-block mb-3">
                                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Settle Debt</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {selectedDebt.type === 'FRIEND_OWES_ME' ? `${selectedDebt.friend_name} is paying you` : `You are paying ${selectedDebt.friend_name}`}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Amount to settle</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white text-lg font-bold"
                                        value={settleAmount}
                                        onChange={e => setSettleAmount(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Total outstanding: ₹{selectedDebt.amount}
                                </p>
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button onClick={() => setShowSettleModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium">Cancel</button>
                                <button onClick={handleSettle} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Debts;