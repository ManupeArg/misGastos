import { Calendar, PiggyBank, BarChart3, ChevronLeft, ChevronRight, LogOut, TrendingUp, User as UserIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { formatARS, getMonthName, getShortMonthName } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: 'month' | 'savings' | 'totals';
  onTabChange: (tab: 'month' | 'savings' | 'totals') => void;
  currentYear: number;
  currentMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  monthSummary?: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    balance: number;
  };
  user: User;
  onSignOut: () => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function Sidebar({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  currentYear,
  currentMonth,
  onYearChange,
  onMonthChange,
  monthSummary,
  user,
  onSignOut,
}: SidebarProps) {
  const tabs = [
    { id: 'month' as const, label: 'Meses', icon: Calendar },
    { id: 'savings' as const, label: 'Ahorros', icon: PiggyBank },
    { id: 'totals' as const, label: 'Totales', icon: BarChart3 },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-72 bg-slate-800 border-r border-slate-700 z-30
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-slate-100 font-bold text-lg leading-none">MisGastos</h1>
            <p className="text-slate-500 text-xs mt-0.5">Finanzas personales</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 border-b border-slate-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all
              ${currentTab === id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }
            `}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* Year/Month selector (only in month tab) */}
      {currentTab === 'month' && (
        <div className="px-4 py-4 border-b border-slate-700">
          {/* Year selector */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => onYearChange(currentYear - 1)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-slate-200 font-semibold text-sm">{currentYear}</span>
            <button
              onClick={() => onYearChange(currentYear + 1)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-1">
            {MONTHS.map(m => (
              <button
                key={m}
                onClick={() => onMonthChange(m)}
                className={`
                  py-1.5 px-1 rounded-md text-xs font-medium transition-all text-center
                  ${currentMonth === m
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }
                `}
              >
                {getShortMonthName(m)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Month summary (only in month tab) */}
      {currentTab === 'month' && monthSummary && (
        <div className="px-4 py-4 border-b border-slate-700 flex-1">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
            {getMonthName(currentMonth)} {currentYear}
          </p>
          <div className="space-y-2.5">
            <SummaryRow
              label="Ingresos"
              value={monthSummary.totalIncome}
              color="text-blue-400"
            />
            <SummaryRow
              label="Gastos"
              value={monthSummary.totalExpenses}
              color="text-red-400"
              negative
            />
            <SummaryRow
              label="Ahorros enviados"
              value={monthSummary.totalSavings}
              color="text-amber-400"
              negative
            />
            <div className="border-t border-slate-700 pt-2.5 mt-1">
              <SummaryRow
                label="Saldo a favor"
                value={monthSummary.balance}
                color={monthSummary.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}
                bold
              />
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <UserIcon size={16} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-xs font-medium truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  color,
  negative = false,
  bold = false,
}: {
  label: string;
  value: number;
  color: string;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-slate-400 text-xs ${bold ? 'font-semibold text-slate-300' : ''}`}>{label}</span>
      <span className={`text-xs font-semibold ${color}`}>
        {negative ? '-' : ''}{formatARS(Math.abs(value))}
      </span>
    </div>
  );
}
