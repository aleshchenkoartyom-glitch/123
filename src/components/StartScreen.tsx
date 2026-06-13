import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function StartScreen() {
  const gameStarted = useGameStore(s => s.gameStarted);
  const startGame = useGameStore(s => s.startGame);
  const loadGame = useGameStore(s => s.loadGame);
  const setDifficulty = useGameStore(s => s.setDifficulty);
  const updateSettings = useGameStore(s => s.updateSettings);
  const [selectedDifficulty, setSelectedDiff] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [selectedLang, setSelectedLang] = useState<'ru' | 'en'>('ru');

  if (gameStarted) return null;

  const hasSave = !!localStorage.getItem('factory_save');

  const handleStart = () => {
    setDifficulty(selectedDifficulty);
    updateSettings({ language: selectedLang });
    startGame();
  };

  const handleContinue = () => {
    const saved = localStorage.getItem('factory_save');
    if (saved) {
      loadGame(saved);
    }
  };

  const ru = selectedLang === 'ru';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-violet-400"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 max-w-md w-full text-center">
        {/* Logo / title */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            {ru ? 'ЗАВОД' : 'FACTORY'}
          </h1>
          <p className="text-violet-300 text-sm">
            {ru ? '3D Симулятор строительства и управления' : '3D Construction & Management Simulator'}
          </p>
        </div>

        {/* Language */}
        <div className="mb-6">
          <div className="text-xs text-violet-300 mb-2">{ru ? 'Язык' : 'Language'}</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setSelectedLang('ru')}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${selectedLang === 'ru' ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              🇷🇺 Русский
            </button>
            <button
              onClick={() => setSelectedLang('en')}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${selectedLang === 'en' ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-8">
          <div className="text-xs text-violet-300 mb-2">{ru ? 'Сложность' : 'Difficulty'}</div>
          <div className="flex gap-2 justify-center">
            {[
              { value: 'easy' as const, label: ru ? '🌱 Легко' : '🌱 Easy' },
              { value: 'normal' as const, label: ru ? '⚙️ Нормально' : '⚙️ Normal' },
              { value: 'hard' as const, label: ru ? '🔥 Сложно' : '🔥 Hard' },
            ].map(d => (
              <button
                key={d.value}
                onClick={() => setSelectedDiff(d.value)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${selectedDifficulty === d.value ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 active:scale-[0.98]"
          >
            {ru ? '🚀 Новая игра' : '🚀 New Game'}
          </button>

          {hasSave && (
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-all border border-white/20"
            >
              📂 {ru ? 'Продолжить' : 'Continue'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-violet-400/60">
          v1.0.0 • {ru ? 'Артемий Акрапович ждёт!' : 'Artemiy Akrapovich awaits!'}
        </div>
      </div>
    </div>
  );
}
