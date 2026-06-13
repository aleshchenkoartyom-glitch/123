import { create } from 'zustand';

// ===================== TYPES =====================
export type BuildingType =
  | 'power_plant_coal'
  | 'power_plant_solar'
  | 'power_plant_wind'
  | 'factory_basic'
  | 'factory_advanced'
  | 'factory_chemical'
  | 'warehouse_small'
  | 'warehouse_large'
  | 'water_pump'
  | 'water_tower'
  | 'sewage_plant'
  | 'office'
  | 'repair_depot'
  | 'market_stall'
  | 'road_straight'
  | 'road_cross';

export interface BuildingDef {
  type: BuildingType;
  name: string;
  nameEn: string;
  icon: string;
  baseCost: number;
  footprint: { w: number; h: number };
  tier: number;
  unlockLevel: number;
  powerOutput: number;
  powerNeed: number;
  waterNeed: number;
  wasteOutput: number;
  maintenance: number;
  baseExpBuild: number;
  productionRate: number;
  productionValue: number;
  color: string;
  height: number;
  description: string;
  descriptionEn: string;
}

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  x: number;
  z: number;
  rotation: number;
  health: number;
  temperature: number;
  active: boolean;
  builtAt: number;
}

export interface DialogLine {
  id: string;
  trigger: string;
  speaker: string;
  text: string;
  textEn: string;
  tasks: string[];
  shown: boolean;
}

export interface GameEvent {
  id: string;
  type: 'breakdown' | 'storm' | 'demand_surge' | 'supply_cut' | 'bonus';
  affectedBuildingId?: string;
  description: string;
  descriptionEn: string;
  startTick: number;
  duration: number;
  modifier: number;
}

export interface QAResult {
  check: string;
  passed: boolean;
  details: string;
  timestamp: number;
}

export interface GameSettings {
  language: 'ru' | 'en';
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  rotationStep: 90 | 45;
  cameraSensitivity: number;
  soundEnabled: boolean;
  accessibilityMode: boolean;
  fontScale: number;
  showNotifications: boolean;
  lodLevel: 'high' | 'medium' | 'low';
}

export interface GameState {
  playerName: string;
  level: number;
  exp: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  buildings: PlacedBuilding[];
  events: GameEvent[];
  tick: number;
  gameSpeed: number;
  gameStarted: boolean;
  firstTime: boolean;
  gameMode: 'normal' | 'da_budet_zavod';
  difficulty: 'easy' | 'normal' | 'hard';
  totalPowerOutput: number;
  totalPowerNeed: number;
  totalWaterOutput: number;
  totalWaterNeed: number;
  totalWasteOutput: number;
  totalWasteCapacity: number;
  globalProductivity: number;
  marketPrices: Record<string, number>;
  marketVolatility: number;
  selectedBuildingType: BuildingType | null;
  selectedPlacedBuilding: string | null;
  showSettings: boolean;
  showSaveLoad: boolean;
  activeDialog: DialogLine | null;
  eventLog: string[];
  qaResults: QAResult[];
  ghostPosition: { x: number; z: number } | null;
  ghostRotation: number;
  undoStack: { action: string; data: unknown; timestamp: number }[];
  settings: GameSettings;
  dialogs: DialogLine[];
  completedTasks: string[];

  // Actions
  setSelectedBuildingType: (type: BuildingType | null) => void;
  setSelectedPlacedBuilding: (id: string | null) => void;
  placeBuilding: (x: number, z: number) => void;
  removeBuilding: (id: string) => void;
  rotateGhost: () => void;
  setGhostPosition: (pos: { x: number; z: number } | null) => void;
  toggleSettings: () => void;
  toggleSaveLoad: () => void;
  updateSettings: (s: Partial<GameSettings>) => void;
  gameTick: () => void;
  setGameSpeed: (speed: number) => void;
  startGame: () => void;
  dismissDialog: () => void;
  completeTask: (task: string) => void;
  saveGame: () => string;
  loadGame: (json: string) => void;
  repairBuilding: (id: string) => void;
  addEventLog: (msg: string) => void;
  runQAChecks: () => void;
  setDifficulty: (d: 'easy' | 'normal' | 'hard') => void;
  resetGame: () => void;
}

// ===================== BUILDING DEFINITIONS =====================
export const BUILDING_DEFS: Record<BuildingType, BuildingDef> = {
  power_plant_coal: {
    type: 'power_plant_coal', name: 'Угольная ЭС', nameEn: 'Coal Power Plant', icon: '⚡',
    baseCost: 5000, footprint: { w: 3, h: 3 }, tier: 1, unlockLevel: 1,
    powerOutput: 500, powerNeed: 0, waterNeed: 10, wasteOutput: 20, maintenance: 100,
    baseExpBuild: 50, productionRate: 0, productionValue: 0,
    color: '#6B7280', height: 4,
    description: 'Основной источник энергии.', descriptionEn: 'Main power source.',
  },
  power_plant_solar: {
    type: 'power_plant_solar', name: 'Солнечная ЭС', nameEn: 'Solar Power Plant', icon: '☀️',
    baseCost: 8000, footprint: { w: 4, h: 4 }, tier: 2, unlockLevel: 8,
    powerOutput: 300, powerNeed: 0, waterNeed: 0, wasteOutput: 0, maintenance: 50,
    baseExpBuild: 60, productionRate: 0, productionValue: 0,
    color: '#F59E0B', height: 1.5,
    description: 'Чистая энергия без отходов.', descriptionEn: 'Clean energy, no waste.',
  },
  power_plant_wind: {
    type: 'power_plant_wind', name: 'Ветряная ЭС', nameEn: 'Wind Power Plant', icon: '🌬️',
    baseCost: 7000, footprint: { w: 2, h: 2 }, tier: 2, unlockLevel: 10,
    powerOutput: 200, powerNeed: 0, waterNeed: 0, wasteOutput: 0, maintenance: 40,
    baseExpBuild: 55, productionRate: 0, productionValue: 0,
    color: '#E5E7EB', height: 6,
    description: 'Компактный источник энергии.', descriptionEn: 'Compact energy source.',
  },
  factory_basic: {
    type: 'factory_basic', name: 'Базовая фабрика', nameEn: 'Basic Factory', icon: '🏭',
    baseCost: 3000, footprint: { w: 2, h: 3 }, tier: 1, unlockLevel: 1,
    powerOutput: 0, powerNeed: 200, waterNeed: 5, wasteOutput: 10, maintenance: 80,
    baseExpBuild: 40, productionRate: 1, productionValue: 150,
    color: '#8B5CF6', height: 3,
    description: 'Производит базовые товары.', descriptionEn: 'Produces basic goods.',
  },
  factory_advanced: {
    type: 'factory_advanced', name: 'Продвинутая фабрика', nameEn: 'Advanced Factory', icon: '🏗️',
    baseCost: 12000, footprint: { w: 3, h: 4 }, tier: 3, unlockLevel: 15,
    powerOutput: 0, powerNeed: 400, waterNeed: 15, wasteOutput: 25, maintenance: 200,
    baseExpBuild: 80, productionRate: 3, productionValue: 300,
    color: '#7C3AED', height: 4.5,
    description: 'Высокотехнологичное производство.', descriptionEn: 'High-tech manufacturing.',
  },
  factory_chemical: {
    type: 'factory_chemical', name: 'Химзавод', nameEn: 'Chemical Plant', icon: '🧪',
    baseCost: 15000, footprint: { w: 4, h: 4 }, tier: 4, unlockLevel: 25,
    powerOutput: 0, powerNeed: 600, waterNeed: 30, wasteOutput: 50, maintenance: 350,
    baseExpBuild: 120, productionRate: 2, productionValue: 800,
    color: '#10B981', height: 5,
    description: 'Дорогая химпродукция.', descriptionEn: 'Expensive chemical products.',
  },
  warehouse_small: {
    type: 'warehouse_small', name: 'Малый склад', nameEn: 'Small Warehouse', icon: '📦',
    baseCost: 2000, footprint: { w: 2, h: 2 }, tier: 1, unlockLevel: 3,
    powerOutput: 0, powerNeed: 20, waterNeed: 0, wasteOutput: 0, maintenance: 30,
    baseExpBuild: 25, productionRate: 0, productionValue: 0,
    color: '#D97706', height: 2.5,
    description: 'Хранение товаров.', descriptionEn: 'Storage.',
  },
  warehouse_large: {
    type: 'warehouse_large', name: 'Большой склад', nameEn: 'Large Warehouse', icon: '🏬',
    baseCost: 6000, footprint: { w: 3, h: 3 }, tier: 2, unlockLevel: 12,
    powerOutput: 0, powerNeed: 50, waterNeed: 0, wasteOutput: 0, maintenance: 70,
    baseExpBuild: 45, productionRate: 0, productionValue: 0,
    color: '#B45309', height: 3.5,
    description: 'Вместительное хранилище.', descriptionEn: 'Large storage.',
  },
  water_pump: {
    type: 'water_pump', name: 'Водонасосная', nameEn: 'Water Pump', icon: '💧',
    baseCost: 4000, footprint: { w: 2, h: 2 }, tier: 1, unlockLevel: 2,
    powerOutput: 0, powerNeed: 100, waterNeed: -50, wasteOutput: 0, maintenance: 60,
    baseExpBuild: 35, productionRate: 0, productionValue: 0,
    color: '#3B82F6', height: 2,
    description: 'Обеспечивает водой.', descriptionEn: 'Provides water.',
  },
  water_tower: {
    type: 'water_tower', name: 'Водонапорная башня', nameEn: 'Water Tower', icon: '🗼',
    baseCost: 3000, footprint: { w: 1, h: 1 }, tier: 1, unlockLevel: 5,
    powerOutput: 0, powerNeed: 10, waterNeed: -20, wasteOutput: 0, maintenance: 25,
    baseExpBuild: 20, productionRate: 0, productionValue: 0,
    color: '#60A5FA', height: 5,
    description: 'Резерв воды.', descriptionEn: 'Water reserve.',
  },
  sewage_plant: {
    type: 'sewage_plant', name: 'Очистные', nameEn: 'Sewage Plant', icon: '♻️',
    baseCost: 6000, footprint: { w: 3, h: 2 }, tier: 2, unlockLevel: 7,
    powerOutput: 0, powerNeed: 150, waterNeed: 5, wasteOutput: -40, maintenance: 90,
    baseExpBuild: 50, productionRate: 0, productionValue: 0,
    color: '#059669', height: 2,
    description: 'Перерабатывает отходы.', descriptionEn: 'Processes waste.',
  },
  office: {
    type: 'office', name: 'Офис', nameEn: 'Office', icon: '🏢',
    baseCost: 4500, footprint: { w: 2, h: 2 }, tier: 1, unlockLevel: 4,
    powerOutput: 0, powerNeed: 50, waterNeed: 2, wasteOutput: 2, maintenance: 100,
    baseExpBuild: 30, productionRate: 0, productionValue: 0,
    color: '#6366F1', height: 4,
    description: '+5% эффективность.', descriptionEn: '+5% efficiency.',
  },
  repair_depot: {
    type: 'repair_depot', name: 'Ремонтное депо', nameEn: 'Repair Depot', icon: '🔧',
    baseCost: 5000, footprint: { w: 2, h: 2 }, tier: 2, unlockLevel: 6,
    powerOutput: 0, powerNeed: 80, waterNeed: 3, wasteOutput: 5, maintenance: 70,
    baseExpBuild: 40, productionRate: 0, productionValue: 0,
    color: '#EF4444', height: 2.5,
    description: 'Авто-ремонт зданий.', descriptionEn: 'Auto-repairs buildings.',
  },
  market_stall: {
    type: 'market_stall', name: 'Торговая точка', nameEn: 'Market Stall', icon: '🏪',
    baseCost: 2500, footprint: { w: 2, h: 1 }, tier: 1, unlockLevel: 3,
    powerOutput: 0, powerNeed: 30, waterNeed: 1, wasteOutput: 1, maintenance: 40,
    baseExpBuild: 20, productionRate: 0, productionValue: 0,
    color: '#F97316', height: 2,
    description: 'Продаёт товары.', descriptionEn: 'Sells goods.',
  },
  road_straight: {
    type: 'road_straight', name: 'Дорога', nameEn: 'Road', icon: '🛤️',
    baseCost: 200, footprint: { w: 1, h: 1 }, tier: 1, unlockLevel: 1,
    powerOutput: 0, powerNeed: 0, waterNeed: 0, wasteOutput: 0, maintenance: 5,
    baseExpBuild: 5, productionRate: 0, productionValue: 0,
    color: '#4B5563', height: 0.1,
    description: 'Соединяет здания.', descriptionEn: 'Connects buildings.',
  },
  road_cross: {
    type: 'road_cross', name: 'Перекрёсток', nameEn: 'Crossroad', icon: '➕',
    baseCost: 400, footprint: { w: 1, h: 1 }, tier: 1, unlockLevel: 1,
    powerOutput: 0, powerNeed: 0, waterNeed: 0, wasteOutput: 0, maintenance: 8,
    baseExpBuild: 5, productionRate: 0, productionValue: 0,
    color: '#374151', height: 0.1,
    description: 'Перекрёсток дорог.', descriptionEn: 'Road intersection.',
  },
};

export function expForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function buildingCost(def: BuildingDef, playerLevel: number): number {
  const growthRate = 0.09;
  const delta = Math.max(0, playerLevel - def.unlockLevel);
  return Math.floor(def.baseCost * Math.exp(growthRate * delta));
}

function expForBuilding(def: BuildingDef): number {
  return Math.floor(def.baseExpBuild * (1 + (def.tier - 1) * 0.3));
}

const difficultyMult: Record<string, number> = { easy: 0.7, normal: 1, hard: 1.5 };

let idCounter = 0;
function genId(): string {
  return `bld_${Date.now()}_${idCounter++}`;
}

function triggerDialogHelper(trigger: string, dialogs: DialogLine[]): { activeDialog: DialogLine | null; dialogs: DialogLine[] } {
  const dlg = dialogs.find(d => d.trigger === trigger && !d.shown);
  if (dlg) {
    return {
      activeDialog: dlg,
      dialogs: dialogs.map(d => d.id === dlg.id ? { ...d, shown: true } : d),
    };
  }
  return { activeDialog: null, dialogs };
}

function recalcResources(buildings: PlacedBuilding[]) {
  let totalPowerOutput = 0, totalPowerNeed = 0;
  let totalWaterOutput = 0, totalWaterNeed = 0;
  let totalWasteOutput = 0, totalWasteCapacity = 0;
  for (const b of buildings) {
    const def = BUILDING_DEFS[b.type];
    if (!def) continue;
    totalPowerOutput += def.powerOutput;
    totalPowerNeed += def.powerNeed;
    if (def.waterNeed < 0) totalWaterOutput += Math.abs(def.waterNeed);
    else totalWaterNeed += def.waterNeed;
    if (def.wasteOutput < 0) totalWasteCapacity += Math.abs(def.wasteOutput);
    else totalWasteOutput += def.wasteOutput;
  }
  return { totalPowerOutput, totalPowerNeed, totalWaterOutput, totalWaterNeed, totalWasteOutput, totalWasteCapacity };
}

const defaultDialogs: DialogLine[] = [
  {
    id: 'dlg_start', trigger: 'game_start_first_time', speaker: 'Артемий Акрапович',
    text: 'Привет, инженер! Я — Артемий Акрапович. Не переживай — пока твой завод только в мечтах. Поставь угольную электростанцию для начала!',
    textEn: "Hi, engineer! I'm Artemiy Akrapovich. Don't worry — your factory is just a dream for now. Place a coal power plant to start!",
    tasks: ['build_power_plant'], shown: false,
  },
  {
    id: 'dlg_first_build', trigger: 'first_build_completed', speaker: 'Артемий Акрапович',
    text: 'Отлично! Видны кран, шурупы и твоя рука — почти праздник. Теперь построй фабрику и водонасосную станцию!',
    textEn: 'Excellent! I see a crane, screws and your hand — almost a celebration. Now build a factory and water pump!',
    tasks: ['build_factory', 'build_water_pump'], shown: false,
  },
  {
    id: 'dlg_first_production', trigger: 'first_production', speaker: 'Артемий Акрапович',
    text: 'Шум, пар и запах решимости — ура! Следи за водой: если перегреется, будет хуже.',
    textEn: "Noise, steam and determination — hooray! Watch the water: if it overheats, it'll be bad.",
    tasks: [], shown: false,
  },
  {
    id: 'dlg_first_sale', trigger: 'first_sale', speaker: 'Артемий Акрапович',
    text: 'Первый рубль! Почувствовал вкус успеха? Вкладывай в модернизацию!',
    textEn: 'First ruble! Tasted success? Invest in modernization!',
    tasks: [], shown: false,
  },
  {
    id: 'dlg_first_breakdown', trigger: 'first_breakdown', speaker: 'Артемий Акрапович',
    text: 'Ох, фейерверк в трубе — ничего смертельного. Срочно ремонтируем!',
    textEn: "Oh, fireworks in the pipe — nothing lethal. Let's repair urgently!",
    tasks: ['repair_building'], shown: false,
  },
  {
    id: 'dlg_level10', trigger: 'level_10', speaker: 'Артемий Акрапович',
    text: 'Поздравляю — уровень 10! Завод живёт, а ты — почти директор.',
    textEn: "Congratulations — level 10! The factory lives, and you're almost a director.",
    tasks: [], shown: false,
  },
  {
    id: 'dlg_level25', trigger: 'level_25', speaker: 'Артемий Акрапович',
    text: 'Четверть пути! Империя растёт. Пора думать о химическом производстве.',
    textEn: 'Quarter of the way! Empire is growing. Time for chemical production.',
    tasks: [], shown: false,
  },
  {
    id: 'dlg_level50', trigger: 'level_50', speaker: 'Артемий Акрапович',
    text: 'УРОВЕНЬ 50! Ты — легенда! Открывается режим "Да будет ЗАВОД"!',
    textEn: 'LEVEL 50! You are a legend! "Let There Be FACTORY" mode unlocked!',
    tasks: [], shown: false,
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  playerName: 'Инженер',
  level: 1,
  exp: 0,
  balance: 25000,
  totalEarned: 0,
  totalSpent: 0,
  buildings: [],
  events: [],
  tick: 0,
  gameSpeed: 1,
  gameStarted: false,
  firstTime: true,
  gameMode: 'normal',
  difficulty: 'normal',
  totalPowerOutput: 0,
  totalPowerNeed: 0,
  totalWaterOutput: 0,
  totalWaterNeed: 0,
  totalWasteOutput: 0,
  totalWasteCapacity: 0,
  globalProductivity: 1,
  marketPrices: { metal: 120, food: 85, chemicals: 250, electronics: 400 },
  marketVolatility: 0.12,
  selectedBuildingType: null,
  selectedPlacedBuilding: null,
  showSettings: false,
  showSaveLoad: false,
  activeDialog: null,
  eventLog: [],
  qaResults: [],
  ghostPosition: null,
  ghostRotation: 0,
  undoStack: [],
  settings: {
    language: 'ru',
    gridVisible: true,
    snapToGrid: true,
    gridSize: 1,
    rotationStep: 90,
    cameraSensitivity: 1,
    soundEnabled: true,
    accessibilityMode: false,
    fontScale: 1,
    showNotifications: true,
    lodLevel: 'high',
  },
  dialogs: defaultDialogs.map(d => ({ ...d })),
  completedTasks: [],

  setSelectedBuildingType: (type) => set({ selectedBuildingType: type, selectedPlacedBuilding: null }),
  setSelectedPlacedBuilding: (id) => set({ selectedPlacedBuilding: id, selectedBuildingType: null }),

  placeBuilding: (x, z) => {
    const state = get();
    if (!state.selectedBuildingType) return;
    const def = BUILDING_DEFS[state.selectedBuildingType];
    if (!def) return;

    const cost = buildingCost(def, state.level);
    if (state.balance < cost) {
      set(s => ({ eventLog: [...s.eventLog.slice(-49), `[${s.tick}] ❌ ${s.settings.language === 'ru' ? 'Недостаточно средств!' : 'Not enough funds!'}`] }));
      return;
    }

    const snapX = state.settings.snapToGrid ? Math.round(x) : x;
    const snapZ = state.settings.snapToGrid ? Math.round(z) : z;

    // Check overlap
    for (const b of state.buildings) {
      const bDef = BUILDING_DEFS[b.type];
      if (!bDef) continue;
      const overlap = snapX < b.x + bDef.footprint.w && snapX + def.footprint.w > b.x &&
        snapZ < b.z + bDef.footprint.h && snapZ + def.footprint.h > b.z;
      if (overlap) {
        set(s => ({ eventLog: [...s.eventLog.slice(-49), `[${s.tick}] ❌ ${s.settings.language === 'ru' ? 'Место занято!' : 'Space occupied!'}`] }));
        return;
      }
    }

    const newBuilding: PlacedBuilding = {
      id: genId(), type: state.selectedBuildingType,
      x: snapX, z: snapZ, rotation: state.ghostRotation,
      health: 100, temperature: 20, active: true, builtAt: state.tick,
    };

    const expGain = expForBuilding(def);
    let newExp = state.exp + expGain;
    let newLevel = state.level;
    while (newExp >= expForLevel(newLevel) && newLevel < 50) {
      newExp -= expForLevel(newLevel);
      newLevel++;
    }

    const newBuildings = [...state.buildings, newBuilding];
    const resources = recalcResources(newBuildings);

    // Trigger dialog
    let dialogUpdate: Partial<GameState> = {};
    if (state.buildings.length === 0) {
      const r = triggerDialogHelper('first_build_completed', state.dialogs);
      if (r.activeDialog) dialogUpdate = { activeDialog: r.activeDialog, dialogs: r.dialogs };
    }
    let levelDialogUpdate: Partial<GameState> = {};
    if (newLevel >= 10 && state.level < 10) {
      const r = triggerDialogHelper('level_10', dialogUpdate.dialogs || state.dialogs);
      if (r.activeDialog) levelDialogUpdate = { activeDialog: r.activeDialog, dialogs: r.dialogs };
    }
    if (newLevel >= 25 && state.level < 25) {
      const r = triggerDialogHelper('level_25', levelDialogUpdate.dialogs || dialogUpdate.dialogs || state.dialogs);
      if (r.activeDialog) levelDialogUpdate = { activeDialog: r.activeDialog, dialogs: r.dialogs };
    }
    if (newLevel >= 50 && state.level < 50) {
      const r = triggerDialogHelper('level_50', levelDialogUpdate.dialogs || dialogUpdate.dialogs || state.dialogs);
      if (r.activeDialog) levelDialogUpdate = { activeDialog: r.activeDialog, dialogs: r.dialogs };
    }

    const lang = state.settings.language;
    const logMsg = lang === 'ru'
      ? `✅ Построено: ${def.name} (−${cost}₽, +${expGain} EXP)`
      : `✅ Built: ${def.nameEn} (-${cost}₽, +${expGain} EXP)`;

    set({
      buildings: newBuildings,
      balance: state.balance - cost,
      totalSpent: state.totalSpent + cost,
      exp: newExp,
      level: newLevel,
      ...resources,
      ...dialogUpdate,
      ...levelDialogUpdate,
      eventLog: [...state.eventLog.slice(-49), `[${state.tick}] ${logMsg}`],
      undoStack: [...state.undoStack, { action: 'build', data: { buildingId: newBuilding.id, cost }, timestamp: Date.now() }],
    });

    get().runQAChecks();
  },

  removeBuilding: (id) => {
    const state = get();
    const building = state.buildings.find(b => b.id === id);
    if (!building) return;
    const def = BUILDING_DEFS[building.type];
    const refund = Math.floor(buildingCost(def, state.level) * 0.5);
    const newBuildings = state.buildings.filter(b => b.id !== id);
    const resources = recalcResources(newBuildings);
    const lang = state.settings.language;
    const logMsg = lang === 'ru'
      ? `🗑️ Снесено: ${def.name} (+${refund}₽)`
      : `🗑️ Demolished: ${def.nameEn} (+${refund}₽)`;
    set({
      buildings: newBuildings, balance: state.balance + refund,
      selectedPlacedBuilding: null, ...resources,
      eventLog: [...state.eventLog.slice(-49), `[${state.tick}] ${logMsg}`],
    });
    get().runQAChecks();
  },

  rotateGhost: () => set(s => ({ ghostRotation: (s.ghostRotation + s.settings.rotationStep) % 360 })),
  setGhostPosition: (pos) => set({ ghostPosition: pos }),
  toggleSettings: () => set(s => ({ showSettings: !s.showSettings })),
  toggleSaveLoad: () => set(s => ({ showSaveLoad: !s.showSaveLoad })),
  updateSettings: (s) => set(state => ({ settings: { ...state.settings, ...s } })),

  gameTick: () => {
    const state = get();
    if (state.gameSpeed === 0 || !state.gameStarted) return;

    const newTick = state.tick + 1;
    let income = 0;
    let expenses = 0;
    const newBuildings = state.buildings.map(b => ({ ...b }));
    let newEvents = [...state.events];
    const mult = difficultyMult[state.difficulty] ?? 1;

    const { totalPowerOutput: tpo, totalPowerNeed: tpn, totalWaterOutput: two, totalWaterNeed: twn, totalWasteOutput: twso, totalWasteCapacity: twc } = recalcResources(newBuildings);
    const powerRatio = tpn > 0 ? Math.min(1, tpo / tpn) : 1;
    const waterRatio = twn > 0 ? Math.min(1, two / twn) : 1;
    const productivity = powerRatio * waterRatio;

    let hadBreakdown = false;

    for (const b of newBuildings) {
      if (!b.active) continue;
      const def = BUILDING_DEFS[b.type];
      if (!def) continue;

      if (newTick % 10 === 0) expenses += def.maintenance * mult;

      if (def.productionRate > 0 && b.health > 30) {
        income += def.productionRate * productivity * (b.health / 100) * def.productionValue;
      }

      if (def.waterNeed > 0 && waterRatio < 1) {
        b.temperature += (1 - waterRatio) * 2;
      } else if (b.temperature > 20) {
        b.temperature = Math.max(20, b.temperature - 1);
      }

      const safeTemp = 60;
      if (b.temperature > safeTemp) {
        const pBreak = 0.001 + Math.max(0, (b.temperature - safeTemp) / 20) * 0.02;
        if (Math.random() < pBreak) {
          b.health = Math.max(0, b.health - 20 - Math.floor(Math.random() * 15));
          b.active = b.health > 0;
          hadBreakdown = true;
          newEvents.push({
            id: `evt_${Date.now()}_${Math.random()}`, type: 'breakdown',
            affectedBuildingId: b.id,
            description: `⚠️ Поломка: ${def.name} (${b.health}%)`,
            descriptionEn: `⚠️ Breakdown: ${def.nameEn} (${b.health}%)`,
            startTick: newTick, duration: 5, modifier: 0,
          });
        }
      }

      const hasRepairDepot = newBuildings.some(rb => rb.type === 'repair_depot' && rb.active && rb.health > 50);
      if (hasRepairDepot && b.health < 100 && newTick % 5 === 0) {
        b.health = Math.min(100, b.health + 5);
      }
    }

    let newPrices = { ...state.marketPrices };
    if (newTick % 20 === 0) {
      for (const key of Object.keys(newPrices)) {
        const noise = (Math.random() - 0.5) * 2 * state.marketVolatility;
        newPrices[key] = Math.max(10, Math.floor(newPrices[key] * (1 + noise)));
      }
    }

    if (newTick % 50 === 0 && Math.random() < 0.3) {
      const eventTypes: Array<'storm' | 'demand_surge' | 'supply_cut' | 'bonus'> = ['storm', 'demand_surge', 'supply_cut', 'bonus'];
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const descs: Record<string, string> = {
        storm: '🌪️ Шторм! Производительность снижена.',
        demand_surge: '📈 Спрос вырос! Цены повышены.',
        supply_cut: '📉 Перебои с поставками.',
        bonus: '🎉 Бонус! +500₽',
      };
      newEvents.push({
        id: `evt_${Date.now()}`, type,
        description: descs[type], descriptionEn: descs[type],
        startTick: newTick, duration: 10, modifier: 0,
      });
      if (type === 'bonus') income += 500;
    }

    newEvents = newEvents.filter(e => newTick - e.startTick < e.duration * 10);

    const expFromSales = Math.floor(income * 0.01);
    let newExp = state.exp + expFromSales;
    let newLevel = state.level;
    while (newExp >= expForLevel(newLevel) && newLevel < 50) {
      newExp -= expForLevel(newLevel);
      newLevel++;
    }

    let dialogUpdate: Partial<GameState> = {};
    if (hadBreakdown) {
      const r = triggerDialogHelper('first_breakdown', state.dialogs);
      if (r.activeDialog) dialogUpdate = { activeDialog: r.activeDialog, dialogs: r.dialogs };
    }
    if (income > 0 && state.totalEarned === 0) {
      const r = triggerDialogHelper('first_sale', dialogUpdate.dialogs || state.dialogs);
      if (r.activeDialog) dialogUpdate = { activeDialog: r.activeDialog, dialogs: r.dialogs };
    }

    set({
      tick: newTick,
      buildings: newBuildings,
      events: newEvents,
      balance: Math.floor(state.balance + income - expenses),
      totalEarned: state.totalEarned + income,
      totalSpent: state.totalSpent + expenses,
      exp: newExp,
      level: newLevel,
      totalPowerOutput: tpo, totalPowerNeed: tpn,
      totalWaterOutput: two, totalWaterNeed: twn,
      totalWasteOutput: twso, totalWasteCapacity: twc,
      globalProductivity: productivity,
      marketPrices: newPrices,
      ...dialogUpdate,
    });
  },

  setGameSpeed: (speed) => set({ gameSpeed: speed }),

  startGame: () => {
    const state = get();
    if (state.firstTime) {
      const r = triggerDialogHelper('game_start_first_time', state.dialogs);
      set({ gameStarted: true, firstTime: false, ...r });
    } else {
      set({ gameStarted: true });
    }
  },

  dismissDialog: () => set({ activeDialog: null }),
  completeTask: (task) => set(s => ({ completedTasks: [...s.completedTasks, task] })),

  saveGame: () => {
    const state = get();
    const saveData = {
      meta: { version: '1.0.0', timestamp: new Date().toISOString() },
      player: { name: state.playerName, level: state.level, exp: state.exp, balance: state.balance, totalEarned: state.totalEarned, totalSpent: state.totalSpent },
      settings: state.settings,
      world: { buildings: state.buildings, events: state.events, tick: state.tick, gameSpeed: state.gameSpeed, difficulty: state.difficulty, gameMode: state.gameMode, marketPrices: state.marketPrices, marketVolatility: state.marketVolatility },
      dialogs: state.dialogs, completedTasks: state.completedTasks,
    };
    const json = JSON.stringify(saveData, null, 2);
    try { localStorage.setItem('factory_save', json); } catch (e) { console.error(e); }
    set(s => ({ eventLog: [...s.eventLog.slice(-49), `[${s.tick}] 💾 ${s.settings.language === 'ru' ? 'Игра сохранена!' : 'Game saved!'}`] }));
    return json;
  },

  loadGame: (json) => {
    try {
      const data = JSON.parse(json);
      set({
        playerName: data.player.name, level: data.player.level, exp: data.player.exp,
        balance: data.player.balance, totalEarned: data.player.totalEarned || 0, totalSpent: data.player.totalSpent || 0,
        settings: { ...get().settings, ...data.settings },
        buildings: data.world.buildings, events: data.world.events || [],
        tick: data.world.tick, gameSpeed: data.world.gameSpeed || 1,
        difficulty: data.world.difficulty || 'normal', gameMode: data.world.gameMode || 'normal',
        marketPrices: data.world.marketPrices || get().marketPrices, marketVolatility: data.world.marketVolatility || 0.12,
        dialogs: data.dialogs || get().dialogs, completedTasks: data.completedTasks || [],
        gameStarted: true, firstTime: false,
      });
      set(s => ({ eventLog: [...s.eventLog.slice(-49), `[${s.tick}] 💾 ${s.settings.language === 'ru' ? 'Игра загружена!' : 'Game loaded!'}`] }));
    } catch (e) {
      console.error(e);
    }
  },

  repairBuilding: (id) => {
    const state = get();
    const cost = 500;
    if (state.balance < cost) return;
    set({
      buildings: state.buildings.map(b => b.id === id ? { ...b, health: 100, temperature: 20, active: true } : b),
      balance: state.balance - cost,
      eventLog: [...state.eventLog.slice(-49), `[${state.tick}] 🔧 ${state.settings.language === 'ru' ? 'Отремонтировано' : 'Repaired'} (−${cost}₽)`],
    });
    get().runQAChecks();
  },

  addEventLog: (msg) => set(s => ({ eventLog: [...s.eventLog.slice(-49), `[${s.tick}] ${msg}`] })),

  runQAChecks: () => {
    const state = get();
    const results: QAResult[] = [];
    if (state.settings.snapToGrid) {
      for (const b of state.buildings) {
        const onGrid = Math.abs(b.x - Math.round(b.x)) < 0.01 && Math.abs(b.z - Math.round(b.z)) < 0.01;
        results.push({ check: `snap_${b.id}`, passed: onGrid, details: onGrid ? 'OK' : 'OFF GRID', timestamp: Date.now() });
      }
    }
    for (let i = 0; i < state.buildings.length; i++) {
      for (let j = i + 1; j < state.buildings.length; j++) {
        const a = state.buildings[i], b = state.buildings[j];
        const ad = BUILDING_DEFS[a.type], bd = BUILDING_DEFS[b.type];
        const overlap = a.x < b.x + bd.footprint.w && a.x + ad.footprint.w > b.x && a.z < b.z + bd.footprint.h && a.z + ad.footprint.h > b.z;
        results.push({ check: `overlap_${i}_${j}`, passed: !overlap, details: overlap ? 'OVERLAP' : 'OK', timestamp: Date.now() });
      }
    }
    results.push({ check: 'balance', passed: state.balance >= 0, details: `${state.balance}₽`, timestamp: Date.now() });
    set({ qaResults: results });
  },

  setDifficulty: (d) => set({ difficulty: d }),

  resetGame: () => {
    set({
      playerName: 'Инженер', level: 1, exp: 0, balance: 25000,
      totalEarned: 0, totalSpent: 0, buildings: [], events: [],
      tick: 0, gameSpeed: 1, gameStarted: false, firstTime: true, gameMode: 'normal',
      selectedBuildingType: null, selectedPlacedBuilding: null,
      activeDialog: null, eventLog: [], qaResults: [], undoStack: [],
      dialogs: defaultDialogs.map(d => ({ ...d, shown: false })), completedTasks: [],
      totalPowerOutput: 0, totalPowerNeed: 0, totalWaterOutput: 0, totalWaterNeed: 0,
      totalWasteOutput: 0, totalWasteCapacity: 0, globalProductivity: 1,
    });
    localStorage.removeItem('factory_save');
  },
}));
