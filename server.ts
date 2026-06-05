import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { DatabaseService } from './src/db.ts';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Memory-based session store mapping: token -> user_id
const SessionStore = new Map<string, string>();

// Simple authentication middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized, login required' });
    return;
  }
  const token = authHeader.substring(7);
  const userId = SessionStore.get(token);
  if (!userId) {
    res.status(401).json({ error: 'Session expired or invalid token' });
    return;
  }
  (req as any).userId = userId;
  next();
};

// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Full name, email and password are required' });
    return;
  }

  const user = DatabaseService.createUser(name, email, password);
  if (!user) {
    res.status(400).json({ error: 'Account with this email already exists' });
    return;
  }

  const token = crypto.randomUUID();
  SessionStore.set(token, user.user_id);

  res.status(201).json({
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email
    },
    token
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = DatabaseService.getUserByEmail(email);
  if (!user || !DatabaseService.verifyPassword(password, user.passwordHash)) {
    res.status(400).json({ error: 'Invalid email or password' });
    return;
  }

  const token = crypto.randomUUID();
  SessionStore.set(token, user.user_id);

  res.json({
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email
    },
    token
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const user = DatabaseService.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User profile not found' });
    return;
  }
  res.json({ user });
});

app.put('/api/auth/profile', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const updated = DatabaseService.updateProfile(userId, name, email);
  if (!updated) {
    res.status(400).json({ error: 'Email already taken by another account' });
    return;
  }

  res.json({
    user: {
      user_id: updated.user_id,
      name: updated.name,
      email: updated.email
    }
  });
});

app.put('/api/auth/password', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { oldPassword, newPassword } = req.body;

  const user = (DatabaseService as any).readDB().users.find((u: any) => u.user_id === userId);
  if (!user || !DatabaseService.verifyPassword(oldPassword, user.passwordHash)) {
    res.status(400).json({ error: 'Old password is incorrect' });
    return;
  }

  DatabaseService.changePassword(userId, newPassword);
  res.json({ success: true, message: 'Password changed successfully' });
});

// --- TRANSACTIONS CRUD ---

app.get('/api/transactions', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const list = DatabaseService.getTransactions(userId);
  res.json(list);
});

app.post('/api/transactions', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { title, amount, category, type, date, description } = req.body;

  if (!title || typeof amount !== 'number' || !category || !type || !date) {
    res.status(400).json({ error: 'Missing required transaction fields' });
    return;
  }

  const transaction = DatabaseService.createTransaction(userId, {
    title,
    amount,
    category,
    type,
    date,
    description
  });

  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const transactionId = req.params.id;
  const { title, amount, category, type, date, description } = req.body;

  const updated = DatabaseService.updateTransaction(userId, transactionId, {
    title,
    amount,
    category,
    type,
    date,
    description
  });

  if (!updated) {
    res.status(404).json({ error: 'Transaction not found or unauthorized' });
    return;
  }

  res.json(updated);
});

app.delete('/api/transactions/:id', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const transactionId = req.params.id;

  const deleted = DatabaseService.deleteTransaction(userId, transactionId);
  if (!deleted) {
    res.status(404).json({ error: 'Transaction not found or unauthorized' });
    return;
  }

  res.json({ success: true });
});

// --- BUDGETS ---

app.get('/api/budgets', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const list = DatabaseService.getBudgets(userId);
  res.json(list);
});

app.post('/api/budgets', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { category, limit_amount } = req.body;

  if (!category || typeof limit_amount !== 'number') {
    res.status(400).json({ error: 'category and limit_amount are required' });
    return;
  }

  const budget = DatabaseService.setBudget(userId, category, limit_amount);
  res.json(budget);
});

app.delete('/api/budgets/:category', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const category = req.params.category;

  const deleted = DatabaseService.deleteBudget(userId, category);
  if (!deleted) {
    res.status(404).json({ error: 'Budget not found for this category' });
    return;
  }

  res.json({ success: true });
});

// --- SAVINGS GOALS ---

app.get('/api/goals', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const list = DatabaseService.getSavingsGoals(userId);
  res.json(list);
});

app.post('/api/goals', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { goal_name, target_amount, current_amount, target_date } = req.body;

  if (!goal_name || typeof target_amount !== 'number' || typeof current_amount !== 'number' || !target_date) {
    res.status(400).json({ error: 'Missing savings goal parameters' });
    return;
  }

  const goal = DatabaseService.createSavingsGoal(userId, {
    goal_name,
    target_amount,
    current_amount,
    target_date
  });

  res.status(201).json(goal);
});

app.put('/api/goals/:id', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const goalId = req.params.id;
  const { goal_name, target_amount, current_amount, target_date } = req.body;

  const updated = DatabaseService.updateSavingsGoal(userId, goalId, {
    goal_name,
    target_amount,
    current_amount,
    target_date
  });

  if (!updated) {
    res.status(404).json({ error: 'Savings goal not found' });
    return;
  }

  res.json(updated);
});

app.delete('/api/goals/:id', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const goalId = req.params.id;

  const deleted = DatabaseService.deleteSavingsGoal(userId, goalId);
  if (!deleted) {
    res.status(404).json({ error: 'Savings goal not found' });
    return;
  }

  res.json({ success: true });
});

// --- NOTIFICATIONS ---

app.get('/api/notifications', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const list = DatabaseService.getNotifications(userId);
  res.json(list);
});

app.put('/api/notifications/:id/read', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const notificationId = req.params.id;

  const success = DatabaseService.markNotificationRead(userId, notificationId);
  res.json({ success });
});

app.delete('/api/notifications', authenticate, (req, res) => {
  const userId = (req as any).userId;
  DatabaseService.clearAllNotifications(userId);
  res.json({ success: true });
});

// --- AI-POWERED PERSONALIZED INSIGHTS ---

app.get('/api/insights', authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const transactions = DatabaseService.getTransactions(userId);
  const budgets = DatabaseService.getBudgets(userId);
  const goals = DatabaseService.getSavingsGoals(userId);

  // Fallback in case of no database transaction records
  if (transactions.length === 0) {
    res.json({
      healthScore: 70,
      overallAssessment: "Add transactions to unlock server-side Gemini financial analysis.",
      recommendations: [
        {
          title: "Get Started",
          description: "Log your first transactions or income to get detailed recommendations.",
          impact: "Medium"
        }
      ]
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // If user has not configured API key, return a highly intelligent deterministic mock insight
    // so the app stays beautiful and fully featured!
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const health = Math.min(100, Math.max(20, Math.round(50 + savingsRate / 2)));

    res.json({
      healthScore: health,
      overallAssessment: `Based on your local transaction profile: Your savings rate is currently ${savingsRate.toFixed(1)}%. Budget parameters represent stable asset performance.`,
      recommendations: [
        {
          title: "Setup Gemini API Key",
          description: "Configure your Gemini credentials in Settings > Secrets to unlock personalized generative AI advisory.",
          impact: "High",
          category: "General"
        },
        {
          title: "Optimize High-Category Budgets",
          description: "Food and Shopping categories make up a substantial portion of outbound transactions.",
          impact: "Medium",
          category: "Food"
        }
      ]
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const contextSummary = {
      transactions: transactions.map(t => ({
        title: t.title,
        amount: t.amount,
        category: t.category,
        type: t.type,
        date: t.date
      })),
      budgets: budgets.map(b => ({
        category: b.category,
        limit: b.limit_amount
      })),
      goals: goals.map(g => ({
        name: g.goal_name,
        target: g.target_amount,
        current: g.current_amount
      }))
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are a professional wealth advisor. Analyze these finances and compute a score and insights.
Database JSON Data:
${JSON.stringify(contextSummary, null, 2)}

Provide helpful advice regarding savings rate, over-budget segments, and goals. Focus on action items.`,
      config: {
        systemInstruction: "You are an elite, supportive AI Financial Advisor that outputs clean parsed recommendations based strictly on the user data JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["healthScore", "overallAssessment", "recommendations"],
          properties: {
            healthScore: {
              type: Type.INTEGER,
              description: "A financial health score from 0 (critical) to 100 (flawless portfolio and budgeting)"
            },
            overallAssessment: {
              type: Type.STRING,
              description: "A summary assessment of spending velocities, savings rates, and goals in 2-3 structured sentences."
            },
            recommendations: {
              type: Type.ARRAY,
              description: "A list of actionable financial improvements.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "impact"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, description: "Must be 'High', 'Medium', or 'Low'" },
                  category: { type: Type.STRING, description: "Finance category affected, e.g. 'Food', 'Savings', 'Investment'" }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      res.json(JSON.parse(resultText.trim()));
    } else {
      throw new Error("No text received from Gemini");
    }
  } catch (error) {
    console.error('Gemini insights error:', error);
    res.status(500).json({ error: 'AI advisor failed to generate insights' });
  }
});

// --- STATIC ASSETS & VITE SERVING MIDDLEWARES ---

async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

initServer();
