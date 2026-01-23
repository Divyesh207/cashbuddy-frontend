

export interface User {
  id: number;
  full_name: string;
  email: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'Income' | 'Expense';
}

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  income: number;
  expenses: number;
  balance: number;
  savings_progress: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  count: number;
  [key: string]: any;
}

export interface BudgetConfig {
  monthly_income: number;
  target_savings: number;
  is_configured: boolean;
}

export interface CategoryEstimate {
  category: string;
  limit: number;
  spent: number;
}

export interface BudgetData {
  is_configured: boolean;
  monthly_income: number;
  daily_limit: number;
  used_today: number;
  surplus: number;
  savings_this_month: number;
  sweeps: { id: number; amount: number; date: string }[];
  category_estimates: CategoryEstimate[];
}

export interface DebtItem {
  id: number;
  friend_name: string;
  type: 'FRIEND_OWES_ME' | 'I_OWE_FRIEND';
  amount: number;
  description: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'SETTLED';
  date: string;
}