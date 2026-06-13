import { useMemo } from 'react';
import { useGameStore, BUILDING_DEFS } from '../store/gameStore';

export default function MiniMap() {
  const buildings = useGameStore(s => s.buildings);
  const lang = useGameStore(s => s.settings.language);

  const mapData = useMemo(() => {
    if (buildings.length === 0) return { minX: -20, minZ: -20, maxX: 20, maxZ: 20, buildings: [] };

    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
    for (const b of buildings) {
      const def = BUILDING_DEFS[b.type];
      minX = Math.min(minX, b.x);
      minZ = Math.min(minZ, b.z);
      maxX = Math.max(maxX, b.x + def.footprint.w);
      maxZ = Math.max(maxZ, b.z + def.footprint.h);
    }

    const padding = 10;
    return {
      minX: minX - padding,
      minZ: minZ - padding,
      maxX: maxX + padding,
      maxZ: maxZ + padding,
      buildings: buildings.map(b => {
        const def = BUILDING_DEFS[b.type];
        return { ...b, def };
      }),
    };
  }, [buildings]);

  const width = mapData.maxX - mapData.minX;
  const height = mapData.maxZ - mapData.minZ;
  const mapSize = 140;
  const scale = Math.min(mapSize / width, mapSize / height);

  return (
    <div className="absolute right-3 bottom-16 z-10 pointer-events-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-2 overflow-hidden">
        <div className="text-xs text-slate-500 mb-1 text-center font-medium">
          {lang === 'ru' ? 'Карта' : 'Map'}
        </div>
        <svg width={mapSize} height={mapSize} className="bg-emerald-50 rounded-lg">
          {/* Grid */}
          <defs>
            <pattern id="miniGrid" width={scale} height={scale} patternUnits="userSpaceOnUse">
              <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#86EFAC" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width={mapSize} height={mapSize} fill="url(#miniGrid)" />

          {/* Buildings */}
          {mapData.buildings.map(b => (
            <rect
              key={b.id}
              x={(b.x - mapData.minX) * scale}
              y={(b.z - mapData.minZ) * scale}
              width={b.def.footprint.w * scale}
              height={b.def.footprint.h * scale}
              fill={b.def.color}
              opacity={b.active ? 0.8 : 0.3}
              rx="1"
            />
          ))}

          {/* Center mark */}
          <circle cx={mapSize / 2} cy={mapSize / 2} r="2" fill="none" stroke="#6366F1" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
