import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AmountInput } from '../ui/AmountInput';
import { Category, Expense, NewExpense, PaymentMethod } from '../../types';
import { getTodayISO, parseAmount } from '../../utils/formatters';
import { CreditCard, Banknote, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewExpense) => Promise<void>;
  categories: Category[];
  defaultDate?: string;
  editingExpense?: Expense | null;
}

const INSTALLMENT_OPTIONS = [1, 3, 6, 12, 18, 24];

export function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  defaultDate,
  editingExpense,
}: ExpenseFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [installments, setInstallments] = useState(1);
  const [date, setDate] = useState(defaultDate ?? getTodayISO());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setCategoryId(editingExpense.category_id ?? '');
      setAmount(String(editingExpense.amount));
      setPaymentMethod(editingExpense.payment_method);
      setInstallments(editingExpense.installments ?? 1);
      setDate(editingExpense.date);
    } else {
      setName('');
      setCategoryId('');
      setAmount('');
      setPaymentMethod('cash');
      setInstallments(1);
      setDate(defaultDate ?? getTodayISO());
    }
    setErrors({});
  }, [editingExpense, isOpen, defaultDate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!amount || parseAmount(amount) <= 0) newErrors.amount = 'Ingresá un monto válido';
    if (!date) newErrors.date = 'La fecha es requerida';
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
        payment_method: paymentMethod,
        installments: paymentMethod === 'card' ? installments : 1,
        installment_number: 1,
        installment_group_id: null,
        date,
        notes: null,
      });
      onClose();

      // Show card warning after close
      if (paymentMethod === 'card') {
        setTimeout(() => {
          toast(
            (t) => (
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Recordatorio de tarjeta</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Recordá que el precio puede variar al pagar con tarjeta (recargos, intereses, etc.)
                  </p>
                </div>
              </div>
            ),
            { duration: 5000, icon: '' }
          );
        }, 300);
      }
    } catch (error) {
      toast.error('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Editar gasto' : 'Agregar gasto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Supermercado Día"
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-emerald-500'}`}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Sin categoría</option>
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <AmountInput
          label="Monto"
          value={amount}
          onChange={setAmount}
          error={errors.amount}
          required
        />

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Fecha <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:border-transparent [color-scheme:dark] ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-emerald-500'}`}
          />
          {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Forma de pago</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setPaymentMethod('cash'); setInstallments(1); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Banknote size={16} />
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                paymentMethod === 'card'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <CreditCard size={16} />
              Tarjeta
            </button>
          </div>
        </div>

        {/* Installments (only if card) */}
        {paymentMethod === 'card' && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">Cuotas</label>
            <div className="flex flex-wrap gap-2">
              {INSTALLMENT_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setInstallments(n)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    installments === n
                      ? 'bg-blue-500/30 border-blue-400 text-blue-300'
                      : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {n === 1 ? 'Sin cuotas' : `${n}x`}
                </button>
              ))}
            </div>
            {installments > 1 && amount && parseAmount(amount) > 0 && (
              <p className="text-xs text-blue-400 mt-2">
                ≈ {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(parseAmount(amount) / installments)} por cuota durante {installments} meses
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {editingExpense ? 'Guardar cambios' : 'Agregar gasto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}