-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'saving')),
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'tag',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories and defaults"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- EXPENSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card')),
  installments INTEGER DEFAULT 1 CHECK (installments >= 1),
  installment_number INTEGER DEFAULT 1,
  installment_group_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- INCOMES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for incomes
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own incomes"
  ON public.incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incomes"
  ON public.incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incomes"
  ON public.incomes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own incomes"
  ON public.incomes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- SAVINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for savings
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own savings"
  ON public.savings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings"
  ON public.savings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings"
  ON public.savings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings"
  ON public.savings FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- BUDGET GOALS TABLE (metas de presupuesto)
-- =============================================
CREATE TABLE IF NOT EXISTS public.budget_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, year, month)
);

ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budget goals"
  ON public.budget_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- DEFAULT CATEGORIES (system-wide, user_id = NULL)
-- =============================================
-- Note: Insert these manually or via a migration.
-- is_default = true means all users see them.

-- Expense categories
INSERT INTO public.categories (id, user_id, name, type, color, icon, is_default) VALUES
  (gen_random_uuid(), NULL, 'Alimentación', 'expense', '#EF4444', 'shopping-cart', true),
  (gen_random_uuid(), NULL, 'Transporte', 'expense', '#F97316', 'car', true),
  (gen_random_uuid(), NULL, 'Servicios', 'expense', '#EAB308', 'zap', true),
  (gen_random_uuid(), NULL, 'Alquiler/Vivienda', 'expense', '#8B5CF6', 'home', true),
  (gen_random_uuid(), NULL, 'Salud', 'expense', '#EC4899', 'heart', true),
  (gen_random_uuid(), NULL, 'Educación', 'expense', '#06B6D4', 'book-open', true),
  (gen_random_uuid(), NULL, 'Entretenimiento', 'expense', '#10B981', 'music', true),
  (gen_random_uuid(), NULL, 'Indumentaria', 'expense', '#F59E0B', 'shirt', true),
  (gen_random_uuid(), NULL, 'Tecnología', 'expense', '#3B82F6', 'smartphone', true),
  (gen_random_uuid(), NULL, 'Restaurantes', 'expense', '#84CC16', 'utensils', true),
  (gen_random_uuid(), NULL, 'Viajes', 'expense', '#14B8A6', 'plane', true),
  (gen_random_uuid(), NULL, 'Otros gastos', 'expense', '#6B7280', 'more-horizontal', true)
ON CONFLICT DO NOTHING;

-- Income categories
INSERT INTO public.categories (id, user_id, name, type, color, icon, is_default) VALUES
  (gen_random_uuid(), NULL, 'Sueldo', 'income', '#10B981', 'briefcase', true),
  (gen_random_uuid(), NULL, 'Freelance', 'income', '#06B6D4', 'laptop', true),
  (gen_random_uuid(), NULL, 'Inversiones', 'income', '#8B5CF6', 'trending-up', true),
  (gen_random_uuid(), NULL, 'Alquiler cobrado', 'income', '#F97316', 'home', true),
  (gen_random_uuid(), NULL, 'Bono', 'income', '#EAB308', 'gift', true),
  (gen_random_uuid(), NULL, 'Otros ingresos', 'income', '#6B7280', 'more-horizontal', true)
ON CONFLICT DO NOTHING;

-- Saving categories
INSERT INTO public.categories (id, user_id, name, type, color, icon, is_default) VALUES
  (gen_random_uuid(), NULL, 'Euros', 'saving', '#3B82F6', 'euro', true),
  (gen_random_uuid(), NULL, 'Dólares', 'saving', '#10B981', 'dollar-sign', true),
  (gen_random_uuid(), NULL, 'Plazo Fijo', 'saving', '#F59E0B', 'piggy-bank', true),
  (gen_random_uuid(), NULL, 'Efectivo', 'saving', '#84CC16', 'banknote', true),
  (gen_random_uuid(), NULL, 'Cripto', 'saving', '#8B5CF6', 'bitcoin', true),
  (gen_random_uuid(), NULL, 'Acciones', 'saving', '#EF4444', 'bar-chart-2', true),
  (gen_random_uuid(), NULL, 'Otros ahorros', 'saving', '#6B7280', 'more-horizontal', true)
ON CONFLICT DO NOTHING;
