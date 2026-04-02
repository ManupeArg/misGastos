import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Expense, Income, Saving } from '../types';

interface TotalsData {
  expenses: Expense[];
  incomes: Income[];
  savings: Saving[];
  totalExpenses: number;
  totalIncomes: number;
  totalSavings: number;
  balance: number;
}

export function useTotals(year?: number, month?: number, categoryId?: string) {
  const [data, setData] = useState<TotalsData>({
    expenses: [],
    incomes: [],
    savings: [],
    totalExpenses: 0,
    totalIncomes: 0,
    totalSavings: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotals = useCallback(async () => {
    try {
      setLoading(true);

      let expenseQuery = supabase.from('expenses').select(`*, category:categories(*)`);
      let incomeQuery = supabase.from('incomes').select(`*, category:categories(*)`);
      let savingQuery = supabase.from('savings').select(`*, category:categories(*)`);

      if (year && month) {
        const yearStr = String(year);
        const monthStr = String(month).padStart(2, '0');
        const startDate = `${yearStr}-${monthStr}-01`;
        const endDate = `${yearStr}-${monthStr}-31`;
        expenseQuery = expenseQuery.gte('date', startDate).lte('date', endDate);
        incomeQuery = incomeQuery.gte('date', startDate).lte('date', endDate);
        savingQuery = savingQuery.gte('date', startDate).lte('date', endDate);
      } else if (year) {
        expenseQuery = expenseQuery.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
        incomeQuery = incomeQuery.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
        savingQuery = savingQuery.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
      }

      if (categoryId) {
        expenseQuery = expenseQuery.eq('category_id', categoryId);
        incomeQuery = incomeQuery.eq('category_id', categoryId);
        savingQuery = savingQuery.eq('category_id', categoryId);
      }

      const [expensesRes, incomesRes, savingsRes] = await Promise.all([
        expenseQuery.order('date'),
        incomeQuery.order('date'),
        savingQuery.order('date'),
      ]);

      if (expensesRes.error) throw expensesRes.error;
      if (incomesRes.error) throw incomesRes.error;
      if (savingsRes.error) throw savingsRes.error;

      const expenses = expensesRes.data ?? [];
      const incomes = incomesRes.data ?? [];
      const savings = savingsRes.data ?? [];

      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const totalIncomes = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
      const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);

      setData({
        expenses,
        incomes,
        savings,
        totalExpenses,
        totalIncomes,
        totalSavings,
        balance: totalIncomes - totalExpenses - totalSavings,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar totales');
    } finally {
      setLoading(false);
    }
  }, [year, month, categoryId]);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  return { ...data, loading, error, refetch: fetchTotals };
}
