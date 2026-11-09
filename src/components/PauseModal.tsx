import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Smartphone, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExitTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showTouch: boolean;
  onToggleTouch: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExitTitle,
  isMuted,
  onToggleMute,
  showTouch,
  onToggleTouch,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
          <span className="font-display font-bold text-xl">⏸</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-100">
          SISTEMA PAUSADO
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Setor Zero // Operação Temporariamente Suspensa
        </p>

        <div className="w-full flex flex-col gap-2.5">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>CONTINUAR MISSÃO</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR DO CHECKPOINT</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-display font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isMuted ? 'ÁUDIO: MUTADO' : 'ÁUDIO: ATIVADO'}</span>
          </button>

          {/* Touch Controls Toggle */}
          <button
            onClick={onToggleTouch}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-display font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>{showTouch ? 'TOUCH: VISÍVEL' : 'TOUCH: OCULTO'}</span>
          </button>

          {/* Return to Title */}
          <button
            onClick={onExitTitle}
            className="w-full py-2 text-xs text-slate-400 hover:text-rose-400 mt-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Voltar ao Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
