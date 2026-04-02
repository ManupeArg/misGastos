# MisGastos 💰

App de finanzas personales con React + TypeScript + Supabase.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel (gratis)

---

## Paso 1 — Configurar Supabase (backend + auth)

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta gratis.
2. Creá un **nuevo proyecto** (elegí la región más cercana a Argentina: São Paulo).
3. Esperá que el proyecto se inicialice (~2 minutos).
4. Andá a **SQL Editor** (en el menú lateral) y pegá el contenido de `supabase/schema.sql`. Ejecutalo con el botón "Run".
5. Esto crea todas las tablas y las categorías predefinidas automáticamente.

### Obtener las credenciales

Andá a **Settings → API** y copiá:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Configurar Auth (importante)

En **Authentication → Settings**:
- Podés deshabilitar "Confirm email" si querés que los usuarios entren sin confirmar el email.
- Para producción, configurá el **Site URL** con tu URL de Vercel (lo hacés después del deploy).

---

## Paso 2 — Instalar y correr localmente

```bash
# 1. Entrá a la carpeta del proyecto
cd app-misGastos

# 2. Copiá el archivo de variables de entorno
cp .env.example .env

# 3. Editá .env con tus credenciales de Supabase
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...

# 4. Instalá las dependencias
npm install

# 5. Corré el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) para verla.

---

## Paso 3 — Deploy en Vercel (gratis, en la nube)

### Opción A: Desde GitHub (recomendado)

1. Subí la carpeta `app-misGastos` a un repositorio de GitHub.
2. Entrá a [vercel.com](https://vercel.com) y creá una cuenta gratis.
3. Hacé click en **"Add New Project"** → importá tu repositorio de GitHub.
4. En la pantalla de configuración, agregá las **variables de entorno**:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
5. Click en **Deploy**. ¡Listo! En ~2 minutos tenés la app en la nube.

### Opción B: Desde la CLI de Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
# Seguí los pasos y agregá las env vars cuando te lo pida
```

### Configurar el dominio en Supabase

Después del deploy, Vercel te da una URL como `https://mis-gastos-xxx.vercel.app`.
Andá a **Supabase → Authentication → Settings → Site URL** y ponés esa URL.

---

## Características de la app

### Pestaña Meses
- Navegación por año y mes en el sidebar
- Vista de todos los días del mes con sus movimientos
- Agregar **gastos** por día: nombre, categoría, monto, efectivo/tarjeta
  - Tarjeta: selección de cuotas (1, 3, 6, 12, 18, 24)
  - Cuotas: se crean automáticamente en los meses siguientes
  - Aviso recordatorio sobre variación de precio con tarjeta
- Agregar **ingresos** por día: nombre, categoría, monto
- CRUD completo (crear, editar, eliminar)
- Para eliminar cuotas: opción de eliminar solo una o todas
- **Sidebar** muestra: total ingresos, gastos, ahorros enviados y saldo a favor del mes

### Pestaña Ahorros
- Total acumulado de ahorros
- Ahorros agrupados por categoría (Euros, Dólares, Plazo Fijo, etc.)
- CRUD completo

### Pestaña Totales
- Tarjetas resumen: Ingresos, Gastos, Ahorros, Saldo a favor
- Total de ahorros histórico acumulado
- Filtros por año, mes y categoría
- Gráfico de barras de gastos por categoría con porcentajes
- **Comparar dos meses** lado a lado con diferencias

### Categorías predefinidas
**Gastos**: Alimentación, Transporte, Servicios, Alquiler/Vivienda, Salud, Educación, Entretenimiento, Indumentaria, Tecnología, Restaurantes, Viajes, Otros

**Ingresos**: Sueldo, Freelance, Inversiones, Alquiler cobrado, Bono, Otros

**Ahorros**: Euros, Dólares, Plazo Fijo, Efectivo, Cripto, Acciones, Otros

### Auth
- Login y registro con email + contraseña
- Cada usuario ve solo sus propios datos (Row Level Security en Supabase)

---

## Estructura del proyecto

```
src/
├── components/
│   ├── auth/          # LoginPage
│   ├── layout/        # AppLayout, Sidebar, Header
│   ├── expenses/      # ExpenseForm
│   ├── income/        # IncomeForm
│   ├── savings/       # SavingsForm
│   └── ui/            # Componentes base (Modal, Button, etc.)
├── hooks/             # useAuth, useExpenses, useIncomes, useSavings, etc.
├── lib/               # supabase.ts
├── pages/             # MonthPage, SavingsPage, TotalsPage
├── types/             # TypeScript types
└── utils/             # Formateadores (ARS, fechas en español)
supabase/
└── schema.sql         # Schema completo de la base de datos
```

---

## Agregar más usuarios

Cualquiera que tenga la URL de la app puede registrarse. Sus datos son completamente privados y separados gracias a Row Level Security (RLS) de Supabase.

Si querés que solo vos y tus amigos puedan registrarse, podés en **Supabase → Authentication → Settings** deshabilitar el registro público y crear usuarios manualmente desde el panel.
