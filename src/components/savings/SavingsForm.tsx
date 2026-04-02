import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AmountInput } from '../ui/AmountInput';
import { Category, Saving, NewSaving } from '../../types';
import { getTodayISO, parseAmount } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface SavingsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSaving) => Promise<void>;
  categories: Category[];
  editingSaving?: Saving | null;
}

export function SavingsForm({ isOpen, onClose, onSubmit, categories, editingSaving }: SavingsFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingSaving) {
      setName(editingSaving.name);
      setCategoryId(editingSaving.category_id ?? '');
      setAmount(String(editingSaving.amount));
      setDate(editingSaving.date);
    } else {
      setName('');
      setCategoryId('');
      setAmount('');
      setDate(getTodayISO());
    }
    setErrors({});
  }, [editingSaving, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!amount || parseAmount(amount) <= 0) newErrors.amount = 'Ingresá un monto válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        category_id: categoryId || null,
        amount: parseAmount(amount),
        date,
        notes: null,
      });
      onClose();
    } catch {
      toast.error('Error al guardar el ahorro');
    } finally {
      setLoading(false);
    }
  };

  const savingCategories = categories.filter(c => c.type === 'saving');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingSaving ? 'Editar ahorro' : 'Agregar ahorro'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Euros, Dólares, Plazo Fijo"
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-emerald-500'}`}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Sin categoría</option>
            {savingCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <AmountInput label="Monto" value={amount} onChange={setAmount} error={errors.amount} required />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {editingSaving ? 'Guardar cambios' : 'Agregar ahorro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}