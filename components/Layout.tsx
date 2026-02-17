import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, PieChart, Target, Zap, LogOut, Wallet, Bell, History, Moon, Sun, Users, Check, Menu, X, HelpCircle, Search, Settings, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTour } from '../context/TourContext';
import TourGuide from './TourGuide';
import QuickAddModal from './QuickAddModal';
import { API_URL } from '../constants';
import { Notification } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Tour State
  const { isTourActive, endTour, startTour } = useTour();

  const fetchNotifications = () => {
    if (user?.id) {
      fetch(`${API_URL}/notifications?user_id=${user.id}`)
        .then(res => res.json())
        .then(setNotifications);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Check for onboarding flag on mount
  useEffect(() => {
    const needsOnboarding = localStorage.getItem('need_onboarding');
    if (needsOnboarding === 'true') {
      startTour();
      localStorage.removeItem('need_onboarding'); // Clear flag so it doesn't run every refresh
    }
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const markAsRead = async (id: number) => {
    if (!user?.id) return;
    await fetch(`${API_URL}/notifications/${id}/read?user_id=${user.id}`, { method: 'PUT' });
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    await fetch(`${API_URL}/notifications/read/all?user_id=${user.id}`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/debts', label: 'Friend Ledger', icon: Users },
    { path: '/history', label: 'History', icon: History },
    { path: '/categories', label: 'Categories', icon: PieChart },
    { path: '/savings', label: 'Savings Goals', icon: Target },
    { path: '/budget', label: 'Insights', icon: Zap },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-100">

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-400 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full blur-[128px]"></div>
      </div>

      {/* Tour Guide Overlay */}
      <TourGuide />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-4 left-4 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col transition-all duration-500 ease-out
        ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'} md:translate-x-0 md:opacity-100 md:relative md:inset-0 md:h-auto md:m-4
      `}>
        <div className="p-8 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">CashBuddy</span>
            </div>
          </Link>
          {/* Close button for mobile inside sidebar */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const id = item.label === 'Transactions' ? 'nav-transactions' :
              item.label === 'History' ? 'nav-history' :
                item.label === 'Friend Ledger' ? 'nav-debts' :
                  item.label === 'Categories' ? 'nav-categories' :
                    item.label === 'Savings Goals' ? 'nav-savings' :
                      item.label === 'Insights' ? 'nav-budget' : undefined;
            return (
              <Link
                key={item.path}
                to={item.path}
                id={id}
                className={`relative group flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                )}
                <item.icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'group-hover:text-emerald-500'}`} />
                <span>{item.label}</span>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-50 to-transparent opacity-0 group-hover:opacity-10 dark:from-emerald-900/20 transition-opacity duration-300" />
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-4 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-blue-500">{user?.full_name.charAt(0)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/help"
              id="nav-help"
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all duration-300 block"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative h-screen overflow-y-auto overflow-x-hidden flex flex-col pb-24 md:pb-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Glass Header */}
        <header className="h-20 px-6 md:px-10 flex items-center justify-between z-30 sticky top-0 transition-all duration-300">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Hidden as we have Bottom Nav */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white capitalize">
                {location.pathname === '/dashboard' || location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                Manage your finances with ease
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar Removed as per user request */}

            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-emerald-500 transition-all duration-300"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifPanel && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifPanel(false)} />
                <div className="absolute right-0 top-16 w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center text-slate-400">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                          <Bell className="w-6 h-6 opacity-40" />
                        </div>
                        <p className="text-slate-900 dark:text-white font-semibold">All caught up!</p>
                        <p className="text-xs mt-1">No new notifications for now.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 group relative ${!n.is_read ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                              {new Date(n.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {!n.is_read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                      View All History
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-20 custom-scrollbar relative z-10">
          <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            {children}
          </div>
        </div>



        {/* Quick Add FAB */}
        <button
          onClick={() => setShowQuickAdd(true)}
          className="hidden md:block fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white p-4 rounded-full shadow-lg hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Quick Add
          </span>
        </button>

        {showQuickAdd && (
          <QuickAddModal
            onClose={() => setShowQuickAdd(false)}
            onSuccess={() => {
              // Trigger a global refresh if possible, or just close
              // In a real app we might use a context to trigger refetch
              fetchNotifications(); // Optimistic refresh of something
            }}
          />
        )}
      </main>
      {/* Bottom Navigation Bar for Mobile */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-2 md:hidden safe-area-bottom pb-safe transition-all duration-300 ${isSidebarOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="flex justify-around items-center">
          <Link to="/dashboard" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location.pathname === '/dashboard' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
            <LayoutDashboard size={24} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Overview</span>
          </Link>

          <Link to="/transactions" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location.pathname === '/transactions' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
            <CreditCard size={24} strokeWidth={location.pathname === '/transactions' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Txns</span>
          </Link>

          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex flex-col items-center justify-center -mt-8 relative group"
          >
            <div className="absolute inset-0 rounded-full group-hover:bg-emerald-500/10 transition-all duration-500"></div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white transform active:scale-95 transition-transform relative z-10 border-4 border-slate-50 dark:border-slate-950">
              <Plus size={28} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-medium mt-1 text-emerald-500 font-bold">Add</span>
          </button>

          <Link to="/budget" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location.pathname === '/budget' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
            <Zap size={24} strokeWidth={location.pathname === '/budget' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Budget</span>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isSidebarOpen ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Menu size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium mt-1">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;