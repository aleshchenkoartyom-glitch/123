import { useGameStore, BUILDING_DEFS, expForLevel } from '../store/gameStore';

export default function InfoPanel() {
  const level = useGameStore(s => s.level);
  const exp = useGameStore(s => s.exp);
  const balance = useGameStore(s => s.balance);
  const lang = useGameStore(s => s.settings.language);
  const totalPowerOutput = useGameStore(s => s.totalPowerOutput);
  const totalPowerNeed = useGameStore(s => s.totalPowerNeed);
  const totalWaterOutput = useGameStore(s => s.totalWaterOutput);
  const totalWaterNeed = useGameStore(s => s.totalWaterNeed);
  const totalWasteOutput = useGameStore(s => s.totalWasteOutput);
  const totalWasteCapacity = useGameStore(s => s.totalWasteCapacity);
  const globalProductivity = useGameStore(s => s.globalProductivity);
  const buildings = useGameStore(s => s.buildings);
  const selectedPlacedBuilding = useGameStore(s => s.selectedPlacedBuilding);
  const removeBuilding = useGameStore(s => s.removeBuilding);
  const repairBuilding = useGameStore(s => s.repairBuilding);
  const events = useGameStore(s => s.events);
  const marketPrices = useGameStore(s => s.marketPrices);
  const tick = useGameStore(s => s.tick);
  const difficulty = useGameStore(s => s.difficulty);

  const expNeeded = expForLevel(level);
  const expPercent = Math.min(100, (exp / expNeeded) * 100);

  const selectedBuilding = buildings.find(b => b.id === selectedPlacedBuilding);
  const selectedDef = selectedBuilding ? BUILDING_DEFS[selectedBuilding.type] : null;

  const powerOk = totalPowerNeed === 0 || totalPowerOutput >= totalPowerNeed;
  const waterOk = totalWaterNeed === 0 || totalWaterOutput >= totalWaterNeed;

  return (
    <div className="absolute right-3 top-3 bottom-3 w-72 flex flex-col gap-2 pointer-events-auto z-10 overflow-y-auto">
      {/* Player info */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-violet-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {level}
            </div>
            <div>
              <div className="text-xs text-slate-500">{lang === 'ru' ? 'Уровень' : 'Level'}</div>
              <div className="text-sm font-bold text-slate-800">{level}/50</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{lang === 'ru' ? 'Сложность' : 'Difficulty'}</div>
            <div className="text-xs font-medium text-slate-700 capitalize">{difficulty}</div>
          </div>
        </div>
        {/* EXP bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>EXP</span>
            <span>{exp}/{expNeeded}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
        {/* Balance */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3">
          <div className="text-xs text-emerald-600 mb-0.5">{lang === 'ru' ? 'Баланс' : 'Balance'}</div>
          <div className="text-xl font-bold text-emerald-800">
            {balance.toLocaleString()} ₽
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-amber-100 p-4">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          {lang === 'ru' ? '📊 Ресурсы' : '📊 Resources'}
        </h3>
        <div className="space-y-2.5">
          <ResourceBar
            icon="⚡" label={lang === 'ru' ? 'Энергия' : 'Power'}
            current={totalPowerOutput} max={totalPowerNeed}
            color={powerOk ? 'bg-amber-400' : 'bg-red-400'}
            ok={powerOk}
          />
          <ResourceBar
            icon="💧" label={lang === 'ru' ? 'Вода' : 'Water'}
            current={totalWaterOutput} max={totalWaterNeed}
            color={waterOk ? 'bg-blue-400' : 'bg-red-400'}
            ok={waterOk}
          />
          <ResourceBar
            icon="♻️" label={lang === 'ru' ? 'Отходы' : 'Waste'}
            current={totalWasteCapacity} max={totalWasteOutput}
            color={totalWasteOutput <= totalWasteCapacity ? 'bg-green-400' : 'bg-red-400'}
            ok={totalWasteOutput <= totalWasteCapacity}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">⚙️ {lang === 'ru' ? 'Производительность' : 'Productivity'}</span>
            <span className={`font-bold ${globalProductivity >= 0.8 ? 'text-emerald-600' : globalProductivity >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
              {Math.round(globalProductivity * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Market prices */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100 p-4">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">
          {lang === 'ru' ? '📈 Биржа' : '📈 Market'}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(marketPrices).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-500 capitalize">{key}</div>
              <div className="text-sm font-bold text-slate-700">{value}₽</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected building info */}
      {selectedBuilding && selectedDef && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-sky-100 p-4">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">
            {selectedDef.icon} {lang === 'ru' ? selectedDef.name : selectedDef.nameEn}
          </h3>
          <div className="space-y-1.5 text-xs text-slate-600 mb-3">
            <div className="flex justify-between">
              <span>{lang === 'ru' ? 'Здоровье' : 'Health'}</span>
              <span className={selectedBuilding.health > 50 ? 'text-emerald-600' : 'text-red-600'}>
                {selectedBuilding.health}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'ru' ? 'Температура' : 'Temperature'}</span>
              <span className={selectedBuilding.temperature < 50 ? 'text-slate-700' : 'text-red-600'}>
                {Math.round(selectedBuilding.temperature)}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'ru' ? 'Статус' : 'Status'}</span>
              <span className={selectedBuilding.active ? 'text-emerald-600' : 'text-red-600'}>
                {selectedBuilding.active ? (lang === 'ru' ? 'Активно' : 'Active') : (lang === 'ru' ? 'Отключено' : 'Inactive')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'ru' ? 'Позиция' : 'Position'}</span>
              <span>({selectedBuilding.x}, {selectedBuilding.z})</span>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedBuilding.health < 100 && (
              <button
                onClick={() => repairBuilding(selectedBuilding.id)}
                className="flex-1 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-xs text-blue-700 transition-colors"
              >
                🔧 {lang === 'ru' ? 'Ремонт 500₽' : 'Repair 500₽'}
              </button>
            )}
            <button
              onClick={() => removeBuilding(selectedBuilding.id)}
              className="flex-1 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-xs text-red-700 transition-colors"
            >
              🗑️ {lang === 'ru' ? 'Снести' : 'Demolish'}
            </button>
          </div>
        </div>
      )}

      {/* Active events */}
      {events.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-orange-100 p-4">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">
            {lang === 'ru' ? '⚠️ События' : '⚠️ Events'}
          </h3>
          <div className="space-y-1">
            {events.slice(-5).map(e => (
              <div key={e.id} className="text-xs text-slate-600 bg-orange-50 rounded-lg p-2">
                {lang === 'ru' ? e.description : e.descriptionEn}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-4">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{lang === 'ru' ? 'Зданий' : 'Buildings'}: {buildings.length}</span>
          <span>{lang === 'ru' ? 'Тик' : 'Tick'}: {tick}</span>
        </div>
      </div>
    </div>
  );
}

function ResourceBar({
  icon, label, current, max, color, ok
}: {
  icon: string; label: string; current: number; max: number; color: string; ok: boolean;
}) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-600">{icon} {label}</span>
        <span className={ok ? 'text-slate-600' : 'text-red-600 font-bold'}>
          {current}/{max} {!ok && '⚠️'}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
