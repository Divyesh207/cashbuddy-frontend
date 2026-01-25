import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, PieChart, Target, Zap, LogOut, Wallet, Bell, History, Moon, Sun, Users, Check, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Chatbot from './Chatbot';
import { API_URL } from '../constants';
import { Notification } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/debts', label: 'Friend Ledger', icon: Users },
    { path: '/history', label: 'History', icon: History },
    { path: '/categories', label: 'Categories', icon: PieChart },
    { path: '/savings', label: 'Savings Goals', icon: Target },
    { path: '/budget', label: 'Insights', icon: Zap },
  ];
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CashBuddy</span>
          </div>
          {/* Close button for mobile inside sidebar */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
             onClick={toggleTheme}
             className="flex items-center space-x-3 text-slate-400 hover:text-yellow-400 px-2 transition-colors w-full mb-4"
          >
             {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
              {user?.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-slate-400 hover:text-red-400 px-2 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto relative h-screen transition-all duration-300 w-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 sticky top-0 z-20 bg-slate-50 dark:bg-slate-900 py-2">
           <div className="flex items-center gap-3">
               {/* Mobile Menu Button */}
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 -ml-2 text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
               >
                 <Menu className="w-6 h-6" />
               </button>
               <h1 className="text-xl font-semibold capitalize text-slate-900 dark:text-white">{location.pathname.replace('/', '') || 'Dashboard'}</h1>
           </div>

           <div className="flex items-center space-x-4 relative">
             <button 
               onClick={() => setShowNotifPanel(!showNotifPanel)}
               className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
             >
               <Bell className="w-6 h-6" />
               {unreadCount > 0 && (
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
               )}
             </button>
             
             {/* Notification Dropdown */}
             {showNotifPanel && (
               <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in">
                 <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-600 flex justify-between items-center">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                    {unreadCount > 0 && <span className="text-xs bg-red-500 text-white px-1.5 rounded-full">{unreadCount}</span>}
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                   {notifications.length === 0 ? (
                     <div className="p-4 text-center text-slate-500 text-sm">No new notifications</div>
                   ) : (
                     notifications.map(n => (
                       <div key={n.id} className={`p-3 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex justify-between items-start ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                         <div className="flex-1">
                           <p className={`text-sm font-medium ${!n.is_read ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{n.title}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                           <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                         </div>
                         {!n.is_read && (
                           <button onClick={() => markAsRead(n.id)} className="ml-2 text-slate-400 hover:text-emerald-500" title="Mark as read">
                             <Check size={16} />
                           </button>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}
           </div>
        </header>

        {children}
      </main>

      <Chatbot />
    </div>
  );
};

export default Layout;