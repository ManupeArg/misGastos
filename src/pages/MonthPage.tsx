import { useState, useMemo } from 'react';
import { Plus, TrendingDown, TrendingUp, CreditCard, Banknote, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useIncomes } from '../hooks/useIncomes';
import { useCategories } from '../hooks/useCategories';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { IncomeForm } from '../components/income/IncomeForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Expense, Income } from '../types';
import { formatARS, getMonthDays, getDayName, formatShortDate } from '../utils/formatters';
import toast from 'react-hot-toast';

interface MonthPageProps {
  year: number;
  month: number;
  onSummaryChange: (summary: { totalIncome: number; totalExpenses: number; totalSavings: number; balance: number }) => void;
}

export function MonthPage({ year, month, onSummaryChange }: MonthPageProps) {
  const { expenses, loading: expLoading, addExpense, updateExpense, deleteExpense } = useExpenses(year, month);
  const { incomes, loading: incLoading, addIncome, updateIncome, deleteIncome } = useIncomes(year, month);
  const { categories } = useCategories();

  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [deleteExpenseGroupMode, setDeleteExpenseGroupMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showOnlyActiveDays, setShowOnlyActiveDays] = useState(true);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  // Group data by day
  const dayData = useMemo(() => {
    const map: Record<string, { expenses: Expense[]; incomes: Income[] }> = {};
    days.forEach(day => { map[day] = { expenses: [], incomes: [] }; });
    expenses.forEach(e => { if (map[e.date]) map[e.date].expenses.push(e); });
    incomes.forEach(i => { if (map[i.date]) map[i.date].incomes.push(i); });
    return map;
  }, [days, expenses, incomes]);

  // Summary
  const summary = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    return { totalIncome, totalExpenses, totalSavings: 0, balance: totalIncome - totalExpenses };
  }, [incomes, expenses]);

  // Active days (have data)
  const activeDays = useMemo(() => {
    return days.filter(d => dayData[d].expenses.length > 0 || dayData[d].incomes.length > 0);
  }, [days, dayData]);

  const displayDays = showOnlyActiveDays && activeDays.length > 0 ? activeDays : days;

  const toggleDay = (day: string) => {
    setCollapsedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const openExpenseForm = (date?: string) => {
    setSelectedDate(date ?? null);
    setEditingExpense(null);
    setExpenseFormOpen(true);
  };

  const openIncomeForm = (date?: string) => {
    setSelectedDate(date ?? null);
    setEditingIncome(null);
    setIncomeFormOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeFormOpen(true);
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpenseId) return;
    setDeleteLoading(true);
    try {
      await deleteExpense(deletingExpenseId, deleteExpenseGroupMode);
      toast.success('Gasto eliminado');
      setDeletingExpenseId(null);
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteIncome = async () => {
    if (!deletingIncomeId) return;
    setDeleteLoading(true);
    try {
      await deleteIncome(deletingIncomeId);
      toast.success('Ingreso eliminado');
      setDeletingIncomeId(null);
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeleteExpense = (id: string, hasGroup: boolean) => {
    setDeletingExpenseId(id);
    setDeleteExpenseGroupMode(false);
  };

  if (expLoading || incLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyActiveDays(!showOnlyActiveDays)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showOnlyActiveDays ? `Ver todos los días (${days.length})` : `Ver solo días con movimientos (${activeDays.length})`}
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<TrendingDown size={14} className="text-red-400" />} onClick={() => openExpenseForm()}>
            Gasto
          </Button>
          <Button size="sm" icon={<TrendingUp size={14} />} onClick={() => openIncomeForm()}>
            Ingreso
          </Button>
        </div>
      </div>

      {/* Days list */}
      {displayDays.length === 0 ? (
        <EmptyState
          icon={<TrendingDown size={24} />}
          title="Sin movimientos este mes"
          description="Empezá a registrar tus gastos e ingresos del mes"
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openExpenseForm()}>+ Gasto</Button>
              <Button size="sm" onClick={() => openIncomeForm()}>+ Ingreso</Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-2">
          {displayDays.map(day => {
            const data = dayData[day];
            const hasData = data.expenses.length > 0 || data.incomes.length > 0;
            const isCollapsed = collapsedDays.has(day);
            const dayExpenseTotal = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
            const dayIncomeTotal = data.incomes.reduce((s, i) => s + Number(i.amount), 0);

            return (
              <div key={day} className={`bg-slate-800 rounded-xl border transition-colors ${hasData ? 'border-slate-700' : 'border-slate-700/40'}`}>
                {/* Day header */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 ${hasData ? 'cursor-pointer hover:bg-slate-700/30' : ''} rounded-t-xl transition-colors`}
                  onClick={() => hasData && toggleDay(day)}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center ${hasData ? 'bg-slate-700' : 'bg-slate-700/30'}`}>
                      <span className={`text-sm font-bold leading-none ${hasData ? 'text-slate-200' : 'text-slate-600'}`}>
                        {parseInt(day.split('-')[2])}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium capitalize ${hasData ? 'text-slate-400' : 'text-slate-600'}`}>
                      {getDayName(day)}
                    </span>
                    {hasData && (
                      <div className="flex items-center gap-3 mt-0.5">
                        {dayIncomeTotal > 0 && (
                          <span className="text-xs text-blue-400 font-medium">+{formatARS(dayIncomeTotal)}</span>
                        )}
                        {dayExpenseTotal > 0 && (
                          <span className="text-xs text-red-400 font-medium">-{formatARS(dayExpenseTotal)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Quick add buttons */}
                    <button
                      onClick={(e) => { e.stopPropagation(); openExpenseForm(day); }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Agregar gasto"
                    >
                      <Plus size={14} />
                    </button>
                    {hasData && (
                      isCollapsed
                        ? <ChevronDown size={16} className="text-slate-500" />
                        : <ChevronUp size={16} className="text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Day items */}
                {hasData && !isCollapsed && (
                  <div className="border-t border-slate-700/50 px-4 pb-3">
                    {/* Incomes */}
                    {data.incomes.map(income => (
                      <div key={income.id} className="flex items-center gap-3 py-2.5 border-b border-slate-700/30 last:border-0 group">
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-200 text-sm font-medium">{income.name}</span>
                            {income.category && (
                              <Badge label={income.category.name} color={income.category.color} />
                            )}
                          </div>
                        </div>
                        <span className="text-blue-400 text-sm font-semibold flex-shrink-0">
                          +{formatARS(Number(income.amount))}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditIncome(income)}
                            className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingIncomeId(income.id)}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Expenses */}
                    {data.expenses.map(expense => (
                      <div key={expense.id} className="flex items-center gap-3 py-2.5 border-b border-slate-700/30 last:border-0 group">
                        <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-200 text-sm font-medium">{expense.name}</span>
                            {expense.category && (
                              <Badge label={expense.category.name} color={expense.category.color} />
                            )}
                            {expense.payment_method === 'card' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                <CreditCard size={10} />
                                {expense.installments > 1 ? `${expense.installment_number}/${expense.installments}` : 'Tarjeta'}
                              </span>
                            )}
                            {expense.payment_method === 'cash' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-500">
                                <Banknote size={10} />
                                Efectivo
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-red-400 text-sm font-semibold flex-shrink-0">
                          -{formatARS(Number(expense.amount))}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => confirmDeleteExpense(expense.id, !!expense.installment_group_id && expense.installments > 1)}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add buttons for this day */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openExpenseForm(day)}
                        className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={12} /> Gasto
                      </button>
                      <button
                        onClick={() => openIncomeForm(day)}
                        className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={12} /> Ingreso
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty day quick actions */}
                {!hasData && (
                  <div className="px-4 pb-3 flex gap-2">
                    <button
                      onClick={() => openExpenseForm(day)}
                      className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Plus size={11} /> Gasto
                    </button>
                    <button
                      onClick={() => openIncomeForm(day)}
                      className="text-xs text-slate-600 hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <Plus size={11} /> Ingreso
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Expense delete confirm - check if group */}
      {deletingExpenseId && (() => {
        const exp = expenses.find(e => e.id === deletingExpenseId);
        const hasGroup = !!exp?.installment_group_id && (exp?.installments ?? 1) > 1;
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-slate-100 font-semibold mb-2">Eliminar gasto</h3>
              {hasGroup ? (
                <>
                  <p className="text-slate-400 text-sm mb-4">Este gasto es parte de una compra en {exp?.installments} cuotas. ¿Qué querés eliminar?</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="danger" onClick={async () => {
                      setDeleteExpenseGroupMode(false);
                      await handleDeleteExpense();
                    }} loading={deleteLoading && !deleteExpenseGroupMode}>
                      Solo esta cuota ({exp?.installment_number}/{exp?.installments})
                    </Button>
                    <Button variant="danger" onClick={async () => {
                      setDeleteExpenseGroupMode(true);
                      setDeleteLoading(true);
                      try {
                        await deleteExpense(deletingExpenseId, true);
                        toast.success('Todas las cuotas eliminadas');
                        setDeletingExpenseId(null);
                      } catch { toast.error('Error al eliminar'); }
                      finally { setDeleteLoading(false); }
                    }} loading={deleteLoading && deleteExpenseGroupMode}>
                      Todas las cuotas ({exp?.installments} meses)
                    </Button>
                    <Button variant="secondary" onClick={() => setDeletingExpenseId(null)}>Cancelar</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-4">¿Estás seguro de que querés eliminar "{exp?.name}"?</p>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setDeletingExpenseId(null)} className="flex-1">Cancelar</Button>
                    <Button variant="danger" onClick={handleDeleteExpense} loading={deleteLoading} className="flex-1">Eliminar</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      <ConfirmDialog
        isOpen={!!deletingIncomeId}
        onClose={() => setDeletingIncomeId(null)}
        onConfirm={handleDeleteIncome}
        title="Eliminar ingreso"
        message={`¿Estás seguro de que querés eliminar este ingreso?`}
        loading={deleteLoading}
      />

      {/* Forms */}
      <ExpenseForm
        isOpen={expenseFormOpen}
        onClose={() => { setExpenseFormOpen(false); setEditingExpense(null); }}
        onSubmit={editingExpense
          ? (data) => updateExpense(editingExpense.id, data)
          : addExpense
        }
        categories={categories}
        defaultDate={selectedDate ?? undefined}
        editingExpense={editingExpense}
      />

      <IncomeForm
        isOpen={incomeFormOpen}
        onClose={() => { setIncomeFormOpen(false); setEditingIncome(null); }}
        onSubmit={editingIncome
          ? (data) => updateIncome(editingIncome.id, data)
          : addIncome
        }
        categories={categories}
        defaultDate={selectedDate ?? undefined}
        editingIncome={editingIncome}
      />
    </div>
  );
}
