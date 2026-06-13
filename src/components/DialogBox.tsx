import { useGameStore } from '../store/gameStore';

export default function DialogBox() {
  const activeDialog = useGameStore(s => s.activeDialog);
  const dismissDialog = useGameStore(s => s.dismissDialog);
  const lang = useGameStore(s => s.settings.language);

  if (!activeDialog) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center pointer-events-auto px-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-violet-200 max-w-lg w-full p-5 animate-slideUp">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
            👷
          </div>

          <div className="flex-1">
            {/* Speaker name */}
            <div className="text-sm font-bold text-violet-700 mb-1">
              {activeDialog.speaker}
            </div>

            {/* Dialog text */}
            <div className="text-sm text-slate-700 leading-relaxed mb-3">
              {lang === 'ru' ? activeDialog.text : activeDialog.textEn}
            </div>

            {/* Tasks */}
            {activeDialog.tasks.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">
                  {lang === 'ru' ? 'Задания:' : 'Tasks:'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeDialog.tasks.map(task => (
                    <span key={task} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs">
                      📋 {task.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dismiss */}
            <button
              onClick={dismissDialog}
              className="px-4 py-1.5 bg-violet-100 hover:bg-violet-200 rounded-lg text-sm text-violet-700 transition-colors font-medium"
            >
              {lang === 'ru' ? 'Понятно!' : 'Got it!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
