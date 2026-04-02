import { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { useIncomes } from './hooks/useIncomes';
import { useSavings } from './hooks/useSavings';
import { LoginPage } from './components/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { MonthPage } from './pages/MonthPage';
import { SavingsPage } from './pages/SavingsPage';
import { TotalsPage } from './pages/TotalsPage';

type Tab = 'month' | 'savings' | 'totals';

const now = new Date();

function MonthSummaryProvider({
  year,
  month,
  children,
}: {
  year: number;
  month: number;
  children: (summary: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    balance: number;
  }) => React.ReactNode;
}) {
  const { expenses } = useExpenses(year, month);
  const { incomes } = useIncomes(year, month);
  const { savings } = useSavings(year, month);

  const summary = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);
    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      balance: totalIncome - totalExpenses - totalSavings,
    };
  }, [expenses, incomes, savings]);

  return <>{children(summary)}</>;
}

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<Tab>('month');
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onSignIn={signIn} onSignUp={signUp} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
      </>
    );
  }

  return (
    <MonthSummaryProvider year={currentYear} month={currentMonth}>
      {(monthSummary) => (
        <AppLayout
          user={user}
          onSignOut={signOut}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onYearChange={setCurrentYear}
          onMonthChange={setCurrentMonth}
          monthSummary={monthSummary}
        >
          {currentTab === 'month' && (
            <MonthPage
              year={currentYear}
              month={currentMonth}
              onSummaryChange={() => {}}
            />
          )}
          {currentTab === 'savings' && <SavingsPage />}
          {currentTab === 'totals' && <TotalsPage />}

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </AppLayout>
      )}
    </MonthSummaryProvider>
  );
}
