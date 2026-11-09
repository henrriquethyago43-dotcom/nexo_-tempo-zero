import React, { useRef, useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  Zap, 
  Flame, 
  Crosshair, 
  Sword, 
  Clock, 
  Hand 
} from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine;
  showControls: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine, showControls }) => {
  const [activeDpad, setActiveDpad] = useState<'left' | 'right' | 'down' | null>(null);
  const [activeActions, setActiveActions] = useState<{ [key: string]: boolean }>({});
  const dpadRef = useRef<HTMLDivElement>(null);

  if (!showControls) return null;

  // D-Pad Touch Handlers
  const handleDpadTouchStart = (dir: 'left' | 'right' | 'down') => (e: React.TouchEvent) => {
    e.preventDefault();
    setActiveDpad(dir);
    if (dir === 'left') {
      engine.input.left = true;
      engine.input.right = false;
    } else if (dir === 'right') {
      engine.input.right = true;
      engine.input.left = false;
    } else if (dir === 'down') {
      engine.input.down = true;
    }
  };

  const handleDpadTouchEnd = (dir: 'left' | 'right' | 'down') => (e: React.TouchEvent) => {
    e.preventDefault();
    if (dir === 'left') engine.input.left = false;
    if (dir === 'right') engine.input.right = false;
    if (dir === 'down') engine.input.down = false;
    setActiveDpad(null);
  };

  // Action Button Touch Handlers
  const handleActionStart = (action: 'jump' | 'dash' | 'shoot' | 'slash' | 'echo' | 'interact') => (e: React.TouchEvent) => {
    e.preventDefault();
    setActiveActions((prev) => ({ ...prev, [action]: true }));

    switch (action) {
      case 'jump':
        engine.input.jump = true;
        engine.input.jumpJustPressed = true;
        break;
      case 'dash':
        engine.input.dash = true;
        engine.input.dashJustPressed = true;
        break;
      case 'shoot':
        engine.input.shoot = true;
        break;
      case 'slash':
        engine.input.slash = true;
        engine.input.slashJustPressed = true;
        break;
      case 'echo':
        engine.input.echo = true;
        engine.input.echoJustPressed = true;
        break;
      case 'interact':
        engine.input.interact = true;
        engine.input.interactJustPressed = true;
        break;
    }
  };

  const handleActionEnd = (action: 'jump' | 'dash' | 'shoot' | 'slash' | 'echo' | 'interact') => (e: React.TouchEvent) => {
    e.preventDefault();
    setActiveActions((prev) => ({ ...prev, [action]: false }));

    switch (action) {
      case 'jump':
        engine.input.jump = false;
        break;
      case 'dash':
        engine.input.dash = false;
        break;
      case 'shoot':
        engine.input.shoot = false;
        break;
      case 'slash':
        engine.input.slash = false;
        break;
      case 'echo':
        engine.input.echo = false;
        break;
      case 'interact':
        engine.input.interact = false;
        break;
    }
  };

  // Determine Echo button label & state
  const isRecording = engine.echoState === 'RECORDING';
  const hasEcho = engine.objectives.hasEchoDevice;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between items-end p-4 md:p-6">
      {/* --- Left D-Pad Controls (Movement) --- */}
      <div 
        ref={dpadRef}
        className="pointer-events-auto flex items-center gap-3 bg-slate-950/60 backdrop-blur-sm p-3 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/40"
      >
        {/* Left Arrow */}
        <button
          type="button"
          onTouchStart={handleDpadTouchStart('left')}
          onTouchEnd={handleDpadTouchEnd('left')}
          onMouseDown={() => { engine.input.left = true; setActiveDpad('left'); }}
          onMouseUp={() => { engine.input.left = false; setActiveDpad(null); }}
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
            activeDpad === 'left'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-400/50'
              : 'bg-slate-900/80 text-cyan-400 border border-slate-700 hover:border-cyan-500'
          }`}
          aria-label="Mover para Esquerda"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        {/* Down Button */}
        <button
          type="button"
          onTouchStart={handleDpadTouchStart('down')}
          onTouchEnd={handleDpadTouchEnd('down')}
          onMouseDown={() => { engine.input.down = true; setActiveDpad('down'); }}
          onMouseUp={() => { engine.input.down = false; setActiveDpad(null); }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
            activeDpad === 'down'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-400/50'
              : 'bg-slate-900/80 text-slate-400 border border-slate-700 hover:border-cyan-500'
          }`}
          aria-label="Agachar ou Descer"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          onTouchStart={handleDpadTouchStart('right')}
          onTouchEnd={handleDpadTouchEnd('right')}
          onMouseDown={() => { engine.input.right = true; setActiveDpad('right'); }}
          onMouseUp={() => { engine.input.right = false; setActiveDpad(null); }}
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
            activeDpad === 'right'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-400/50'
              : 'bg-slate-900/80 text-cyan-400 border border-slate-700 hover:border-cyan-500'
          }`}
          aria-label="Mover para Direita"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* --- Right Action Button Cluster --- */}
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/* Top auxiliary row: Echo Temporal & Interact */}
        <div className="flex items-center gap-3">
          {/* Interact / Hack button */}
          <button
            type="button"
            onTouchStart={handleActionStart('interact')}
            onTouchEnd={handleActionEnd('interact')}
            onMouseDown={() => { engine.input.interact = true; engine.input.interactJustPressed = true; }}
            onMouseUp={() => { engine.input.interact = false; }}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-90 border ${
              activeActions['interact']
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-950/80 text-emerald-400 border-emerald-600/40 hover:border-emerald-500'
            }`}
            aria-label="Interagir"
          >
            <Hand className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tighter">USAR</span>
          </button>

          {/* ECO TEMPORAL Power Button */}
          {hasEcho && (
            <button
              type="button"
              onTouchStart={handleActionStart('echo')}
              onTouchEnd={handleActionEnd('echo')}
              onMouseDown={() => { engine.input.echo = true; engine.input.echoJustPressed = true; }}
              onMouseUp={() => { engine.input.echo = false; }}
              className={`h-12 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 border ${
                isRecording
                  ? 'bg-purple-600 text-white border-purple-300 animate-pulse shadow-lg shadow-purple-500/60'
                  : engine.echoClone.active
                  ? 'bg-cyan-600 text-white border-cyan-300 shadow-md shadow-cyan-500/40'
                  : 'bg-purple-950/80 text-purple-300 border-purple-500/50 hover:border-purple-400'
              }`}
              aria-label="Eco Temporal"
            >
              <Clock className="w-5 h-5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider uppercase font-display">
                  {isRecording ? 'INVOCAR ECO' : engine.echoClone.active ? 'ECO ATIVO' : 'GRAVAR ECO'}
                </span>
                <span className="text-[8px] font-mono-tech text-purple-200">
                  {isRecording ? `${(5 - engine.recordTimer).toFixed(1)}s` : 'CHRONO'}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Primary Combat Action Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 backdrop-blur-sm p-3 rounded-2xl border border-slate-700/60 shadow-2xl">
          {/* Dash Button */}
          <button
            type="button"
            onTouchStart={handleActionStart('dash')}
            onTouchEnd={handleActionEnd('dash')}
            onMouseDown={() => { engine.input.dash = true; engine.input.dashJustPressed = true; }}
            onMouseUp={() => { engine.input.dash = false; }}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-90 border ${
              activeActions['dash']
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/50'
                : 'bg-slate-900/90 text-amber-400 border-amber-600/40 hover:border-amber-400'
            }`}
            aria-label="Dash"
          >
            <Flame className="w-6 h-6" />
            <span className="text-[8px] font-bold font-display">DASH</span>
          </button>

          {/* Sabre Attack (Melee) */}
          <button
            type="button"
            onTouchStart={handleActionStart('slash')}
            onTouchEnd={handleActionEnd('slash')}
            onMouseDown={() => { engine.input.slash = true; engine.input.slashJustPressed = true; }}
            onMouseUp={() => { engine.input.slash = false; }}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-90 border ${
              activeActions['slash']
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-400/50'
                : 'bg-slate-900/90 text-cyan-400 border-cyan-500/40 hover:border-cyan-400'
            }`}
            aria-label="Ataque Sabre"
          >
            <Sword className="w-6 h-6" />
            <span className="text-[8px] font-bold font-display">SABRE</span>
          </button>

          {/* Shoot (Plasma Blaster) */}
          <button
            type="button"
            onTouchStart={handleActionStart('shoot')}
            onTouchEnd={handleActionEnd('shoot')}
            onMouseDown={() => { engine.input.shoot = true; }}
            onMouseUp={() => { engine.input.shoot = false; }}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-90 border ${
              activeActions['shoot']
                ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg shadow-sky-400/50'
                : 'bg-slate-900/90 text-sky-400 border-sky-600/40 hover:border-sky-400'
            }`}
            aria-label="Disparo de Plasma"
          >
            <Crosshair className="w-6 h-6" />
            <span className="text-[8px] font-bold font-display">TIRO</span>
          </button>

          {/* Jump Button (Largest / Primary) */}
          <button
            type="button"
            onTouchStart={handleActionStart('jump')}
            onTouchEnd={handleActionEnd('jump')}
            onMouseDown={() => { engine.input.jump = true; engine.input.jumpJustPressed = true; }}
            onMouseUp={() => { engine.input.jump = false; }}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-90 border-2 ${
              activeActions['jump']
                ? 'bg-emerald-400 text-slate-950 border-white shadow-xl shadow-emerald-400/60'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-500 hover:border-emerald-400'
            }`}
            aria-label="Pular"
          >
            <Zap className="w-6 h-6" />
            <span className="text-[8px] font-bold font-display">PULO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
