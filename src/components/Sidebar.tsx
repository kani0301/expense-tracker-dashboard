import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Percent, 
  PiggyBank, 
  Sparkles, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  Wallet,
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, isMobile = false }) => {
  const { user, logout, theme, setTheme, notifications, markNotificationRead, clearAllNotifications } = useAppState();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', name: 'Budgets Mapping', icon: Percent },
    { id: 'goals', name: 'Savings Goals', icon: PiggyBank },
    { id: 'insights', name: 'AI Advisory Insights', icon: Sparkles, badge: true },
    { id: 'reports', name: 'Financial Reports', icon: FileText },
    { id: 'profile', name: 'Profile Admin', icon: UserIcon },
  ];

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      default: return <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
    }
  };

  return (
    <>
      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`w-64 bg-[#080d1a]/80 backdrop-blur-xl border-r border-white/10 flex-col h-screen fixed top-0 left-0 z-20 transition-all duration-300 ${isMobile ? 'flex' : 'hidden lg:flex'}`}>
        {/* LOGO */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-400">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Wallet className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-bold text-lg font-display tracking-tight text-white">
              SaaS Ledger
            </span>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="p-4 mx-4 my-3 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-3 border border-white/10 transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center border border-emerald-500/30 shadow-inner">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate font-sans">
              {user?.name || 'Authorized User'}
            </h4>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer font-sans ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-300 border-l-2 border-emerald-400 shadow-lg shadow-emerald-500/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="font-sans">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full uppercase border border-amber-500/30">
                    GenAI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM UTILITY ACTIONS */}
        <div className="p-4 border-t border-white/10 space-y-2 flex flex-col">
          {/* NOTIFICATION TRIGGER */}
          <button
            onClick={() => setShowNotifications(true)}
            className="w-full relative flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-sans"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce border border-[#0d1527]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* THEME CONTROL */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-sans"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-amber-450" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 capitalize">{theme}</span>
          </button>

          <button
            id="logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer font-sans mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* NOTIFICATIONS SLIDEOVER PANEL */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/65 z-40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 22 }}
              className="fixed top-0 right-0 h-screen w-96 bg-[#090e1a]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white font-display text-base">
                    App Notifications
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-450"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-450">
                    <p className="text-sm font-sans">All caught up! No recent alerts.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.notification_id}
                      className={`p-3.5 rounded-2xl border flex gap-3 align-start transition-all ${
                        notif.read
                          ? 'bg-white/5 border-white/5'
                          : 'bg-emerald-500/5 border-emerald-500/20 shadow-sm relative'
                      }`}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-white font-sans truncate pr-4">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationRead(notif.notification_id)}
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 font-mono flex-shrink-0 cursor-pointer border border-emerald-500/20 px-2 py-0.5 rounded-md bg-emerald-500/10"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-350 font-sans leading-relaxed mb-1.5">
                          {notif.message}
                        </p>
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <button
                    onClick={clearAllNotifications}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
                  >
                    Clear All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
