import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import AuthModal from './AuthModal';

export default function UserMenu() {
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="px-3 py-1.5 bg-violet-100 hover:bg-violet-200 rounded-xl text-xs text-violet-700 transition-colors font-medium"
        >
          🔐 {ru ? 'Войти' : 'Login'}
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 rounded-xl text-xs text-violet-700 transition-colors"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
          {user.username[0].toUpperCase()}
        </div>
        <span className="font-medium max-w-[80px] truncate">{user.username}</span>
        {user.is_admin && <span className="text-amber-500">👑</span>}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="text-sm font-medium text-slate-800">{user.username}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            
            {user.is_admin && (
              <a
                href="#admin"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('openAdmin'));
                  setShowMenu(false);
                }}
                className="block px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
              >
                👑 {ru ? 'Админ-панель' : 'Admin Panel'}
              </a>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              🚪 {ru ? 'Выйти' : 'Logout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
