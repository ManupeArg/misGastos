import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Income, NewIncome } from '../types';

export function useIncomes(year: number, month: number) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const yearStr = String(year);
  const monthStr = String(month).padStart(2, '0');
  const startDate = `${yearStr}-${monthStr}-01`;
  const endDate = `${yearStr}-${monthStr}-31`;

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('incomes')
        .select(`*, category:categories(*)`)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (err) throw err;
      setIncomes(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const addIncome = async (newIncome: NewIncome) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const { data, error: err } = await supabase
      .from('incomes')
      .insert({ ...newIncome, user_id: user.id })
      .select(`*, category:categories(*)`)
      .single();

    if (err) throw err;
    setIncomes(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)));
    return data;
  };

  const updateIncome = async (id: string, updates: Partial<NewIncome>) => {
    const { data, error: err } = await supabase
      .from('incomes')
      .update(updates)
      .eq('id', id)
      .select(`*, category:categories(*)`)
      .single();

    if (err) throw err;
    setIncomes(prev => prev.map(i => i.id === id ? data : i));
    return data;
  };

  const deleteIncome = async (id: string) => {
    const { error: err } = await supabase.from('incomes').delete().eq('id', id);
    if (err) throw err;
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  return { incomes, loading, error, addIncome, updateIncome, deleteIncome, refetch: fetchIncomes };
}
