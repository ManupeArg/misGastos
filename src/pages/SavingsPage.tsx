import { useState, useMemo } from 'react';
import { Plus, PiggyBank, Pencil, Trash2 } from 'lucide-react';
import { useSavings } from '../hooks/useSavings';
import { useCategories } from '../hooks/useCategories';
import { SavingsForm } from '../components/savings/SavingsForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Saving } from '../types';
import { formatARS, formatShortDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export function SavingsPage() {
  const { savings, loading, addSaving, updateSaving, deleteSaving } = useSavings();
  const { categories } = useCategories('saving');

  const [formOpen, setFormOpen] = useState(false);
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalSavings = useMemo(() =>
    savings.reduce((sum, s) => sum + Number(s.amount), 0),
    [savings]
  );

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, { name: string; color: string; items: Saving[]; total: number }> = {};
    const uncategorized: Saving[] = [];

    savings.forEach(s => {
      if (s.category) {
        const key = s.category.id;
        if (!map[key]) {
          map[key] = { name: s.category.name, color: s.category.color, items: [], total: 0 };
        }
        map[key].items.push(s);
        map[key].total += Number(s.amount);
      } else {
        uncategorized.push(s);
      }
    });

    const result = Object.entries(map).map(([id, data]) => ({ id, ...data }));
    if (uncategorized.length > 0) {
      result.push({
        id: 'uncategorized',
        name: 'Sin categoría',
        color: '#6B7280',
        items: uncategorized,
        total: uncategorized.reduce((s, i) => s + Number(i.amount), 0),
      });
    }
    return result;
  }, [savings]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteSaving(deletingId);
      toast.success('Ahorro eliminado');
      setDeletingId(null);
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500 text-sm">Cargando...</div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Summary header */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400/70 text-sm font-medium mb-1">Total en ahorros</p>
            <p className="text-3xl font-bold text-emerald-300">{formatARS(totalSavings)}</p>
            <p className="text-emerald-400/50 text-xs mt-1">{savings.length} {savings.length === 1 ? 'entrada' : 'entradas'}</p>
          </div>
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <PiggyBank size={32} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-slate-300 font-semibold">Mis ahorros</h2>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditingSaving(null); setFormOpen(true); }}>
          Agregar ahorro
        </Button>
      </div>

      {savings.length === 0 ? (
        <EmptyState
          icon={<PiggyBank size={24} />}
          title="Sin ahorros registrados"
          description="Empezá a registrar tus ahorros: euros, dólares, plazo fijo, etc."
          action={<Button size="sm" onClick={() => setFormOpen(true)}>+ Agregar ahorro</Button>}
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                  <span className="text-slate-300 font-medium text-sm">{group.name}</span>
                </div>
                <span className="text-emerald-400 font-semibold text-sm">{formatARS(group.total)}</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-700/30">
                {group.items.map(saving => (
                  <div key={saving.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-slate-700/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 text-sm font-medium">{saving.name}</span>
                      </div>
                      <span className="text-slate-500 text-xs">{formatShortDate(saving.date)}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-sm">{formatARS(Number(saving.amount))}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingSaving(saving); setFormOpen(true); }}
                        className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingId(saving.id)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Eliminar ahorro"
        message="¿Estás seguro de que querés eliminar este ahorro?"
        loading={deleteLoading}
      />

      <SavingsForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingSaving(null); }}
        onSubmit={editingSaving
          ? (data) => updateSaving(editingSaving.id, data)
          : addSaving
        }
        categories={categories}
        editingSaving={editingSaving}
      />
    </div>
  );
}
