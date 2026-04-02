import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category, CategoryType, NewCategory } from '../types';

export function useCategories(type?: CategoryType) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setCategories(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (newCategory: NewCategory) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const { data, error: err } = await supabase
      .from('categories')
      .insert({ ...newCategory, user_id: user.id, is_default: false })
      .select()
      .single();

    if (err) throw err;
    setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<NewCategory>) => {
    const { data, error: err } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;
    setCategories(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteCategory = async (id: string) => {
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (err) throw err;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return { categories, loading, error, addCategory, updateCategory, deleteCategory, refetch: fetchCategories };
}
