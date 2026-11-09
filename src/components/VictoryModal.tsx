import React from 'react';
import { Trophy, Clock, Target, Database, RotateCcw, Home } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface VictoryModalProps {
  engine: GameEngine;
  onPlayAgain: () => void;
  onExitTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  engine,
  onPlayAgain,
  onExitTitle,
}) => {
  const minutes = Math.floor(engine.gameTime / 60);
  const seconds = Math.floor(engine.gameTime % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const scoreFormatted = engine.score.toLocaleString();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
          <Trophy className="w-8 h-8 text-emerald-400" />
        </div>

        <span className="text-xs font-mono-tech text-emerald-400 font-bold tracking-widest uppercase">
          MISSÃO 01 COMPLETA
        </span>
        <h2 className="text-3xl font-display font-extrabold text-slate-100 mt-1">
          FUGA DO SETOR ZERO
        </h2>
        <p className="text-xs text-slate-400 mt-2 mb-6 max-w-xs leading-relaxed">
          Kaelen-07 acessou a eclusa de descompressão e escapou do laboratório com as matrizes quânticas intactas.
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 text-left">
          {/* Time */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-display">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TEMPO TOTAL</span>
            </div>
            <div className="text-lg font-mono-tech font-bold text-slate-100 tabular-nums mt-1">
              {timeFormatted}
            </div>
          </div>

          {/* Enemies Defeated */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-display">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>INIMIGOS ELIMINADOS</span>
            </div>
            <div className="text-lg font-mono-tech font-bold text-slate-100 tabular-nums mt-1">
              {engine.enemiesDefeated}
            </div>
          </div>

          {/* Data Cores */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-display">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>DISCOS DE DADOS</span>
            </div>
            <div className="text-lg font-mono-tech font-bold text-purple-300 tabular-nums mt-1">
              {engine.objectives.dataCoresCollected} / {engine.objectives.totalDataCores}
            </div>
          </div>

          {/* Total Score */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-display">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>PONTUAÇÃO</span>
            </div>
            <div className="text-lg font-mono-tech font-bold text-amber-400 tabular-nums mt-1">
              {scoreFormatted}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
          >
            <RotateCcw className="w-4 h-4 fill-slate-950" />
            <span>JOGAR NOVAMENTE</span>
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
