import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function SaveLoadModal() {
  const showSaveLoad = useGameStore(s => s.showSaveLoad);
  const toggleSaveLoad = useGameStore(s => s.toggleSaveLoad);
  const saveGame = useGameStore(s => s.saveGame);
  const loadGame = useGameStore(s => s.loadGame);
  const lang = useGameStore(s => s.settings.language);
  const [saveData, setSaveData] = useState('');
  const [loadData, setLoadData] = useState('');

  if (!showSaveLoad) return null;

  const handleSave = () => {
    const json = saveGame();
    setSaveData(json);
  };

  const handleLoad = () => {
    if (loadData.trim()) {
      loadGame(loadData);
      toggleSaveLoad();
    }
  };

  const handleLoadFromLocal = () => {
    const saved = localStorage.getItem('factory_save');
    if (saved) {
      loadGame(saved);
      toggleSaveLoad();
    }
  };

  const handleDownload = () => {
    if (!saveData) return;
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          setLoadData(text);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              💾 {lang === 'ru' ? 'Сохранение / Загрузка' : 'Save / Load'}
            </h2>
            <button
              onClick={toggleSaveLoad}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Save section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
              {lang === 'ru' ? '💾 Сохранить' : '💾 Save'}
            </h3>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-emerald-100 hover:bg-emerald-200 rounded-xl text-sm text-emerald-700 transition-colors font-medium"
              >
                {lang === 'ru' ? 'Сохранить' : 'Save'}
              </button>
              {saveData && (
                <button
                  onClick={handleDownload}
                  className="py-2.5 px-4 bg-blue-100 hover:bg-blue-200 rounded-xl text-sm text-blue-700 transition-colors"
                >
                  📥 {lang === 'ru' ? 'Скачать' : 'Download'}
                </button>
              )}
            </div>
            {saveData && (
              <textarea
                readOnly
                value={saveData}
                className="w-full h-24 p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border border-slate-200 resize-none"
              />
            )}
          </div>

          {/* Load section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
              {lang === 'ru' ? '📂 Загрузить' : '📂 Load'}
            </h3>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleLoadFromLocal}
                className="flex-1 py-2.5 bg-violet-100 hover:bg-violet-200 rounded-xl text-sm text-violet-700 transition-colors font-medium"
              >
                {lang === 'ru' ? 'Из памяти' : 'From memory'}
              </button>
              <button
                onClick={handleUpload}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm text-slate-700 transition-colors"
              >
                📤 {lang === 'ru' ? 'Из файла' : 'From file'}
              </button>
            </div>
            <textarea
              value={loadData}
              onChange={e => setLoadData(e.target.value)}
              placeholder={lang === 'ru' ? 'Вставьте JSON сохранения...' : 'Paste save JSON...'}
              className="w-full h-24 p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border border-slate-200 resize-none mb-2"
            />
            {loadData && (
              <button
                onClick={handleLoad}
                className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 rounded-xl text-sm text-emerald-700 transition-colors font-medium"
              >
                {lang === 'ru' ? 'Загрузить' : 'Load'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
