import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { User } from '@supabase/supabase-js';

interface AppLayoutProps {
  children: ReactNode;
  user: User;
  onSignOut: () => void;
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
}

export function AppLayout({
  children,
  user,
  onSignOut,
  currentTab,
  onTabChange,
  currentYear,
  currentMonth,
  onYearChange,
  onMonthChange,
  monthSummary,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentTab={currentTab}
        onTabChange={(tab) => {
          onTabChange(tab);
          setSidebarOpen(false);
        }}
        currentYear={currentYear}
        currentMonth={currentMonth}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        monthSummary={monthSummary}
        user={user}
        onSignOut={onSignOut}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentTab={currentTab}
          currentYear={currentYear}
          currentMonth={currentMonth}
          user={user}
          onSignOut={onSignOut}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
