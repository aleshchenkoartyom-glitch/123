import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { savesApi, type SaveInfo } from '../services/api';

interface CloudSaveModalProps {
  onClose: () => void;
}

export default function CloudSaveModal({ onClose }: CloudSaveModalProps) {
  const [saves, setSaves] = useState<SaveInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'load' | 'save'>('load');

  const { isAuthenticated } = useAuthStore();
  const lang = useGameStore(s => s.settings.language);
  const loadGame = useGameStore(s => s.loadGame);
  const ru = lang === 'ru';

  useEffect(() => {
    if (isAuthenticated) {
      loadSaves();
    }
  }, [isAuthenticated]);

  const loadSaves = async () => {
    try {
      setLoading(true);
      const response = await savesApi.list();
      setSaves(response.saves);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (existingId?: number) => {
    try {
      setSaving(true);
      setError('');
      
      // Получаем текущие данные игры
      const gameState = useGameStore.getState();
      const saveData = {
        meta: { version: '1.0.0', timestamp: new Date().toISOString() },
        player: {
          name: gameState.playerName,
          level: gameState.level,
          exp: gameState.exp,
          balance: gameState.balance,
          totalEarned: gameState.totalEarned,
          totalSpent: gameState.totalSpent,
        },
        settings: gameState.settings,
        world: {
          buildings: gameState.buildings,
          events: gameState.events,
          tick: gameState.tick,
          gameSpeed: gameState.gameSpeed,
          difficulty: gameState.difficulty,
          gameMode: gameState.gameMode,
          marketPrices: gameState.marketPrices,
          marketVolatility: gameState.marketVolatility,
        },
        dialogs: gameState.dialogs,
        completedTasks: gameState.completedTasks,
      };

      await savesApi.save(saveData, saveName || 'Автосохранение', existingId);
      await loadSaves();
      setSaveName('');
      setActiveTab('load');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (saveId: number) => {
    try {
      setLoading(true);
      const response = await savesApi.load(saveId);
      const saveData = response.save.save_data as string | object;
      const json = typeof saveData === 'string' ? saveData : JSON.stringify(saveData);
      loadGame(json);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (saveId: number) => {
    if (!confirm(ru ? 'Удалить это сохранение?' : 'Delete this save?')) return;
    
    try {
      await savesApi.delete(saveId);
      await loadSaves();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(ru ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[95vw] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            ☁️ {ru ? 'Облачные сохранения' : 'Cloud Saves'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('load')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'load' 
                ? 'text-violet-600 border-b-2 border-violet-500 bg-violet-50' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            📂 {ru ? 'Загрузить' : 'Load'}
          </button>
          <button
            onClick={() => setActiveTab('save')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'save' 
                ? 'text-violet-600 border-b-2 border-violet-500 bg-violet-50' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            💾 {ru ? 'Сохранить' : 'Save'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {activeTab === 'save' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {ru ? 'Название сохранения' : 'Save Name'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder={ru ? 'Моё сохранение' : 'My save'}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? '⏳' : '💾'}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-500">
              ⏳ {ru ? 'Загрузка...' : 'Loading...'}
            </div>
          ) : saves.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              📭 {ru ? 'Нет сохранений' : 'No saves yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {saves.map(save => (
                <div
                  key={save.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">{save.save_name}</span>
                    <span className="text-xs text-slate-400">{formatDate(save.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span>🎖️ Lv.{save.player_level}</span>
                    <span>💰 {save.player_balance.toLocaleString()}₽</span>
                    <span>🏠 {save.buildings_count}</span>
                  </div>
                  <div className="flex gap-2">
                    {activeTab === 'load' && (
                      <button
                        onClick={() => handleLoad(save.id)}
                        className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        📂 {ru ? 'Загрузить' : 'Load'}
                      </button>
                    )}
                    {activeTab === 'save' && (
                      <button
                        onClick={() => handleSave(save.id)}
                        disabled={saving}
                        className="flex-1 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        🔄 {ru ? 'Перезаписать' : 'Overwrite'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(save.id)}
                      className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
