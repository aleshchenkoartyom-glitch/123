import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, BUILDING_DEFS, type PlacedBuilding, type BuildingDef } from '../store/gameStore';

// ===================== BUILDING 3D MODEL =====================
function BuildingModel({ building }: { building: PlacedBuilding }) {
  const def = BUILDING_DEFS[building.type];
  const meshRef = useRef<THREE.Group>(null);
  const selectedId = useGameStore(s => s.selectedPlacedBuilding);
  const isSelected = selectedId === building.id;
  const lang = useGameStore(s => s.settings.language);

  const healthColor = useMemo(() => {
    if (building.health > 70) return def.color;
    if (building.health > 30) return '#F59E0B';
    return '#EF4444';
  }, [building.health, def.color]);

  const setSelected = useGameStore(s => s.setSelectedPlacedBuilding);

  // Animate damaged buildings
  useFrame(() => {
    if (meshRef.current && building.health < 50) {
      meshRef.current.position.y = def.height / 2 + Math.sin(Date.now() * 0.005) * 0.05;
    }
  });

  return (
    <group
      ref={meshRef}
      position={[building.x + def.footprint.w / 2, 0, building.z + def.footprint.h / 2]}
      rotation={[0, (building.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(building.id);
      }}
    >
      {/* Base/foundation */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[def.footprint.w - 0.1, 0.1, def.footprint.h - 0.1]} />
        <meshStandardMaterial color="#94A3B8" />
      </mesh>

      {/* Main building body */}
      <mesh position={[0, def.height / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[def.footprint.w - 0.2, def.height, def.footprint.h - 0.2]} />
        <meshStandardMaterial
          color={healthColor}
          roughness={0.6}
          metalness={0.2}
          emissive={isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={isSelected ? 0.15 : 0}
        />
      </mesh>

      {/* Building details based on type */}
      {def.type.includes('power_plant') && <PowerPlantDetails def={def} />}
      {def.type.includes('factory') && <FactoryDetails def={def} />}
      {def.type.includes('warehouse') && <WarehouseDetails def={def} />}
      {def.type.includes('water') && <WaterDetails def={def} />}
      {def.type === 'sewage_plant' && <SewageDetails def={def} />}
      {def.type === 'office' && <OfficeDetails def={def} />}
      {def.type === 'repair_depot' && <RepairDetails def={def} />}
      {def.type === 'market_stall' && <MarketDetails def={def} />}
      {(def.type === 'road_straight' || def.type === 'road_cross') && <RoadDetails def={def} />}

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(def.footprint.w, def.footprint.h) / 2 + 0.1, Math.max(def.footprint.w, def.footprint.h) / 2 + 0.2, 32]} />
          <meshBasicMaterial color="#60A5FA" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Health bar */}
      {building.health < 100 && (
        <group position={[0, def.height + 0.5, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshBasicMaterial color="#374151" />
          </mesh>
          <mesh position={[(building.health / 100 - 1) * 0.6, 0, 0.01]}>
            <boxGeometry args={[1.2 * (building.health / 100), 0.12, 0.05]} />
            <meshBasicMaterial color={building.health > 50 ? '#22C55E' : building.health > 25 ? '#F59E0B' : '#EF4444'} />
          </mesh>
        </group>
      )}

      {/* Building label */}
      <Text
        position={[0, def.height + 0.9, 0]}
        fontSize={0.3}
        color="#1E293B"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {def.icon} {lang === 'ru' ? def.name : def.nameEn}
      </Text>

      {/* Temperature warning */}
      {building.temperature > 50 && (
        <Text
          position={[0, def.height + 1.3, 0]}
          fontSize={0.25}
          color="#EF4444"
          anchorX="center"
          anchorY="bottom"
        >
          🌡️ {Math.floor(building.temperature)}°C
        </Text>
      )}

      {/* Inactive indicator */}
      {!building.active && (
        <Text
          position={[0, def.height + 1.5, 0]}
          fontSize={0.35}
          color="#EF4444"
          anchorX="center"
        >
          ⛔
        </Text>
      )}
    </group>
  );
}

// ===================== BUILDING DETAIL COMPONENTS =====================
function PowerPlantDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Chimney/smokestack */}
      <mesh position={[def.footprint.w / 4, def.height + 0.1, -def.footprint.h / 4]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, def.height * 0.6, 8]} />
        <meshStandardMaterial color="#4B5563" roughness={0.8} />
      </mesh>
      <mesh position={[def.footprint.w / 4, def.height * 1.3 + 0.1, -def.footprint.h / 4]}>
        <cylinderGeometry args={[0.25, 0.2, 0.2, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Second chimney */}
      <mesh position={[-def.footprint.w / 4, def.height * 0.9, def.footprint.h / 4]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, def.height * 0.4, 8]} />
        <meshStandardMaterial color="#6B7280" roughness={0.7} />
      </mesh>
      {/* Pipes */}
      <mesh position={[0, 0.5, def.footprint.h / 2 - 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, def.footprint.w * 0.6, 6]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.6} />
      </mesh>
      {/* Antenna */}
      <mesh position={[-def.footprint.w / 3, def.height + 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.9} />
      </mesh>
      {/* Windows (row) */}
      {[-0.5, 0, 0.5].map((offset, i) => (
        <mesh key={i} position={[def.footprint.w / 2 - 0.09, def.height * 0.6, offset]}>
          <boxGeometry args={[0.02, 0.3, 0.25]} />
          <meshStandardMaterial color="#BFDBFE" emissive="#93C5FD" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Door */}
      <mesh position={[def.footprint.w / 2 - 0.09, 0.5, 0]}>
        <boxGeometry args={[0.02, 0.8, 0.5]} />
        <meshStandardMaterial color="#7C3AED" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FactoryDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Roof (pitched) */}
      <mesh position={[0, def.height + 0.1, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[def.footprint.w - 0.15, 0.15, def.footprint.h - 0.15]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      {/* Smokestacks */}
      {[0.4, -0.4].map((x, i) => (
        <mesh key={i} position={[x, def.height + 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 1, 8]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
      ))}
      {/* Loading dock */}
      <mesh position={[0, 0.3, def.footprint.h / 2]}>
        <boxGeometry args={[def.footprint.w * 0.5, 0.5, 0.3]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      {/* Windows */}
      {[-0.6, -0.2, 0.2, 0.6].map((z, i) => (
        <mesh key={i} position={[def.footprint.w / 2 - 0.09, def.height * 0.7, z]}>
          <boxGeometry args={[0.02, 0.4, 0.2]} />
          <meshStandardMaterial color="#BFDBFE" emissive="#93C5FD" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* Conveyor belt hint */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[def.footprint.w * 0.3, 0.05, def.footprint.h * 0.8]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.4} />
      </mesh>
      {/* Door */}
      <mesh position={[-def.footprint.w / 2 + 0.09, 0.6, 0]}>
        <boxGeometry args={[0.02, 1, 0.7]} />
        <meshStandardMaterial color="#1E40AF" roughness={0.9} />
      </mesh>
    </group>
  );
}

function WarehouseDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Roller door */}
      <mesh position={[def.footprint.w / 2 - 0.09, def.height * 0.35 + 0.1, 0]}>
        <boxGeometry args={[0.02, def.height * 0.65, def.footprint.h * 0.5]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.5} />
      </mesh>
      {/* Horizontal stripes on roller door */}
      {[0.2, 0.5, 0.8].map((y, i) => (
        <mesh key={i} position={[def.footprint.w / 2 - 0.08, y, 0]}>
          <boxGeometry args={[0.02, 0.02, def.footprint.h * 0.48]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
      ))}
      {/* Roof cap */}
      <mesh position={[0, def.height + 0.2, 0]}>
        <boxGeometry args={[def.footprint.w + 0.1, 0.15, def.footprint.h + 0.1]} />
        <meshStandardMaterial color="#78716C" />
      </mesh>
    </group>
  );
}

function WaterDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Water tank (cylinder) */}
      <mesh position={[0, def.height / 2 + 0.1, 0]} castShadow>
        <cylinderGeometry args={[def.footprint.w * 0.35, def.footprint.w * 0.35, def.height * 0.7, 16]} />
        <meshStandardMaterial color="#3B82F6" roughness={0.3} metalness={0.4} transparent opacity={0.85} />
      </mesh>
      {/* Pipes */}
      <mesh position={[def.footprint.w * 0.3, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, def.footprint.h * 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.7} />
      </mesh>
      {/* Valve wheel */}
      <mesh position={[def.footprint.w * 0.35, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.02, 8, 12]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
    </group>
  );
}

function SewageDetails({ def: _def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Treatment pools */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
          <meshStandardMaterial color="#059669" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Pipes connecting pools */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
        <meshStandardMaterial color="#6B7280" metalness={0.6} />
      </mesh>
    </group>
  );
}

function OfficeDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Windows grid */}
      {[0.5, 1.2, 1.9, 2.6].map((y, yi) =>
        [-0.4, 0, 0.4].map((z, zi) => (
          <mesh key={`${yi}-${zi}`} position={[def.footprint.w / 2 - 0.09, y + 0.1, z]}>
            <boxGeometry args={[0.02, 0.35, 0.25]} />
            <meshStandardMaterial color="#BFDBFE" emissive="#60A5FA" emissiveIntensity={0.15} />
          </mesh>
        ))
      )}
      {/* Entrance */}
      <mesh position={[def.footprint.w / 2 - 0.09, 0.5, 0]}>
        <boxGeometry args={[0.03, 0.9, 0.6]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, def.height + 0.8, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 4]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.9} />
      </mesh>
      {/* Rooftop AC unit */}
      <mesh position={[0.3, def.height + 0.25, 0.3]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#D1D5DB" />
      </mesh>
    </group>
  );
}

function RepairDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Garage door */}
      <mesh position={[def.footprint.w / 2 - 0.09, def.height * 0.35 + 0.1, 0]}>
        <boxGeometry args={[0.02, def.height * 0.6, def.footprint.h * 0.6]} />
        <meshStandardMaterial color="#F97316" />
      </mesh>
      {/* Tool rack (side) */}
      <mesh position={[-def.footprint.w / 2 + 0.15, def.height * 0.5, 0]}>
        <boxGeometry args={[0.05, def.height * 0.5, 0.4]} />
        <meshStandardMaterial color="#78716C" />
      </mesh>
      {/* Sign */}
      <mesh position={[0, def.height + 0.3, def.footprint.h / 2 - 0.05]}>
        <boxGeometry args={[0.8, 0.3, 0.02]} />
        <meshStandardMaterial color="#DC2626" emissive="#EF4444" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function MarketDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      {/* Awning */}
      <mesh position={[0, def.height + 0.15, def.footprint.h * 0.3]}>
        <boxGeometry args={[def.footprint.w - 0.1, 0.05, 0.6]} />
        <meshStandardMaterial color="#F97316" />
      </mesh>
      {/* Counter */}
      <mesh position={[0, 0.5, def.footprint.h * 0.3]}>
        <boxGeometry args={[def.footprint.w * 0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#92400E" />
      </mesh>
      {/* Signage */}
      <mesh position={[0, def.height + 0.05, -def.footprint.h / 2 + 0.05]}>
        <boxGeometry args={[def.footprint.w * 0.6, 0.25, 0.02]} />
        <meshStandardMaterial color="#FDE68A" emissive="#FCD34D" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

function RoadDetails({ def }: { def: BuildingDef }) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.95, 0.95]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      {/* Center line */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 0.6]} />
        <meshStandardMaterial color="#FDE68A" />
      </mesh>
      {def.type === 'road_cross' && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.05, 0.6]} />
          <meshStandardMaterial color="#FDE68A" />
        </mesh>
      )}
    </group>
  );
}

// ===================== GHOST BUILDING =====================
function GhostBuilding() {
  const selectedType = useGameStore(s => s.selectedBuildingType);
  const ghostPos = useGameStore(s => s.ghostPosition);
  const ghostRot = useGameStore(s => s.ghostRotation);

  if (!selectedType || !ghostPos) return null;
  const def = BUILDING_DEFS[selectedType];

  return (
    <group
      position={[ghostPos.x + def.footprint.w / 2, 0, ghostPos.z + def.footprint.h / 2]}
      rotation={[0, (ghostRot * Math.PI) / 180, 0]}
    >
      <mesh position={[0, def.height / 2 + 0.1, 0]}>
        <boxGeometry args={[def.footprint.w - 0.2, def.height, def.footprint.h - 0.2]} />
        <meshStandardMaterial color={def.color} transparent opacity={0.4} wireframe={false} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[def.footprint.w, def.footprint.h]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ===================== GROUND PLANE + CLICK HANDLER =====================
function Ground() {
  const selectedType = useGameStore(s => s.selectedBuildingType);
  const setGhostPos = useGameStore(s => s.setGhostPosition);
  const placeBuilding = useGameStore(s => s.placeBuilding);
  const snapToGrid = useGameStore(s => s.settings.snapToGrid);
  const setSelectedPlaced = useGameStore(s => s.setSelectedPlacedBuilding);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!selectedType) return;
    e.stopPropagation();
    const point = e.point;
    const x = snapToGrid ? Math.round(point.x) : point.x;
    const z = snapToGrid ? Math.round(point.z) : point.z;
    setGhostPos({ x, z });
  }, [selectedType, snapToGrid, setGhostPos]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (selectedType) {
      e.stopPropagation();
      const point = e.point;
      const x = snapToGrid ? Math.round(point.x) : point.x;
      const z = snapToGrid ? Math.round(point.z) : point.z;
      placeBuilding(x, z);
    } else {
      setSelectedPlaced(null);
    }
  }, [selectedType, snapToGrid, placeBuilding, setSelectedPlaced]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#D1FAE5" roughness={0.9} />
    </mesh>
  );
}

// ===================== GRID OVERLAY =====================
function GridOverlay() {
  const gridVisible = useGameStore(s => s.settings.gridVisible);
  if (!gridVisible) return null;
  return (
    <Grid
      args={[200, 200]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#86EFAC"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#4ADE80"
      fadeDistance={80}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
      position={[0, 0.01, 0]}
    />
  );
}

// ===================== DECORATIVE ELEMENTS =====================
function Trees() {
  const positions = useMemo(() => {
    const pos: [number, number, number][] = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 40;
      pos.push([Math.cos(angle) * dist, 0, Math.sin(angle) * dist]);
    }
    return pos;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
            <meshStandardMaterial color="#92400E" />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <coneGeometry args={[0.6, 1.5, 8]} />
            <meshStandardMaterial color="#22C55E" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[0.4, 1, 8]} />
            <meshStandardMaterial color="#16A34A" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ===================== SCENE CONTENT =====================
function SceneContent() {
  const buildings = useGameStore(s => s.buildings);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#FFF7ED" />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight position={[-20, 20, -10]} intensity={0.3} color="#93C5FD" />

      {/* Sky & Environment */}
      <Sky sunPosition={[50, 30, 20]} turbidity={2} rayleigh={0.5} />

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={80}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />

      {/* Ground */}
      <Ground />
      <GridOverlay />

      {/* Buildings */}
      {buildings.map(b => (
        <BuildingModel key={b.id} building={b} />
      ))}

      {/* Ghost building for placement */}
      <GhostBuilding />

      {/* Decorative */}
      <Trees />

      {/* Water body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, -0.2, 0]}>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.6} roughness={0.1} metalness={0.3} />
      </mesh>
    </>
  );
}

// ===================== MAIN CANVAS =====================
export default function Scene3D() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [20, 25, 20], fov: 50, near: 0.1, far: 500 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
