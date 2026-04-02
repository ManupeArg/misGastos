export type PaymentMethod = 'cash' | 'card';
export type CategoryType = 'expense' | 'income' | 'saving';

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  date: string; // ISO date string YYYY-MM-DD
  name: string;
  category_id: string | null;
  category?: Category;
  amount: number;
  payment_method: PaymentMethod;
  installments: number;
  installment_number: number;
  installment_group_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  date: string;
  name: string;
  category_id: string | null;
  category?: Category;
  amount: number;
  notes: string | null;
  created_at: string;
}

export interface Saving {
  id: string;
  user_id: string;
  date: string;
  name: string;
  category_id: string | null;
  category?: Category;
  amount: number;
  notes: string | null;
  created_at: string;
}

export interface BudgetGoal {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  year: number;
  month: number;
  amount: number;
  created_at: string;
}

export interface MonthSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  balance: number; // income - expenses - savings
}

export interface DayData {
  date: string;
  expenses: Expense[];
  incomes: Income[];
  savings: Saving[];
}

export type NewExpense = Omit<Expense, 'id' | 'user_id' | 'created_at' | 'category'>;
export type NewIncome = Omit<Income, 'id' | 'user_id' | 'created_at' | 'category'>;
export type NewSaving = Omit<Saving, 'id' | 'user_id' | 'created_at' | 'category'>;
export type NewCategory = Omit<Category, 'id' | 'user_id' | 'created_at'>;
export type NewBudgetGoal = Omit<BudgetGoal, 'id' | 'user_id' | 'created_at' | 'category'>;
