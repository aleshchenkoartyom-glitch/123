import { useGameStore } from '../store/gameStore';

export default function SettingsModal() {
  const showSettings = useGameStore(s => s.showSettings);
  const toggleSettings = useGameStore(s => s.toggleSettings);
  const settings = useGameStore(s => s.settings);
  const updateSettings = useGameStore(s => s.updateSettings);
  const setDifficulty = useGameStore(s => s.setDifficulty);
  const difficulty = useGameStore(s => s.difficulty);
  const resetGame = useGameStore(s => s.resetGame);
  const lang = settings.language;

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-h-[80vh] overflow-y-auto border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              ⚙️ {lang === 'ru' ? 'Настройки' : 'Settings'}
            </h2>
            <button
              onClick={toggleSettings}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            {/* Language */}
            <SettingRow label={lang === 'ru' ? 'Язык' : 'Language'} icon="🌍">
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ language: 'ru' })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${lang === 'ru' ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  Русский
                </button>
                <button
                  onClick={() => updateSettings({ language: 'en' })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${lang === 'en' ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  English
                </button>
              </div>
            </SettingRow>

            {/* Difficulty */}
            <SettingRow label={lang === 'ru' ? 'Сложность' : 'Difficulty'} icon="🎯">
              <div className="flex gap-2">
                {(['easy', 'normal', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${difficulty === d ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {d === 'easy' ? (lang === 'ru' ? 'Легко' : 'Easy') : d === 'normal' ? (lang === 'ru' ? 'Нормально' : 'Normal') : (lang === 'ru' ? 'Сложно' : 'Hard')}
                  </button>
                ))}
              </div>
            </SettingRow>

            {/* Grid */}
            <SettingRow label={lang === 'ru' ? 'Показать сетку' : 'Show Grid'} icon="📐">
              <Toggle value={settings.gridVisible} onChange={v => updateSettings({ gridVisible: v })} />
            </SettingRow>

            <SettingRow label={lang === 'ru' ? 'Привязка к сетке' : 'Snap to Grid'} icon="🧲">
              <Toggle value={settings.snapToGrid} onChange={v => updateSettings({ snapToGrid: v })} />
            </SettingRow>

            <SettingRow label={lang === 'ru' ? 'Шаг поворота' : 'Rotation Step'} icon="🔄">
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ rotationStep: 90 })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${settings.rotationStep === 90 ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-slate-50 text-slate-600'}`}
                >
                  90°
                </button>
                <button
                  onClick={() => updateSettings({ rotationStep: 45 })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${settings.rotationStep === 45 ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-slate-50 text-slate-600'}`}
                >
                  45°
                </button>
              </div>
            </SettingRow>

            {/* Sound */}
            <SettingRow label={lang === 'ru' ? 'Звук' : 'Sound'} icon="🔊">
              <Toggle value={settings.soundEnabled} onChange={v => updateSettings({ soundEnabled: v })} />
            </SettingRow>

            {/* Notifications */}
            <SettingRow label={lang === 'ru' ? 'Уведомления' : 'Notifications'} icon="🔔">
              <Toggle value={settings.showNotifications} onChange={v => updateSettings({ showNotifications: v })} />
            </SettingRow>

            {/* LOD */}
            <SettingRow label={lang === 'ru' ? 'Качество графики' : 'Graphics Quality'} icon="🖥️">
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => updateSettings({ lodLevel: l })}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${settings.lodLevel === l ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-slate-50 text-slate-600'}`}
                  >
                    {l === 'low' ? (lang === 'ru' ? 'Низкое' : 'Low') : l === 'medium' ? (lang === 'ru' ? 'Среднее' : 'Medium') : (lang === 'ru' ? 'Высокое' : 'High')}
                  </button>
                ))}
              </div>
            </SettingRow>

            {/* Accessibility */}
            <SettingRow label={lang === 'ru' ? 'Доступность' : 'Accessibility'} icon="♿">
              <Toggle value={settings.accessibilityMode} onChange={v => updateSettings({ accessibilityMode: v })} />
            </SettingRow>

            {settings.accessibilityMode && (
              <SettingRow label={lang === 'ru' ? 'Масштаб шрифта' : 'Font Scale'} icon="🔤">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSettings({ fontScale: Math.max(0.8, settings.fontScale - 0.1) })}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"
                  >
                    −
                  </button>
                  <span className="text-sm w-10 text-center">{settings.fontScale.toFixed(1)}</span>
                  <button
                    onClick={() => updateSettings({ fontScale: Math.min(1.5, settings.fontScale + 0.1) })}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"
                  >
                    +
                  </button>
                </div>
              </SettingRow>
            )}

            {/* Camera sensitivity */}
            <SettingRow label={lang === 'ru' ? 'Чувствительность камеры' : 'Camera Sensitivity'} icon="📷">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.cameraSensitivity}
                onChange={e => updateSettings({ cameraSensitivity: parseFloat(e.target.value) })}
                className="w-24 accent-violet-500"
              />
            </SettingRow>

            {/* Reset */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (confirm(lang === 'ru' ? 'Сбросить все данные?' : 'Reset all data?')) {
                    resetGame();
                    toggleSettings();
                  }
                }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-sm text-red-700 transition-colors"
              >
                🗑️ {lang === 'ru' ? 'Сбросить игру' : 'Reset Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700 flex items-center gap-2">
        <span>{icon}</span> {label}
      </span>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-violet-500' : 'bg-slate-300'}`}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: value ? '22px' : '2px' }}
      />
    </button>
  );
}
