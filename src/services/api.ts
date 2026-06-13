/**
 * API Service для работы с PHP бэкендом
 * 
 * НАСТРОЙКА:
 * Измените API_BASE_URL на адрес вашего PHP сервера
 */

// URL API (измените на ваш)
const API_BASE_URL = '/api';

// Типы данных
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: User;
}

export interface SaveInfo {
  id: number;
  save_name: string;
  player_level: number;
  player_balance: number;
  buildings_count: number;
  play_time: number;
  created_at: string;
  updated_at: string;
}

export interface GameSettings {
  starting_balance: number;
  exp_multiplier: number;
  cost_multiplier: number;
  maintenance_multiplier: number;
  breakdown_chance: number;
  max_level: number;
  enable_events: boolean;
  market_volatility: number;
  [key: string]: unknown;
}

// Хранение токена
let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function isAuthenticated(): boolean {
  return !!authToken;
}

// Базовый fetch с авторизацией
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Error');
  }

  return data;
}

// ===================== AUTH API =====================
export const authApi = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  async login(login: string, password: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
    
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  async me(): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth.php?action=me');
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth.php?action=logout');
    } finally {
      setAuthToken(null);
    }
  },
};

// ===================== SAVES API =====================
export const savesApi = {
  async list(): Promise<{ saves: SaveInfo[] }> {
    return apiFetch('/saves.php?action=list');
  },

  async save(saveData: unknown, saveName?: string, saveId?: number): Promise<{ save_id: number }> {
    return apiFetch('/saves.php?action=save', {
      method: 'POST',
      body: JSON.stringify({
        save_data: saveData,
        save_name: saveName,
        save_id: saveId,
      }),
    });
  },

  async load(saveId: number): Promise<{ save: { save_data: unknown } }> {
    return apiFetch(`/saves.php?action=load&id=${saveId}`);
  },

  async delete(saveId: number): Promise<void> {
    await apiFetch('/saves.php?action=delete', {
      method: 'POST',
      body: JSON.stringify({ save_id: saveId }),
    });
  },
};

// ===================== GAME API =====================
export const gameApi = {
  async getSettings(): Promise<{ settings: GameSettings }> {
    return apiFetch('/game.php?action=settings');
  },

  async getBuildings(): Promise<{ buildings: Record<string, unknown> }> {
    return apiFetch('/game.php?action=buildings');
  },

  async getLeaderboard(type: 'level' | 'balance' | 'buildings' = 'level', limit = 20): Promise<{ leaderboard: unknown[] }> {
    return apiFetch(`/game.php?action=leaderboard&type=${type}&limit=${limit}`);
  },
};

// ===================== ADMIN API =====================
export const adminApi = {
  // Users
  async getUsers(page = 1, search = ''): Promise<{ users: unknown[]; pagination: unknown }> {
    return apiFetch(`/admin.php?action=users&page=${page}&search=${encodeURIComponent(search)}`);
  },

  async getUser(id: number): Promise<{ user: unknown; saves: unknown[] }> {
    return apiFetch(`/admin.php?action=user&id=${id}`);
  },

  async updateUser(userId: number, data: Record<string, unknown>): Promise<void> {
    await apiFetch('/admin.php?action=user_update', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ...data }),
    });
  },

  async deleteUser(userId: number): Promise<void> {
    await apiFetch('/admin.php?action=user_delete', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // Settings
  async getSettings(): Promise<{ settings: unknown[] }> {
    return apiFetch('/admin.php?action=settings');
  },

  async updateSetting(key: string, value: string): Promise<void> {
    await apiFetch('/admin.php?action=setting_update', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  },

  // Buildings
  async getBuildings(): Promise<{ buildings: unknown[] }> {
    return apiFetch('/admin.php?action=buildings');
  },

  async updateBuilding(data: Record<string, unknown>): Promise<{ id: number }> {
    return apiFetch('/admin.php?action=building_update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // All saves
  async getAllSaves(page = 1): Promise<{ saves: unknown[]; pagination: unknown }> {
    return apiFetch(`/admin.php?action=all_saves&page=${page}`);
  },

  // Stats
  async getStats(): Promise<{ stats: unknown }> {
    return apiFetch('/admin.php?action=stats');
  },

  // Logs
  async getLogs(page = 1): Promise<{ logs: unknown[]; pagination: unknown }> {
    return apiFetch(`/admin.php?action=logs&page=${page}`);
  },
};
