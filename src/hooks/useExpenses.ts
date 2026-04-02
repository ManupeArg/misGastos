import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Expense, NewExpense } from '../types';
import { addMonthsToDate } from '../utils/formatters';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useExpenses(year: number, month: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const yearStr = String(year);
  const monthStr = String(month).padStart(2, '0');
  const startDate = `${yearStr}-${monthStr}-01`;
  const endDate = `${yearStr}-${monthStr}-31`;

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('expenses')
        .select(`
          *,
          category:categories(*)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (err) throw err;
      setExpenses(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (newExpense: NewExpense) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const installments = newExpense.installments ?? 1;

    if (newExpense.payment_method === 'card' && installments > 1) {
      // Create multiple installment records
      const groupId = generateUUID();
      const installmentAmount = Number((newExpense.amount / installments).toFixed(2));

      const records = Array.from({ length: installments }, (_, i) => ({
        ...newExpense,
        user_id: user.id,
        amount: installmentAmount,
        installment_number: i + 1,
        installment_group_id: groupId,
        date: addMonthsToDate(newExpense.date, i),
      }));

      const { data, error: err } = await supabase
        .from('expenses')
        .insert(records)
        .select(`*, category:categories(*)`);

      if (err) throw err;

      // Only add the current month's expense to state
      const currentMonthExpenses = (data ?? []).filter(e => {
        const [eYear, eMonth] = e.date.split('-').map(Number);
        return eYear === year && eMonth === month;
      });
      setExpenses(prev => [...prev, ...currentMonthExpenses].sort((a, b) => a.date.localeCompare(b.date)));
      return data?.[0];
    } else {
      // Single expense
      const { data, error: err } = await supabase
        .from('expenses')
        .insert({ ...newExpense, user_id: user.id, installments: 1, installment_number: 1 })
        .select(`*, category:categories(*)`)
        .single();

      if (err) throw err;
      setExpenses(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)));
      return data;
    }
  };

  const updateExpense = async (id: string, updates: Partial<NewExpense>) => {
    const { data, error: err } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select(`*, category:categories(*)`)
      .single();

    if (err) throw err;
    setExpenses(prev => prev.map(e => e.id === id ? data : e));
    return data;
  };

  const deleteExpense = async (id: string, deleteGroup = false) => {
    const expense = expenses.find(e => e.id === id);

    if (deleteGroup && expense?.installment_group_id) {
      // Delete all installments in the group
      const { error: err } = await supabase
        .from('expenses')
        .delete()
        .eq('installment_group_id', expense.installment_group_id);

      if (err) throw err;
      setExpenses(prev => prev.filter(e => e.installment_group_id !== expense.installment_group_id));
    } else {
      const { error: err } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses };
}
