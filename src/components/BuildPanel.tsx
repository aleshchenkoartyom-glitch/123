import { useState, useMemo } from 'react';
import { useGameStore, BUILDING_DEFS, buildingCost, type BuildingType } from '../store/gameStore';

const CATEGORIES = [
  { id: 'power', label: 'Энергия', labelEn: 'Power', icon: '⚡', types: ['power_plant_coal', 'power_plant_solar', 'power_plant_wind'] as BuildingType[] },
  { id: 'production', label: 'Производство', labelEn: 'Production', icon: '🏭', types: ['factory_basic', 'factory_advanced', 'factory_chemical'] as BuildingType[] },
  { id: 'storage', label: 'Склады', labelEn: 'Storage', icon: '📦', types: ['warehouse_small', 'warehouse_large'] as BuildingType[] },
  { id: 'water', label: 'Водоснабжение', labelEn: 'Water', icon: '💧', types: ['water_pump', 'water_tower', 'sewage_plant'] as BuildingType[] },
  { id: 'services', label: 'Услуги', labelEn: 'Services', icon: '🏢', types: ['office', 'repair_depot', 'market_stall'] as BuildingType[] },
  { id: 'roads', label: 'Дороги', labelEn: 'Roads', icon: '🛤️', types: ['road_straight', 'road_cross'] as BuildingType[] },
];

export default function BuildPanel() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const selectedType = useGameStore(s => s.selectedBuildingType);
  const setSelectedType = useGameStore(s => s.setSelectedBuildingType);
  const rotateGhost = useGameStore(s => s.rotateGhost);
  const level = useGameStore(s => s.level);
  const balance = useGameStore(s => s.balance);
  const lang = useGameStore(s => s.settings.language);
  const gridVisible = useGameStore(s => s.settings.gridVisible);
  const snapToGrid = useGameStore(s => s.settings.snapToGrid);
  const updateSettings = useGameStore(s => s.updateSettings);
  const rotationStep = useGameStore(s => s.settings.rotationStep);

  const availableBuildings = useMemo(() => {
    if (!activeCategory) return [];
    const cat = CATEGORIES.find(c => c.id === activeCategory);
    if (!cat) return [];
    return cat.types.map(t => BUILDING_DEFS[t]).filter(d => d.unlockLevel <= level);
  }, [activeCategory, level]);

  return (
    <div className="absolute left-3 top-3 bottom-3 w-64 flex flex-col gap-2 pointer-events-auto z-10">
      {/* Categories */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-100 p-3">
        <h3 className="text-sm font-semibold text-slate-600 mb-2 px-1">
          {lang === 'ru' ? '🔨 Строительство' : '🔨 Build'}
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`flex flex-col items-center p-2 rounded-xl text-xs transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-emerald-100 text-emerald-800 shadow-sm scale-105'
                  : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:scale-102'
              }`}
            >
              <span className="text-lg mb-0.5">{cat.icon}</span>
              <span className="font-medium truncate w-full text-center leading-tight">
                {lang === 'ru' ? cat.label : cat.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Building list */}
      {activeCategory && availableBuildings.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-100 p-3 flex-1 overflow-y-auto">
          <div className="space-y-1.5">
            {availableBuildings.map(def => {
              const cost = buildingCost(def, level);
              const canAfford = balance >= cost;
              const isSelected = selectedType === def.type;

              return (
                <button
                  key={def.type}
                  onClick={() => setSelectedType(isSelected ? null : def.type)}
                  disabled={!canAfford}
                  className={`w-full p-2.5 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-100 border-2 border-emerald-400 shadow-md'
                      : canAfford
                        ? 'bg-slate-50 border-2 border-transparent hover:bg-emerald-50 hover:border-emerald-200'
                        : 'bg-red-50 border-2 border-transparent opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{def.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {lang === 'ru' ? def.name : def.nameEn}
                      </div>
                      <div className="text-xs text-slate-500">
                        {cost.toLocaleString()}₽ • {def.footprint.w}×{def.footprint.h}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-500">
                    {lang === 'ru' ? def.description : def.descriptionEn}
                  </div>
                  <div className="mt-1 flex gap-2 text-xs">
                    {def.powerOutput > 0 && <span className="text-amber-600">⚡+{def.powerOutput}</span>}
                    {def.powerNeed > 0 && <span className="text-red-500">⚡-{def.powerNeed}</span>}
                    {def.waterNeed < 0 && <span className="text-blue-500">💧+{Math.abs(def.waterNeed)}</span>}
                    {def.waterNeed > 0 && <span className="text-blue-700">💧-{def.waterNeed}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active tool info */}
      {selectedType && (
        <div className="bg-emerald-50/90 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-200 p-3">
          <div className="text-sm font-medium text-emerald-800 mb-2">
            {lang === 'ru' ? '📐 Размещение' : '📐 Placing'}
          </div>
          <button
            onClick={rotateGhost}
            className="w-full py-1.5 px-3 bg-emerald-200 hover:bg-emerald-300 rounded-lg text-sm text-emerald-800 transition-colors mb-2"
          >
            🔄 {lang === 'ru' ? `Повернуть (${rotationStep}°)` : `Rotate (${rotationStep}°)`}
          </button>
          <button
            onClick={() => setSelectedType(null)}
            className="w-full py-1.5 px-3 bg-red-100 hover:bg-red-200 rounded-lg text-sm text-red-700 transition-colors"
          >
            ✕ {lang === 'ru' ? 'Отменить' : 'Cancel'}
          </button>
        </div>
      )}

      {/* Grid controls */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-100 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">
            {lang === 'ru' ? 'Сетка' : 'Grid'}
          </span>
          <button
            onClick={() => updateSettings({ gridVisible: !gridVisible })}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${gridVisible ? 'bg-emerald-400' : 'bg-slate-300'}`}
          >
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200" style={{ left: gridVisible ? '22px' : '2px' }} />
          </button>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">
            {lang === 'ru' ? 'Привязка' : 'Snap'}
          </span>
          <button
            onClick={() => updateSettings({ snapToGrid: !snapToGrid })}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${snapToGrid ? 'bg-emerald-400' : 'bg-slate-300'}`}
          >
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200" style={{ left: snapToGrid ? '22px' : '2px' }} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">
            {lang === 'ru' ? 'Поворот' : 'Rotation'}
          </span>
          <button
            onClick={() => updateSettings({ rotationStep: rotationStep === 90 ? 45 : 90 })}
            className="text-xs px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            {rotationStep}°
          </button>
        </div>
      </div>
    </div>
  );
}
