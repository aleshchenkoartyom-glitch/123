import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { adminApi } from '../services/api';

interface AdminPanelProps {
  onClose: () => void;
}

type TabType = 'stats' | 'users' | 'settings' | 'buildings' | 'saves' | 'logs';

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const { user } = useAuthStore();
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  if (!user?.is_admin) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'stats', label: ru ? 'Статистика' : 'Stats', icon: '📊' },
    { id: 'users', label: ru ? 'Пользователи' : 'Users', icon: '👥' },
    { id: 'settings', label: ru ? 'Настройки' : 'Settings', icon: '⚙️' },
    { id: 'buildings', label: ru ? 'Здания' : 'Buildings', icon: '🏗️' },
    { id: 'saves', label: ru ? 'Сохранения' : 'Saves', icon: '💾' },
    { id: 'logs', label: ru ? 'Логи' : 'Logs', icon: '📋' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/80 backdrop-blur-sm">
      {/* Sidebar */}
      <div className="w-56 bg-slate-800 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold flex items-center gap-2">
            👑 {ru ? 'Админ-панель' : 'Admin Panel'}
          </h1>
        </div>
        <nav className="flex-1 p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            ← {ru ? 'Вернуться к игре' : 'Back to Game'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-slate-100 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'buildings' && <BuildingsTab />}
          {activeTab === 'saves' && <SavesTab />}
          {activeTab === 'logs' && <LogsTab />}
        </div>
      </div>
    </div>
  );
}

// ===================== STATS TAB =====================
function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        📊 {ru ? 'Статистика' : 'Statistics'}
      </h2>

      {/* Overview cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label={ru ? 'Пользователей' : 'Users'} value={stats?.total_users || 0} icon="👥" color="blue" />
        <StatCard label={ru ? 'Сохранений' : 'Saves'} value={stats?.total_saves || 0} icon="💾" color="green" />
        <StatCard label={ru ? 'Активных (7д)' : 'Active (7d)'} value={stats?.active_users_7d || 0} icon="📈" color="violet" />
        <StatCard label={ru ? 'Ср. уровень' : 'Avg Level'} value={stats?.avg_level || 0} icon="🎖️" color="amber" />
      </div>

      {/* Top players */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          🏆 {ru ? 'Топ игроков' : 'Top Players'}
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-2">#</th>
              <th className="py-2">{ru ? 'Игрок' : 'Player'}</th>
              <th className="py-2">{ru ? 'Уровень' : 'Level'}</th>
              <th className="py-2">{ru ? 'Баланс' : 'Balance'}</th>
            </tr>
          </thead>
          <tbody>
            {stats?.top_players?.map((player: any, i: number) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-2 text-slate-400">{i + 1}</td>
                <td className="py-2 font-medium">{player.username}</td>
                <td className="py-2">{player.level}</td>
                <td className="py-2">{Number(player.balance).toLocaleString()}₽</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  };
  
  return (
    <div className={`bg-gradient-to-br ${colors[color] || colors.blue} rounded-xl p-4 text-white`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

// ===================== USERS TAB =====================
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminApi.getUsers(1, search);
      setUsers(response.users as any[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    loadUsers();
  };

  const handleDelete = async (userId: number) => {
    if (!confirm(ru ? 'Удалить пользователя?' : 'Delete user?')) return;
    try {
      await adminApi.deleteUser(userId);
      loadUsers();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await adminApi.updateUser(editingUser.id, editingUser);
      setEditingUser(null);
      loadUsers();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        👥 {ru ? 'Пользователи' : 'Users'}
      </h2>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={ru ? 'Поиск по имени или email...' : 'Search by name or email...'}
          className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm">
          🔍
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-600 text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">{ru ? 'Имя' : 'Username'}</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">{ru ? 'Админ' : 'Admin'}</th>
              <th className="px-4 py-3">{ru ? 'Сохранений' : 'Saves'}</th>
              <th className="px-4 py-3">{ru ? 'Действия' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">{user.id}</td>
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">{user.is_admin ? '👑' : '—'}</td>
                <td className="px-4 py-3">{user.saves_count || 0}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingUser({ ...user })}
                    className="text-blue-600 hover:text-blue-700 mr-2"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">{ru ? 'Редактировать' : 'Edit'} #{editingUser.id}</h3>
            <div className="space-y-3">
              <input
                value={editingUser.username}
                onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Username"
              />
              <input
                value={editingUser.email}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Email"
              />
              <input
                type="password"
                onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder={ru ? 'Новый пароль (оставьте пустым)' : 'New password (leave empty)'}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingUser.is_admin}
                  onChange={e => setEditingUser({ ...editingUser, is_admin: e.target.checked })}
                />
                <span>{ru ? 'Администратор' : 'Administrator'}</span>
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleUpdate} className="flex-1 py-2 bg-violet-500 text-white rounded-lg">
                {ru ? 'Сохранить' : 'Save'}
              </button>
              <button onClick={() => setEditingUser(null)} className="flex-1 py-2 bg-slate-200 rounded-lg">
                {ru ? 'Отмена' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== SETTINGS TAB =====================
function SettingsTab() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      setSettings(response.settings as any[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      setSaving(key);
      await adminApi.updateSetting(key, value);
      loadSettings();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        ⚙️ {ru ? 'Настройки игры' : 'Game Settings'}
      </h2>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="space-y-4">
          {settings.map(setting => (
            <div key={setting.setting_key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <div className="font-medium text-slate-800">{setting.setting_key}</div>
                <div className="text-xs text-slate-500">{setting.description}</div>
              </div>
              <div className="flex items-center gap-2">
                {setting.setting_type === 'boolean' ? (
                  <button
                    onClick={() => handleUpdate(setting.setting_key, setting.setting_value === 'true' ? 'false' : 'true')}
                    disabled={saving === setting.setting_key}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      setting.setting_value === 'true' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      setting.setting_value === 'true' ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                ) : (
                  <input
                    type={setting.setting_type === 'number' ? 'number' : 'text'}
                    value={setting.setting_value}
                    onChange={e => {
                      const newSettings = settings.map(s => 
                        s.setting_key === setting.setting_key 
                          ? { ...s, setting_value: e.target.value }
                          : s
                      );
                      setSettings(newSettings);
                    }}
                    onBlur={e => handleUpdate(setting.setting_key, e.target.value)}
                    className="w-32 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-right"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== BUILDINGS TAB =====================
function BuildingsTab() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const response = await adminApi.getBuildings();
      setBuildings(response.buildings as any[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await adminApi.updateBuilding(editing);
      setEditing(null);
      loadBuildings();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          🏗️ {ru ? 'Здания' : 'Buildings'}
        </h2>
        <button
          onClick={() => setEditing({ type: '', name_ru: '', name_en: '', icon: '🏠', base_cost: 1000, tier: 1, unlock_level: 1 })}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm"
        >
          + {ru ? 'Добавить' : 'Add'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-600 text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">{ru ? 'Тип' : 'Type'}</th>
              <th className="px-4 py-3">{ru ? 'Название' : 'Name'}</th>
              <th className="px-4 py-3">{ru ? 'Цена' : 'Price'}</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">{ru ? 'Уровень' : 'Level'}</th>
              <th className="px-4 py-3">{ru ? 'Активно' : 'Active'}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {buildings.map(b => (
              <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">{b.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{b.type}</td>
                <td className="px-4 py-3">{b.icon} {ru ? b.name_ru : b.name_en}</td>
                <td className="px-4 py-3">{Number(b.base_cost).toLocaleString()}₽</td>
                <td className="px-4 py-3">{b.tier}</td>
                <td className="px-4 py-3">{b.unlock_level}</td>
                <td className="px-4 py-3">{b.is_active ? '✅' : '❌'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing({ ...b })} className="text-blue-600">✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editing.id ? (ru ? 'Редактировать' : 'Edit') : (ru ? 'Добавить' : 'Add')} {ru ? 'здание' : 'building'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Type" value={editing.type} onChange={v => setEditing({ ...editing, type: v })} />
              <Input label="Icon" value={editing.icon} onChange={v => setEditing({ ...editing, icon: v })} />
              <Input label="Name (RU)" value={editing.name_ru} onChange={v => setEditing({ ...editing, name_ru: v })} />
              <Input label="Name (EN)" value={editing.name_en} onChange={v => setEditing({ ...editing, name_en: v })} />
              <Input label="Base Cost" type="number" value={editing.base_cost} onChange={v => setEditing({ ...editing, base_cost: +v })} />
              <Input label="Tier" type="number" value={editing.tier} onChange={v => setEditing({ ...editing, tier: +v })} />
              <Input label="Unlock Level" type="number" value={editing.unlock_level} onChange={v => setEditing({ ...editing, unlock_level: +v })} />
              <Input label="Footprint W" type="number" value={editing.footprint_w} onChange={v => setEditing({ ...editing, footprint_w: +v })} />
              <Input label="Footprint H" type="number" value={editing.footprint_h} onChange={v => setEditing({ ...editing, footprint_h: +v })} />
              <Input label="Height" type="number" value={editing.height} onChange={v => setEditing({ ...editing, height: +v })} />
              <Input label="Power Output" type="number" value={editing.power_output} onChange={v => setEditing({ ...editing, power_output: +v })} />
              <Input label="Power Need" type="number" value={editing.power_need} onChange={v => setEditing({ ...editing, power_need: +v })} />
              <Input label="Water Need" type="number" value={editing.water_need} onChange={v => setEditing({ ...editing, water_need: +v })} />
              <Input label="Waste Output" type="number" value={editing.waste_output} onChange={v => setEditing({ ...editing, waste_output: +v })} />
              <Input label="Maintenance" type="number" value={editing.maintenance} onChange={v => setEditing({ ...editing, maintenance: +v })} />
              <Input label="Base EXP" type="number" value={editing.base_exp_build} onChange={v => setEditing({ ...editing, base_exp_build: +v })} />
              <Input label="Prod Rate" type="number" value={editing.production_rate} onChange={v => setEditing({ ...editing, production_rate: +v })} />
              <Input label="Prod Value" type="number" value={editing.production_value} onChange={v => setEditing({ ...editing, production_value: +v })} />
              <Input label="Color" value={editing.color} onChange={v => setEditing({ ...editing, color: v })} />
              <label className="flex items-center gap-2 col-span-2">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={e => setEditing({ ...editing, is_active: e.target.checked })}
                />
                <span>{ru ? 'Активно' : 'Active'}</span>
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="flex-1 py-2 bg-violet-500 text-white rounded-lg">
                {ru ? 'Сохранить' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2 bg-slate-200 rounded-lg">
                {ru ? 'Отмена' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
      />
    </div>
  );
}

// ===================== SAVES TAB =====================
function SavesTab() {
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      const response = await adminApi.getAllSaves();
      setSaves(response.saves as any[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        💾 {ru ? 'Все сохранения' : 'All Saves'}
      </h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-600 text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">{ru ? 'Игрок' : 'Player'}</th>
              <th className="px-4 py-3">{ru ? 'Название' : 'Name'}</th>
              <th className="px-4 py-3">{ru ? 'Уровень' : 'Level'}</th>
              <th className="px-4 py-3">{ru ? 'Баланс' : 'Balance'}</th>
              <th className="px-4 py-3">{ru ? 'Зданий' : 'Buildings'}</th>
              <th className="px-4 py-3">{ru ? 'Обновлено' : 'Updated'}</th>
            </tr>
          </thead>
          <tbody>
            {saves.map(s => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">{s.id}</td>
                <td className="px-4 py-3 font-medium">{s.username}</td>
                <td className="px-4 py-3">{s.save_name}</td>
                <td className="px-4 py-3">{s.player_level}</td>
                <td className="px-4 py-3">{Number(s.player_balance).toLocaleString()}₽</td>
                <td className="px-4 py-3">{s.buildings_count}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(s.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===================== LOGS TAB =====================
function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await adminApi.getLogs();
      setLogs(response.logs as any[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        📋 {ru ? 'Логи админа' : 'Admin Logs'}
      </h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-600 text-left">
              <th className="px-4 py-3">{ru ? 'Время' : 'Time'}</th>
              <th className="px-4 py-3">{ru ? 'Админ' : 'Admin'}</th>
              <th className="px-4 py-3">{ru ? 'Действие' : 'Action'}</th>
              <th className="px-4 py-3">{ru ? 'Цель' : 'Target'}</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{log.admin_username}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3 text-slate-500">{log.target_type} #{log.target_id}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===================== LOADING =====================
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}
