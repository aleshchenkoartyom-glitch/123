import { useGameStore } from '../store/gameStore';

export default function BottomBar() {
  const eventLog = useGameStore(s => s.eventLog);
  const gameSpeed = useGameStore(s => s.gameSpeed);
  const setGameSpeed = useGameStore(s => s.setGameSpeed);
  const toggleSettings = useGameStore(s => s.toggleSettings);
  const toggleSaveLoad = useGameStore(s => s.toggleSaveLoad);
  const lang = useGameStore(s => s.settings.language);
  const tick = useGameStore(s => s.tick);

  const speeds = [
    { value: 0, label: '⏸', tooltip: lang === 'ru' ? 'Пауза' : 'Pause' },
    { value: 1, label: '▶', tooltip: lang === 'ru' ? 'Обычная' : 'Normal' },
    { value: 2, label: '▶▶', tooltip: lang === 'ru' ? 'Быстрая' : 'Fast' },
    { value: 3, label: '▶▶▶', tooltip: lang === 'ru' ? 'Ультра' : 'Ultra' },
  ];

  return (
    <div className="absolute bottom-3 left-72 right-80 pointer-events-auto z-10">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-3">
        <div className="flex items-center gap-3">
          {/* Speed controls */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
            {speeds.map(s => (
              <button
                key={s.value}
                onClick={() => setGameSpeed(s.value)}
                title={s.tooltip}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  gameSpeed === s.value
                    ? 'bg-violet-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Event log */}
          <div className="flex-1 h-8 overflow-hidden">
            <div className="text-xs text-slate-500 font-mono truncate">
              {eventLog.length > 0 ? eventLog[eventLog.length - 1] : (lang === 'ru' ? 'Журнал пуст' : 'Log empty')}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={toggleSaveLoad}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs text-blue-700 transition-colors"
              title={lang === 'ru' ? 'Сохранить/Загрузить' : 'Save/Load'}
            >
              💾
            </button>
            <button
              onClick={toggleSettings}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-slate-700 transition-colors"
              title={lang === 'ru' ? 'Настройки' : 'Settings'}
            >
              ⚙️
            </button>
          </div>

          {/* Tick counter */}
          <div className="text-xs text-slate-400 font-mono w-16 text-right">
            T:{tick}
          </div>
        </div>
      </div>
    </div>
  );
}
