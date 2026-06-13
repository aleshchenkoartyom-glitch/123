import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function EventLogPanel() {
  const [expanded, setExpanded] = useState(false);
  const eventLog = useGameStore(s => s.eventLog);
  const qaResults = useGameStore(s => s.qaResults);
  const lang = useGameStore(s => s.settings.language);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="absolute left-72 bottom-16 z-10 pointer-events-auto px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-100 text-xs text-slate-500 hover:bg-white transition-colors"
      >
        📋 {lang === 'ru' ? 'Журнал' : 'Log'} ({eventLog.length})
      </button>
    );
  }

  const failedQA = qaResults.filter(r => !r.passed);

  return (
    <div className="absolute left-72 bottom-16 z-20 pointer-events-auto w-96">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600">
            📋 {lang === 'ru' ? 'Журнал событий' : 'Event Log'}
          </h3>
          <button
            onClick={() => setExpanded(false)}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto p-3">
          {eventLog.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4">
              {lang === 'ru' ? 'Пусто' : 'Empty'}
            </div>
          ) : (
            <div className="space-y-1">
              {[...eventLog].reverse().map((msg, i) => (
                <div key={i} className="text-xs text-slate-600 font-mono bg-slate-50 rounded-lg px-2 py-1">
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* QA results */}
        {failedQA.length > 0 && (
          <div className="border-t border-red-100 p-3">
            <div className="text-xs font-semibold text-red-600 mb-1">⚠️ QA Issues</div>
            {failedQA.map((r, i) => (
              <div key={i} className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mb-0.5">
                {r.check}: {r.details}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
