import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useAuthStore } from './store/authStore';
import Scene3D from './components/Scene3D';
import BuildPanel from './components/BuildPanel';
import InfoPanel from './components/InfoPanel';
import BottomBar from './components/BottomBar';
import SettingsModal from './components/SettingsModal';
import SaveLoadModal from './components/SaveLoadModal';
import DialogBox from './components/DialogBox';
import StartScreen from './components/StartScreen';
import EventLogPanel from './components/EventLogPanel';
import MiniMap from './components/MiniMap';
import UserMenu from './components/UserMenu';
import AdminPanel from './components/AdminPanel';
import CloudSaveModal from './components/CloudSaveModal';

function KeyboardHints() {
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="bg-white/70 backdrop-blur-md rounded-xl px-4 py-1.5 text-xs text-slate-500 flex gap-3">
        <span><kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">R</kbd> {ru ? 'Поворот' : 'Rotate'}</span>
        <span><kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">G</kbd> {ru ? 'Сетка' : 'Grid'}</span>
        <span><kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">ESC</kbd> {ru ? 'Отмена' : 'Cancel'}</span>
        <span><kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Space</kbd> {ru ? 'Пауза' : 'Pause'}</span>
      </div>
    </div>
  );
}

function TopBar() {
  const [showCloudSave, setShowCloudSave] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const lang = useGameStore(s => s.settings.language);
  const ru = lang === 'ru';

  return (
    <>
      <div className="absolute top-3 right-3 z-20 pointer-events-auto flex items-center gap-2">
        {isAuthenticated && (
          <button
            onClick={() => setShowCloudSave(true)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-xl text-xs text-blue-700 transition-colors"
            title={ru ? 'Облачные сохранения' : 'Cloud Saves'}
          >
            ☁️
          </button>
        )}
        <UserMenu />
      </div>
      {showCloudSave && <CloudSaveModal onClose={() => setShowCloudSave(false)} />}
    </>
  );
}

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  
  const gameStarted = useGameStore(s => s.gameStarted);
  const gameSpeed = useGameStore(s => s.gameSpeed);
  const gameTick = useGameStore(s => s.gameTick);
  const fontScale = useGameStore(s => s.settings.fontScale);
  const accessibilityMode = useGameStore(s => s.settings.accessibilityMode);
  
  const { checkAuth, user } = useAuthStore();
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for admin panel open event
  useEffect(() => {
    const handleOpenAdmin = () => setShowAdmin(true);
    window.addEventListener('openAdmin', handleOpenAdmin);
    return () => window.removeEventListener('openAdmin', handleOpenAdmin);
  }, []);

  // Game tick loop
  useEffect(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }

    if (gameStarted && gameSpeed > 0) {
      const interval = Math.max(100, 1000 / gameSpeed);
      tickIntervalRef.current = setInterval(() => {
        gameTick();
      }, interval);
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [gameStarted, gameSpeed, gameTick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        useGameStore.getState().rotateGhost();
      }
      if (e.key === 'Escape') {
        useGameStore.getState().setSelectedBuildingType(null);
        useGameStore.getState().setSelectedPlacedBuilding(null);
        setShowAdmin(false);
      }
      if (e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П') {
        const s = useGameStore.getState().settings;
        useGameStore.getState().updateSettings({ gridVisible: !s.gridVisible });
      }
      if (e.key === ' ') {
        e.preventDefault();
        const s = useGameStore.getState();
        useGameStore.getState().setGameSpeed(s.gameSpeed === 0 ? 1 : 0);
      }
      if (e.key === '1') useGameStore.getState().setGameSpeed(1);
      if (e.key === '2') useGameStore.getState().setGameSpeed(2);
      if (e.key === '3') useGameStore.getState().setGameSpeed(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const style = accessibilityMode ? { fontSize: `${fontScale}rem` } : {};

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 relative select-none" style={style}>
      {/* 3D Scene */}
      <Scene3D />

      {/* UI Layer */}
      {gameStarted && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <BuildPanel />
          <InfoPanel />
          <BottomBar />
          <EventLogPanel />
          <MiniMap />
          <DialogBox />
        </div>
      )}

      {/* Top bar with user menu */}
      {gameStarted && <TopBar />}

      {/* Modals */}
      <SettingsModal />
      <SaveLoadModal />

      {/* Start Screen */}
      <StartScreen />

      {/* Keyboard hints */}
      {gameStarted && <KeyboardHints />}

      {/* Admin Panel */}
      {showAdmin && user?.is_admin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
}
