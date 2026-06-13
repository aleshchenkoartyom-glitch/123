import { create } from 'zustand';
import { authApi, setAuthToken, getAuthToken, type User } from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (login: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  login: async (login, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(login, password);
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: response.error || 'Ошибка входа', isLoading: false });
        return false;
      }
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(username, email, password);
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: response.error || 'Ошибка регистрации', isLoading: false });
        return false;
      }
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      setAuthToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authApi.me();
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthToken(null);
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch {
      setAuthToken(null);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
