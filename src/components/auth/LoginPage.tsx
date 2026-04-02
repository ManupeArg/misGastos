import { useState } from 'react';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

export function LoginPage({ onSignIn, onSignUp }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Completá todos los campos');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await onSignIn(email, password);
        toast.success('¡Bienvenido!');
      } else {
        await onSignUp(email, password);
        toast.success('¡Cuenta creada! Revisá tu email para confirmar.');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al autenticar';
      if (msg.includes('Invalid login credentials')) {
        toast.error('Email o contraseña incorrectos');
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Confirmá tu email antes de ingresar');
      } else if (msg.includes('User already registered')) {
        toast.error('Este email ya está registrado');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 mb-4">
            <TrendingUp size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">MisGastos</h1>
          <p className="text-slate-400 mt-1 text-sm">Controlá tus finanzas personales</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
          {/* Tab toggle */}
          <div className="flex bg-slate-900 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-9 pr-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-9 pr-10 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              {isLogin ? 'Ingresar' : 'Crear cuenta'}
            </Button>
          </form>

          {!isLogin && (
            <p className="text-xs text-slate-500 text-center mt-4">
              Al crear una cuenta, aceptás los términos de uso.
            </p>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Tus datos son privados y seguros
        </p>
      </div>
    </div>
  );
}
