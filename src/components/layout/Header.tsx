import { Menu, Calendar, PiggyBank, BarChart3, LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { getMonthName } from '../../utils/formatters';

interface HeaderProps {
  onMenuClick: () => void;
  currentTab: 'month' | 'savings' | 'totals';
  currentYear: number;
  currentMonth: number;
  user: User;
  onSignOut: () => void;
}

const TAB_INFO = {
  month: { label: 'Meses', icon: Calendar },
  savings: { label: 'Ahorros', icon: PiggyBank },
  totals: { label: 'Totales', icon: BarChart3 },
};

export function Header({ onMenuClick, currentTab, currentYear, currentMonth }: HeaderProps) {
  const { label, icon: Icon } = TAB_INFO[currentTab];

  return (
    <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 px-4 lg:px-6 py-4 flex items-center gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2">
        <Icon size={20} className="text-emerald-400" />
        <h2 className="text-slate-100 font-semibold">
          {label}
          {currentTab === 'month' && (
            <span className="text-slate-400 font-normal ml-2 text-sm">
              {getMonthName(currentMonth)} {currentYear}
            </span>
          )}
        </h2>
      </div>
    </header>
  );
}
