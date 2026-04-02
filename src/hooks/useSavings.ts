import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Saving, NewSaving } from '../types';

export function useSavings(year?: number, month?: number) {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavings = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('savings')
        .select(`*, category:categories(*)`)
        .order('date', { ascending: false });

      if (year && month) {
        const yearStr = String(year);
        const monthStr = String(month).padStart(2, '0');
        query = query
          .gte('date', `${yearStr}-${monthStr}-01`)
          .lte('date', `${yearStr}-${monthStr}-31`);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setSavings(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ahorros');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const addSaving = async (newSaving: NewSaving) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const { data, error: err } = await supabase
      .from('savings')
      .insert({ ...newSaving, user_id: user.id })
      .select(`*, category:categories(*)`)
      .single();

    if (err) throw err;
    setSavings(prev => [data, ...prev]);
    return data;
  };

  const updateSaving = async (id: string, updates: Partial<NewSaving>) => {
    const { data, error: err } = await supabase
      .from('savings')
      .update(updates)
      .eq('id', id)
      .select(`*, category:categories(*)`)
      .single();

    if (err) throw err;
    setSavings(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const deleteSaving = async (id: string) => {
    const { error: err } = await supabase.from('savings').delete().eq('id', id);
    if (err) throw err;
    setSavings(prev => prev.filter(s => s.id !== id));
  };

  return { savings, loading, error, addSaving, updateSaving, deleteSaving, refetch: fetchSavings };
}
