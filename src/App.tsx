import React, { useState } from 'react';
import { AppProvider, useAppState } from './context/AppContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { AuthView } from './components/AuthView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { BudgetsView } from './components/BudgetsView.tsx';
import { SavingsView } from './components/SavingsView.tsx';
import { AIInsightsView } from './components/AIInsightsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { Wallet, Menu, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const AppContent: React.FC = () => {
  const { user } = useAppState();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Financial Analytics';
      case 'transactions': return 'Audit Ledger';
      case 'budgets': return 'Budget Boundaries';
      case 'goals': return 'Savings Planner';
      case 'insights': return 'AI Personalized Insights';
      case 'reports': return 'Financial Declarations';
      case 'profile': return 'Credentials Management';
      default: return 'Finance Manager';
    }
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView setCurrentTab={setCurrentTab} />;
      case 'transactions':
        return <TransactionsView />;
      case 'budgets':
        return <BudgetsView />;
      case 'goals':
        return <SavingsView />;
      case 'insights':
        return <AIInsightsView />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView setCurrentTab={setCurrentTab} />;
    }
  };

  // If session authorization is vacant, lock access to application behind the Auth panel
  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* GLOWING MESH AMBIENCE BACKDROPS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-650/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-650/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[10%] w-[45%] h-[45%] rounded-full bg-emerald-500/8 blur-[125px] pointer-events-none z-0" />
      <div className="absolute bottom-[25%] left-[20%] w-[35%] h-[35%] rounded-full bg-indigo-500/8 blur-[110px] pointer-events-none z-0" />

      {/* SIDEBAR FOR DESKTOP */}
      <div className="hidden lg:block relative z-10">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>

      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden h-16 bg-slate-950/45 backdrop-blur-lg border-b border-white/10 flex items-center justify-between px-4 fixed top-0 left-0 w-full z-30 transition-all">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <Wallet className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm tracking-tight text-white font-display">SaaS Ledger</span>
        </div>

        <button
          id="mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-350 cursor-pointer active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* MOBILE DRAWER SIDEBAR PANEL */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* backdrop */}
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={(t) => { setCurrentTab(t); setMobileSidebarOpen(false); }} 
            isMobile={true}
          />
        </div>
      )}

      {/* CENTRAL SCROLL CANVASS */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen transition-all relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          
          {/* INNER VIEWPORT GAUGE TRANSITIONS */}
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pb-12"
          >
            {renderActiveView()}
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
