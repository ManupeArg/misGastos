import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Wallet, Filter, BarChart3 } from 'lucide-react';
import { useTotals } from '../hooks/useTotals';
import { useCategories } from '../hooks/useCategories';
import { useSavings } from '../hooks/useSavings';
import { formatARS, getMonthName, getShortMonthName } from '../utils/formatters';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface FilterState {
  year?: number;
  month?: number;
  categoryId?: string;
}

export function TotalsPage() {
  const [filter, setFilter] = useState<FilterState>({ year: CURRENT_YEAR });
  const [compareMode, setCompareMode] = useState(false);
  const [compareMonth1, setCompareMonth1] = useState(new Date().getMonth() + 1);
  const [compareMonth2, setCompareMonth2] = useState(new Date().getMonth() === 0 ? 12 : new Date().getMonth());
  const [compareYear, setCompareYear] = useState(CURRENT_YEAR);

  const { categories } = useCategories();
  const { savings: allSavings } = useSavings();

  // Main totals
  const totals = useTotals(filter.year, filter.month, filter.categoryId);

  // Compare month 1
  const compare1 = useTotals(compareYear, compareMonth1);
  // Compare month 2
  const compare2 = useTotals(compareYear, compareMonth2);

  // All-time totals
  const allTimeSavings = useMemo(() =>
    allSavings.reduce((sum, s) => sum + Number(s.amount), 0),
    [allSavings]
  );

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; color: string; total: number }> = {};
    totals.expenses.forEach(e => {
      if (e.category) {
        const key = e.category_id!;
        if (!map[key]) map[key] = { name: e.category.name, color: e.category.color, total: 0 };
        map[key].total += Number(e.amount);
      }
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [totals.expenses]);

  const maxCategoryTotal = categoryBreakdown[0]?.total ?? 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Filters */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-400" />
          <span className="text-slate-300 font-medium text-sm">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Year */}
          <select
            value={filter.year ?? ''}
            onChange={e => setFilter(f => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los años</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Month */}
          <select
            value={filter.month ?? ''}
            onChange={e => setFilter(f => ({ ...f, month: e.target.value ? Number(e.target.value) : undefined }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los meses</option>
            {MONTHS.map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>

          {/* Category */}
          <select
            value={filter.categoryId ?? ''}
            onChange={e => setFilter(f => ({ ...f, categoryId: e.target.value || undefined }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Reset */}
          <button
            onClick={() => setFilter({ year: CURRENT_YEAR })}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 transition-colors"
          >
            Resetear
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Ingresos"
          value={totals.totalIncomes}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <SummaryCard
          label="Gastos"
          value={totals.totalExpenses}
          icon={<TrendingDown size={20} />}
          color="red"
        />
        <SummaryCard
          label="Ahorros"
          value={totals.totalSavings}
          icon={<PiggyBank size={20} />}
          color="amber"
        />
        <SummaryCard
          label="Saldo a favor"
          value={totals.balance}
          icon={<Wallet size={20} />}
          color={totals.balance >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* All-time savings box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-xl border border-emerald-500/30 p-5">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Ahorro total acumulado</p>
          <p className="text-2xl font-bold text-emerald-300">{formatARS(allTimeSavings)}</p>
          <p className="text-slate-500 text-xs mt-1">Suma histórica de todos tus ahorros</p>
        </div>
        <div className={`bg-slate-800 rounded-xl border p-5 ${totals.balance >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
            Saldo total a favor {filter.month ? `(${getMonthName(filter.month)} ${filter.year})` : filter.year ? `(${filter.year})` : '(todo el tiempo)'}
          </p>
          <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            {formatARS(totals.balance)}
          </p>
          <p className="text-slate-500 text-xs mt-1">Ingresos - Gastos - Ahorros</p>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-400" />
            Gastos por categoría
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map(cat => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300 text-sm">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs">
                      {totals.totalExpenses > 0 ? Math.round((cat.total / totals.totalExpenses) * 100) : 0}%
                    </span>
                    <span className="text-red-400 text-sm font-semibold">{formatARS(cat.total)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.total / maxCategoryTotal) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare months */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-200 font-semibold">Comparar meses</h3>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
              compareMode
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'border-slate-600 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {compareMode ? 'Ocultar' : 'Comparar'}
          </button>
        </div>

        {compareMode && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-5">
              <select
                value={compareYear}
                onChange={e => setCompareYear(Number(e.target.value))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <select
                  value={compareMonth1}
                  onChange={e => setCompareMonth1(Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MONTHS.map(m => <option key={m} value={m}>{getShortMonthName(m)}</option>)}
                </select>
                <span className="text-slate-500 text-sm">vs</span>
                <select
                  value={compareMonth2}
                  onChange={e => setCompareMonth2(Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MONTHS.map(m => <option key={m} value={m}>{getShortMonthName(m)}</option>)}
                </select>
              </div>
            </div>

            {/* Compare cards */}
            <div className="grid grid-cols-2 gap-4">
              <CompareCard
                label={getMonthName(compareMonth1)}
                totalIncome={compare1.totalIncomes}
                totalExpenses={compare1.totalExpenses}
                totalSavings={compare1.totalSavings}
                balance={compare1.balance}
              />
              <CompareCard
                label={getMonthName(compareMonth2)}
                totalIncome={compare2.totalIncomes}
                totalExpenses={compare2.totalExpenses}
                totalSavings={compare2.totalSavings}
                balance={compare2.balance}
              />
            </div>

            {/* Differences */}
            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-xs font-medium mb-2">Diferencias ({getMonthName(compareMonth1)} vs {getMonthName(compareMonth2)})</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <DiffRow label="Ingresos" diff={compare1.totalIncomes - compare2.totalIncomes} />
                <DiffRow label="Gastos" diff={compare1.totalExpenses - compare2.totalExpenses} invertColors />
                <DiffRow label="Ahorros" diff={compare1.totalSavings - compare2.totalSavings} />
                <DiffRow label="Saldo" diff={compare1.balance - compare2.balance} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'amber';
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400', value: 'text-blue-300' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', value: 'text-red-300' },
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', value: 'text-emerald-300' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400', value: 'text-amber-300' },
  }[color];

  return (
    <div className={`${colorMap.bg} border ${colorMap.border} rounded-xl p-4`}>
      <div className={`${colorMap.icon} mb-2`}>{icon}</div>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className={`${colorMap.value} font-bold text-base leading-tight`}>{formatARS(Math.abs(value))}</p>
    </div>
  );
}

function CompareCard({
  label,
  totalIncome,
  totalExpenses,
  totalSavings,
  balance,
}: {
  label: string;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  balance: number;
}) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-3">
      <p className="text-slate-300 font-medium text-sm mb-2">{label}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Ingresos</span>
          <span className="text-blue-400 font-medium">{formatARS(totalIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Gastos</span>
          <span className="text-red-400 font-medium">{formatARS(totalExpenses)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Ahorros</span>
          <span className="text-amber-400 font-medium">{formatARS(totalSavings)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-600 pt-1.5 mt-1.5">
          <span className="text-slate-300 font-medium">Saldo</span>
          <span className={`font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatARS(balance)}
          </span>
        </div>
      </div>
    </div>
  );
}

function DiffRow({ label, diff, invertColors = false }: { label: string; diff: number; invertColors?: boolean }) {
  const isPositive = invertColors ? diff < 0 : diff > 0;
  const isNegative = invertColors ? diff > 0 : diff < 0;

  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span className={`font-medium ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'}`}>
        {diff > 0 ? '+' : ''}{formatARS(diff)}
      </span>
    </div>
  );
}
