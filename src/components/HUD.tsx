import React from 'react';
import { GameEngine } from '../game/engine';
import { soundManager } from '../game/audio';
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Smartphone, 
  Database, 
  ShieldAlert, 
  Radio 
} from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  onPause: () => void;
  showTouch: boolean;
  onToggleTouch: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onPause,
  showTouch,
  onToggleTouch,
  isMuted,
  onToggleMute,
}) => {
  const p = engine.player;
  const obj = engine.objectives;

  const hpPercent = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
  const energyPercent = Math.max(0, Math.min(100, (p.energy / p.maxEnergy) * 100));

  // Determine current objective text
  let currentObjective = '1. Localizar Terminal de Sincronia e Recuperar Módulo de Eco';
  if (obj.hasEchoDevice && !obj.openedPressureDoor) {
    currentObjective = '2. Usar Eco Temporal na Placa de Pressão para abrir a Porta de Contenção';
  } else if (obj.openedPressureDoor && !obj.bossDefeated) {
    currentObjective = '3. Atravessar corredor de lasers e Neutralizar o Guardião MK-IV';
  } else if (obj.bossDefeated && !obj.reachedElevator) {
    currentObjective = '4. Acessar o Elevador de Fuga para evacuar o Setor Zero';
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 md:p-5">
      {/* --- Top Perimeter Bar --- */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Player Status Cluster */}
        <div className="flex flex-col gap-2 bg-slate-950/75 backdrop-blur-sm p-3 rounded-xl border border-slate-800 shadow-xl min-w-[240px] md:min-w-[280px]">
          {/* Health Bar (HP) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-semibold tracking-wider text-rose-400">
                INTEGRIDADE DO TRAJE
              </span>
              <span className="font-mono-tech tabular-nums font-bold text-slate-200">
                {Math.round(p.hp)} / {p.maxHp}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-sm overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 transition-all duration-150"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Energy Bar (Quantum Chrono Energy) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-semibold tracking-wider text-cyan-400">
                ENERGIA QUÂNTICA
              </span>
              <span className="font-mono-tech tabular-nums font-bold text-slate-200">
                {Math.round(p.energy)} / {p.maxEnergy}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-150"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>

          {/* Echo Device Status */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-purple-400 font-display font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ECO TEMPORAL:</span>
            </div>
            <span
              className={`font-mono-tech font-bold tracking-wider ${
                !obj.hasEchoDevice
                  ? 'text-slate-500'
                  : engine.echoState === 'RECORDING'
                  ? 'text-rose-400 animate-pulse'
                  : engine.echoClone.active
                  ? 'text-cyan-400'
                  : 'text-purple-300'
              }`}
            >
              {!obj.hasEchoDevice
                ? 'NÃO SINCRONIZADO'
                : engine.echoState === 'RECORDING'
                ? `GRAVANDO ${(5 - engine.recordTimer).toFixed(1)}s`
                : engine.echoClone.active
                ? `CLONE ATIVO (${(engine.echoClone.maxLife - engine.echoClone.lifeTimer).toFixed(1)}s)`
                : 'PRONTO [E]'}
            </span>
          </div>
        </div>

        {/* Center: Mission Objective Banner */}
        <div className="hidden lg:flex flex-col items-center bg-slate-950/75 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-800/80 shadow-lg max-w-md text-center">
          <div className="flex items-center gap-2 text-xs font-display font-bold tracking-widest text-amber-400 uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>OBJETIVO ATUAL</span>
          </div>
          <p className="text-xs text-slate-200 font-medium mt-0.5 truncate max-w-sm">
            {currentObjective}
          </p>
        </div>

        {/* Right: Data Disks & Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Data Cores counter */}
          <div className="flex items-center gap-2 bg-slate-950/75 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-800 text-xs text-purple-300 font-display font-bold">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="font-mono-tech tabular-nums">
              {obj.dataCoresCollected} / {obj.totalDataCores}
            </span>
          </div>

          {/* Interactive Utility Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-sm p-1.5 rounded-xl border border-slate-800">
            {/* Toggle Touch Controls */}
            <button
              onClick={onToggleTouch}
              className={`p-2 rounded-lg transition-colors ${
                showTouch ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Controles Touch (Android/Mobile)"
              aria-label="Alternar Controles Touch"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Mute SFX / Music */}
            <button
              onClick={onToggleMute}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title={isMuted ? 'Ativar Som' : 'Silenciar Som'}
              aria-label="Controle de Áudio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Pause Game */}
            <button
              onClick={onPause}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Pausar Jogo"
              aria-label="Pausar"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Objective Bar at Top-Center if on small screen --- */}
      <div className="lg:hidden pointer-events-none mt-2 self-center bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800/80 text-center max-w-xs">
        <span className="text-[11px] text-amber-300 font-medium block truncate">
          {currentObjective}
        </span>
      </div>

      {/* Empty bottom area (Touch controls take the bottom corners) */}
      <div />
    </div>
  );
};
