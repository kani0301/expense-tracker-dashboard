import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, Budget, SavingsGoal, AppNotification, spendingInsight } from '../types.js';

interface AppContextType {
  user: Omit<User, 'passwordHash'> | null;
  token: string | null;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  notifications: AppNotification[];
  insights: spendingInsight | null;
  loadingInsights: boolean;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  changePassword: (oldP: string, newP: string) => Promise<{ success: boolean; error?: string }>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'transaction_id' | 'user_id'>) => Promise<boolean>;
  editTransaction: (id: string, tx: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  fetchBudgets: () => Promise<void>;
  saveBudget: (category: string, amount: number) => Promise<boolean>;
  deleteBudget: (category: string) => Promise<boolean>;
  fetchGoals: () => Promise<void>;
  addGoal: (g: Omit<SavingsGoal, 'goal_id' | 'user_id'>) => Promise<boolean>;
  updateGoal: (id: string, g: Partial<SavingsGoal>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<boolean>;
  clearAllNotifications: () => Promise<boolean>;
  getGeminiInsights: () => Promise<void>;
  triggerLocalNotification: (title: string, msg: string, type: 'info' | 'warning' | 'success') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('expense_tracker_token'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [insights, setInsights] = useState<spendingInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') || 'light');

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Sync initial theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Request driver helper
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    const res = await fetch(endpoint, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    return res.json();
  };

  // Check current profile on boot
  useEffect(() => {
    if (token) {
      apiFetch('/api/auth/me')
        .then(data => {
          setUser(data.user);
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  // Load contextual data when user is present
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    await Promise.allSettled([
      fetchTransactions(),
      fetchBudgets(),
      fetchGoals(),
      fetchNotifications()
    ]);
  };

  const login = async (email: string, passwordPlain: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordPlain })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };

      localStorage.setItem('expense_tracker_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server communication failed' };
    }
  };

  const register = async (name: string, email: string, passwordPlain: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: passwordPlain })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Registration failed' };

      localStorage.setItem('expense_tracker_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server communication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('expense_tracker_token');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setNotifications([]);
    setInsights(null);
  };

  const updateProfile = async (name: string, email: string) => {
    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email })
      });
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const changePassword = async (oldP: string, newP: string) => {
    try {
      await apiFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: oldP, newPassword: newP })
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // --- TRANS OPERATIONS ---
  const fetchTransactions = async () => {
    try {
      const list = await apiFetch('/api/transactions');
      setTransactions(list);
    } catch (e) {
      console.error(e);
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'transaction_id' | 'user_id'>) => {
    try {
      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(tx)
      });
      await fetchTransactions();
      await fetchNotifications(); // pull new automatic budget warnings
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const editTransaction = async (id: string, tx: Partial<Transaction>) => {
    try {
      await apiFetch(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tx)
      });
      await fetchTransactions();
      await fetchNotifications();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiFetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });
      await fetchTransactions();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // --- BUDGETS ---
  const fetchBudgets = async () => {
    try {
      const list = await apiFetch('/api/budgets');
      setBudgets(list);
    } catch (e) {
      console.error(e);
    }
  };

  const saveBudget = async (category: string, amount: number) => {
    try {
      await apiFetch('/api/budgets', {
        method: 'POST',
        body: JSON.stringify({ category, limit_amount: amount })
      });
      await fetchBudgets();
      await fetchNotifications();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteBudget = async (category: string) => {
    try {
      await apiFetch(`/api/budgets/${encodeURIComponent(category)}`, {
        method: 'DELETE'
      });
      await fetchBudgets();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // --- GOALS ---
  const fetchGoals = async () => {
    try {
      const list = await apiFetch('/api/goals');
      setGoals(list);
    } catch (e) {
      console.error(e);
    }
  };

  const addGoal = async (g: Omit<SavingsGoal, 'goal_id' | 'user_id'>) => {
    try {
      await apiFetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify(g)
      });
      await fetchGoals();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateGoal = async (id: string, g: Partial<SavingsGoal>) => {
    try {
      await apiFetch(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(g)
      });
      await fetchGoals();
      await fetchNotifications();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await apiFetch(`/api/goals/${id}`, {
        method: 'DELETE'
      });
      await fetchGoals();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // --- NOTIFICATIONS ---
  const fetchNotifications = async () => {
    try {
      const list = await apiFetch('/api/notifications');
      setNotifications(list);
    } catch (e) {
      console.error(e);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, read: true } : n)
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiFetch('/api/notifications', {
        method: 'DELETE'
      });
      setNotifications([]);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const triggerLocalNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const localNotif: AppNotification = {
      notification_id: 'local-' + Date.now(),
      user_id: user?.user_id || 'anonymous',
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [localNotif, ...prev]);
  };

  // --- GEMINI INSIGHTS ---
  const getGeminiInsights = async () => {
    setLoadingInsights(true);
    try {
      const data = await apiFetch('/api/insights');
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Load insights initial when user changes if insights empty
  useEffect(() => {
    if (user && !insights) {
      getGeminiInsights();
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      user, token, transactions, budgets, goals, notifications, insights, loadingInsights, theme, setTheme,
      login, register, logout, updateProfile, changePassword,
      fetchTransactions, addTransaction, editTransaction, deleteTransaction,
      fetchBudgets, saveBudget, deleteBudget,
      fetchGoals, addGoal, updateGoal, deleteGoal,
      fetchNotifications, markNotificationRead, clearAllNotifications,
      getGeminiInsights, triggerLocalNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};
