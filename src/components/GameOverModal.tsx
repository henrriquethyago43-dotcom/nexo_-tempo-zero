import React from 'react';
import { Skull, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
  onExitTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRestart,
  onExitTitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-600/40 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/20 animate-pulse">
          <Skull className="w-8 h-8 text-rose-500" />
        </div>

        <span className="text-xs font-mono-tech text-rose-500 font-bold tracking-widest uppercase">
          SINAL BIOLÓGICO INTERROMPIDO
        </span>
        <h2 className="text-3xl font-display font-extrabold text-slate-100 mt-1">
          FALHA CRÍTICA
        </h2>
        <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
          A integridade do traje de Kaelen-07 chegou a zero. O fluxo temporal entrou em colapso irreversível.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-display font-bold rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR NO CHECKPOINT</span>
          </button>

          <button
            onClick={onExitTitle}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
