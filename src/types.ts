export interface User {
  user_id: string;
  name: string;
  email: string;
  passwordHash: string;
  created_at: string;
}

export interface Transaction {
  transaction_id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface Budget {
  user_id: string;
  category: string;
  limit_amount: number;
}

export interface SavingsGoal {
  goal_id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

export interface spendingInsight {
  healthScore: number; // 0 to 100
  overallAssessment: string;
  recommendations: {
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
    category?: string;
  }[];
}

export interface AppNotification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  created_at: string;
  read: boolean;
}

export interface AppSchema {
  users: User[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  notifications: AppNotification[];
}

export interface AuthResponse {
  user: {
    user_id: string;
    name: string;
    email: string;
  };
  token: string;
}
