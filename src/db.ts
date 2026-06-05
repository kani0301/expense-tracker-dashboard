import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppSchema, User, Transaction, Budget, SavingsGoal, AppNotification } from './types.js';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Default initial database schema with rich seed data for a great demo experience
const createDefaultDB = (): AppSchema => {
  const demoUserId = 'demo-user-id';
  const salt = crypto.randomBytes(16).toString('hex');
  const demoPasswordHash = crypto.pbkdf2Sync('password123', salt, 1000, 64, 'sha512').toString('hex') + ':' + salt;

  return {
    users: [
      {
        user_id: demoUserId,
        name: 'Alex Mercer',
        email: 'alex@example.com',
        passwordHash: demoPasswordHash,
        created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
      }
    ],
    transactions: [
      // Current Month Income
      {
        transaction_id: 't1',
        user_id: demoUserId,
        title: 'Monthly Salary',
        amount: 5500,
        category: 'Investment',
        type: 'income',
        date: new Date().toISOString().substring(0, 10),
        description: 'Primary job monthly payout'
      },
      {
        transaction_id: 't2',
        user_id: demoUserId,
        title: 'Freelance Design Werk Code',
        amount: 1500,
        category: 'Other',
        type: 'income',
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'SaaS dashboard frontend design delivery'
      },
      // Current Month Expenses
      {
        transaction_id: 't3',
        user_id: demoUserId,
        title: 'Whole Foods Groceries',
        amount: 320,
        category: 'Food',
        type: 'expense',
        date: new Date().toISOString().substring(0, 10),
        description: 'Weekly organic pantry load'
      },
      {
        transaction_id: 't4',
        user_id: demoUserId,
        title: 'Uber Ride City Center',
        amount: 45,
        category: 'Travel',
        type: 'expense',
        date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'Meeting clients downtown'
      },
      {
        transaction_id: 't5',
        user_id: demoUserId,
        title: 'Nordstrom Shopping',
        amount: 450,
        category: 'Shopping',
        type: 'expense',
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'Designer winter jacket'
      },
      {
        transaction_id: 't6',
        user_id: demoUserId,
        title: 'Netflix & Spotify Premium',
        amount: 29.99,
        category: 'Entertainment',
        type: 'expense',
        date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'Monthly streaming subscriptions'
      },
      {
        transaction_id: 't7',
        user_id: demoUserId,
        title: 'Monthly Pharmacy Refill',
        amount: 65,
        category: 'Healthcare',
        type: 'expense',
        date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'Vitamins and essentials'
      },
      {
        transaction_id: 't8',
        user_id: demoUserId,
        title: 'Udemy React Advanced Course',
        amount: 19.99,
        category: 'Education',
        type: 'expense',
        date: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'Professional development'
      },
      {
        transaction_id: 't9',
        user_id: demoUserId,
        title: 'Electric & Gas Bills',
        amount: 195,
        category: 'Bills',
        type: 'expense',
        date: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'SaaS utility payments'
      },
      {
        transaction_id: 't10',
        user_id: demoUserId,
        title: 'Downtown Studio Rent',
        amount: 1800,
        category: 'Rent',
        type: 'expense',
        date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'Rent for June month'
      },
      {
        transaction_id: 't11',
        user_id: demoUserId,
        title: 'S&P 500 Index ETF Fund',
        amount: 400,
        category: 'Investment',
        type: 'expense',
        date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        description: 'Monthly recursive portfolio investing'
      }
    ],
    budgets: [
      { user_id: demoUserId, category: 'Food', limit_amount: 500 },
      { user_id: demoUserId, category: 'Shopping', limit_amount: 300 }, // Over-budget on purpose to trigger alerts!
      { user_id: demoUserId, category: 'Travel', limit_amount: 150 },
      { user_id: demoUserId, category: 'Entertainment', limit_amount: 100 },
      { user_id: demoUserId, category: 'Bills', limit_amount: 300 }
    ],
    savingsGoals: [
      {
        goal_id: 'g1',
        user_id: demoUserId,
        goal_name: 'Tokyo Autumn Trip',
        target_amount: 5000,
        current_amount: 2800,
        target_date: '2026-10-15'
      },
      {
        goal_id: 'g2',
        user_id: demoUserId,
        goal_name: 'Emergency Nest Egg',
        target_amount: 10000,
        current_amount: 6000,
        target_date: '2026-12-31'
      }
    ],
    notifications: [
      {
        notification_id: 'n1',
        user_id: demoUserId,
        title: 'Budget Alert: Shopping',
        message: 'You have exceeded your $300 Shopping budget! Spent: $450.',
        type: 'warning',
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        read: false
      },
      {
        notification_id: 'n2',
        user_id: demoUserId,
        title: 'Savings Milestone!',
        message: 'Awesome work! Your Tokyo Autumn Trip goal is now 56% complete.',
        type: 'success',
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        read: false
      }
    ]
  };
};

export class DatabaseService {
  private static readDB(): AppSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const defaultDB = createDefaultDB();
        this.writeDB(defaultDB);
        return defaultDB;
      }
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading db.json, returning default DB', e);
      return createDefaultDB();
    }
  }

  private static writeDB(data: AppSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed writing db.json', e);
    }
  }

  // PASSWORDS HASHING UTILS (SHA-512 PBKDF2)
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${hash}:${salt}`;
  }

  public static verifyPassword(password: string, storedHash: string): boolean {
    const [hash, salt] = storedHash.split(':');
    if (!hash || !salt) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // --- USER OPERATIONS ---
  public static createUser(name: string, email: string, passwordPlain: string): User | null {
    const db = this.readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return null;

    const newUser: User = {
      user_id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      passwordHash: this.hashPassword(passwordPlain),
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    this.writeDB(db);
    return newUser;
  }

  public static getUserById(userId: string): Omit<User, 'passwordHash'> | null {
    const db = this.readDB();
    const user = db.users.find(u => u.user_id === userId);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  public static getUserByEmail(email: string): User | null {
    const db = this.readDB();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public static updateProfile(userId: string, name: string, email: string): User | null {
    const db = this.readDB();
    const idx = db.users.findIndex(u => u.user_id === userId);
    if (idx === -1) return null;

    // Email collision check
    const collisionUser = db.users.find(u => u.user_id !== userId && u.email.toLowerCase() === email.toLowerCase());
    if (collisionUser) return null;

    db.users[idx].name = name;
    db.users[idx].email = email.toLowerCase();
    this.writeDB(db);
    return db.users[idx];
  }

  public static changePassword(userId: string, passwordPlain: string): boolean {
    const db = this.readDB();
    const idx = db.users.findIndex(u => u.user_id === userId);
    if (idx === -1) return false;

    db.users[idx].passwordHash = this.hashPassword(passwordPlain);
    this.writeDB(db);
    return true;
  }

  // --- TRANSACTION OPERATIONS ---
  public static getTransactions(userId: string): Transaction[] {
    const db = this.readDB();
    return db.transactions.filter(t => t.user_id === userId);
  }

  public static createTransaction(userId: string, trans: Omit<Transaction, 'transaction_id' | 'user_id'>): Transaction {
    const db = this.readDB();
    const newTrans: Transaction = {
      ...trans,
      transaction_id: crypto.randomUUID(),
      user_id: userId
    };

    db.transactions.push(newTrans);
    this.writeDB(db);

    // After creating a trans, evaluate budget alerts asynchronously helper
    this.checkBudgetLimit(userId, newTrans.category);

    return newTrans;
  }

  public static updateTransaction(userId: string, transactionId: string, trans: Partial<Transaction>): Transaction | null {
    const db = this.readDB();
    const idx = db.transactions.findIndex(t => t.transaction_id === transactionId && t.user_id === userId);
    if (idx === -1) return null;

    db.transactions[idx] = {
      ...db.transactions[idx],
      ...trans,
      transaction_id: transactionId, // security freeze
      user_id: userId
    };

    const updated = db.transactions[idx];
    this.writeDB(db);

    // Recheck budget
    this.checkBudgetLimit(userId, updated.category);

    return updated;
  }

  public static deleteTransaction(userId: string, transactionId: string): boolean {
    const db = this.readDB();
    const lenBefore = db.transactions.length;
    db.transactions = db.transactions.filter(t => !(t.transaction_id === transactionId && t.user_id === userId));
    const success = db.transactions.length < lenBefore;
    if (success) {
      this.writeDB(db);
    }
    return success;
  }

  // --- BUDGET OPERATIONS ---
  public static getBudgets(userId: string): Budget[] {
    const db = this.readDB();
    return db.budgets.filter(b => b.user_id === userId);
  }

  public static setBudget(userId: string, category: string, limitAmount: number): Budget {
    const db = this.readDB();
    const idx = db.budgets.findIndex(b => b.user_id === userId && b.category.toLowerCase() === category.toLowerCase());

    if (idx !== -1) {
      db.budgets[idx].limit_amount = limitAmount;
    } else {
      db.budgets.push({
        user_id: userId,
        category,
        limit_amount: limitAmount
      });
    }

    this.writeDB(db);
    this.checkBudgetLimit(userId, category);
    return db.budgets.find(b => b.user_id === userId && b.category.toLowerCase() === category.toLowerCase())!;
  }

  public static deleteBudget(userId: string, category: string): boolean {
    const db = this.readDB();
    const lenBefore = db.budgets.length;
    db.budgets = db.budgets.filter(b => !(b.user_id === userId && b.category.toLowerCase() === category.toLowerCase()));
    if (db.budgets.length < lenBefore) {
      this.writeDB(db);
      return true;
    }
    return false;
  }

  // --- SAVINGS GOALS OPERATIONS ---
  public static getSavingsGoals(userId: string): SavingsGoal[] {
    const db = this.readDB();
    return db.savingsGoals.filter(g => g.user_id === userId);
  }

  public static createSavingsGoal(userId: string, goal: Omit<SavingsGoal, 'goal_id' | 'user_id'>): SavingsGoal {
    const db = this.readDB();
    const newGoal: SavingsGoal = {
      ...goal,
      goal_id: crypto.randomUUID(),
      user_id: userId
    };
    db.savingsGoals.push(newGoal);
    this.writeDB(db);
    return newGoal;
  }

  public static updateSavingsGoal(userId: string, goalId: string, updates: Partial<SavingsGoal>): SavingsGoal | null {
    const db = this.readDB();
    const idx = db.savingsGoals.findIndex(g => g.goal_id === goalId && g.user_id === userId);
    if (idx === -1) return null;

    db.savingsGoals[idx] = {
      ...db.savingsGoals[idx],
      ...updates,
      goal_id: goalId,
      user_id: userId
    };

    const updated = db.savingsGoals[idx];
    this.writeDB(db);

    // check goal milestone progress trigger
    const progressPercent = Math.round((updated.current_amount / updated.target_amount) * 100);
    if (progressPercent >= 100) {
      this.addNotification(userId, 'Savings Goal Completed! 🎉', `Congratulations! You saved the full amount of $${updated.target_amount} for your "${updated.goal_name}" goal!`, 'success');
    }

    return updated;
  }

  public static deleteSavingsGoal(userId: string, goalId: string): boolean {
    const db = this.readDB();
    const lenBefore = db.savingsGoals.length;
    db.savingsGoals = db.savingsGoals.filter(g => !(g.goal_id === goalId && g.user_id === userId));
    if (db.savingsGoals.length < lenBefore) {
      this.writeDB(db);
      return true;
    }
    return false;
  }

  // --- NOTIFICATION SYSTEM ---
  public static getNotifications(userId: string): AppNotification[] {
    const db = this.readDB();
    return db.notifications.filter(n => n.user_id === userId).sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  public static addNotification(userId: string, title: string, message: string, type: 'info' | 'warning' | 'success'): AppNotification {
    const db = this.readDB();
    const newNotification: AppNotification = {
      notification_id: crypto.randomUUID(),
      user_id: userId,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      read: false
    };
    db.notifications.push(newNotification);
    this.writeDB(db);
    return newNotification;
  }

  public static markNotificationRead(userId: string, notificationId: string): boolean {
    const db = this.readDB();
    const idx = db.notifications.findIndex(n => n.notification_id === notificationId && n.user_id === userId);
    if (idx === -1) return false;
    db.notifications[idx].read = true;
    this.writeDB(db);
    return true;
  }

  public static clearAllNotifications(userId: string): boolean {
    const db = this.readDB();
    db.notifications = db.notifications.filter(n => n.user_id !== userId);
    this.writeDB(db);
    return true;
  }

  // --- AUTOMATIC ALERTS FOR BUDGET EXCEEDED ---
  private static checkBudgetLimit(userId: string, category: string): void {
    const db = this.readDB();
    const budget = db.budgets.find(b => b.user_id === userId && b.category.toLowerCase() === category.toLowerCase());
    if (!budget) return;

    // Sum matching expenses for the current calendar month
    const curYearMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const totalSpent = db.transactions
      .filter(t => t.user_id === userId && t.type === 'expense' && t.category.toLowerCase() === category.toLowerCase() && t.date.startsWith(curYearMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalSpent > budget.limit_amount) {
      // Check if alert already exists for this month and category to avoid flooding
      const alertTitle = `Budget Alert: ${category}`;
      const alreadyAlerted = db.notifications.some(
        n => n.user_id === userId && n.title === alertTitle && n.created_at.startsWith(curYearMonth)
      );

      if (!alreadyAlerted) {
        this.addNotification(
          userId,
          alertTitle,
          `You have exceeded your $${budget.limit_amount} budget for ${category} for this month! Total Spent: $${totalSpent.toFixed(2)}.`,
          'warning'
        );
      }
    }
  }
}
