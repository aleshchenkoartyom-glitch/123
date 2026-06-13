import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setLocalError(ru ? 'Пароли не совпадают' : 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setLocalError(ru ? 'Пароль минимум 6 символов' : 'Password must be at least 6 characters');
        return;
      }
      const success = await register(username, email, password);
      if (success) onClose();
    } else {
      const success = await login(username || email, password);
      if (success) onClose();
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {mode === 'login' 
                ? (ru ? '🔐 Вход' : '🔐 Login')
                : (ru ? '📝 Регистрация' : '📝 Register')}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ {displayError}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {ru ? 'Имя пользователя' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_]+"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder={ru ? 'Латиница и цифры' : 'Letters and numbers'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {mode === 'login' 
                ? (ru ? 'Логин или Email' : 'Login or Email')
                : 'Email'}
            </label>
            <input
              type={mode === 'register' ? 'email' : 'text'}
              value={mode === 'register' ? email : (username || email)}
              onChange={e => mode === 'register' ? setEmail(e.target.value) : setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              placeholder={mode === 'login' ? 'admin' : 'user@example.com'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {ru ? 'Пароль' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 6 : 1}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              placeholder="••••••"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {ru ? 'Подтвердите пароль' : 'Confirm Password'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (ru ? '⏳ Загрузка...' : '⏳ Loading...')
              : mode === 'login'
                ? (ru ? 'Войти' : 'Login')
                : (ru ? 'Зарегистрироваться' : 'Register')}
          </button>
        </form>

        {/* Footer */}
        <div className="px-5 pb-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              clearError();
              setLocalError('');
            }}
            className="text-sm text-violet-600 hover:text-violet-700 transition-colors"
          >
            {mode === 'login'
              ? (ru ? 'Нет аккаунта? Зарегистрируйтесь' : "Don't have an account? Register")
              : (ru ? 'Уже есть аккаунт? Войдите' : 'Already have an account? Login')}
          </button>
        </div>
      </div>
    </div>
  );
}
