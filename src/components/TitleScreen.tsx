import React, { useState } from 'react';
import { 
  Play, 
  HelpCircle, 
  Keyboard, 
  Smartphone, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
      {/* Background ambient grid with glowing particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />

      {/* Top Header branding */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-400 rotate-45 shadow-lg shadow-cyan-400" />
          <span className="text-xs font-mono-tech tracking-widest text-cyan-400 font-semibold uppercase">
            ESTAÇÃO DE PESQUISA QUÂNTICA // SETOR ZERO
          </span>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 bg-slate-900/80 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showGuide ? 'Fechar Guia' : 'Como Jogar'}</span>
        </button>
      </div>

      {/* Center Hero Title Lockup */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-3xl mx-auto py-8">
        {/* Subtitle tag */}
        <div className="flex items-center gap-2 text-xs font-mono-tech text-purple-400 font-bold tracking-widest uppercase mb-3">
          <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          <span>EXPERIMENTO CRONO-QUÂNTICO ATIVO</span>
        </div>

        {/* Bespoke Title Logo */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-500 drop-shadow-[0_10px_25px_rgba(6,182,212,0.3)]">
          NEXO
        </h1>
        <div className="flex items-center gap-4 my-2">
          <div className="h-[2px] w-12 md:w-20 bg-gradient-to-r from-transparent to-cyan-500" />
          <span className="text-2xl md:text-3xl font-display font-bold tracking-[0.35em] text-cyan-300 uppercase">
            TEMPO ZERO
          </span>
          <div className="h-[2px] w-12 md:w-20 bg-gradient-to-l from-transparent to-purple-500" />
        </div>

        {/* Narrative Synopsys */}
        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed font-sans">
          Ano 2184. A Estação Quântica Nexus colapsou em um vórtice de entropia. No papel do Agente <span className="text-cyan-300 font-semibold">Kaelen-07</span>, use a mecânica de <span className="text-purple-300 font-semibold">Eco Temporal</span> para gravar seus movimentos e invocar clones do seu passado para resolver mecanismos e neutralizar as defesas do laboratório.
        </p>

        {/* Start Action CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-bold text-lg tracking-wider rounded-xl shadow-xl shadow-cyan-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950 transition-transform group-hover:translate-x-1" />
            <span>INICIAR MISSÃO 01</span>
          </button>
        </div>

        {/* Control Hints Single Line */}
        <div className="mt-5 text-xs text-slate-500 font-mono-tech flex items-center gap-3">
          <span>PC: WASD Mover · J Tiro · K Sabre · E Eco · Shift Dash</span>
          <span className="text-slate-700">|</span>
          <span>Android: Controles Touch Virtuais Ativados</span>
        </div>
      </div>

      {/* Guide Modal Overlay */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-display font-bold text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                MANUAL OPERACIONAL: NEXO TEMPO ZERO
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm font-bold bg-slate-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-xs text-slate-300">
              {/* Mechanics Column 1 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-purple-400 text-sm">
                  <Clock className="w-4 h-4" />
                  MECÂNICA: ECO TEMPORAL
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Recupere o Módulo no primeiro terminal. Ao pressionar <strong className="text-purple-300">[ECO / E]</strong>, você grava até 5 segundos dos seus movimentos. Pressione novamente para projetar um clone quântico que repete exatamente seus passos.
                </p>
                <div className="text-[11px] text-cyan-300 mt-1 font-mono-tech">
                  ✓ O clone aciona placas de pressão para manter portas abertas.
                  <br />
                  ✓ O clone atira e atrai os disparos de torretas de segurança.
                </div>
              </div>

              {/* Mechanics Column 2 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-display font-bold text-cyan-400 text-sm">
                  <Layers className="w-4 h-4" />
                  ARSENAL & COMBATE
                </div>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>Disparo de Plasma (J):</strong> Disparos rápidos a distância contra drones e androides.
                  <br />
                  • <strong>Sabre Crono (K):</strong> Golpe corpo a corpo potente que corta múltiplos alvos e destrói projéteis inimigos!
                  <br />
                  • <strong>Dash Quântico (Shift):</strong> Propulsão invulnerável que permite atravessar lasers e abismos.
                </p>
              </div>

              {/* Controls PC */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 font-display font-bold text-amber-400 mb-2">
                  <Keyboard className="w-4 h-4" />
                  CONTROLES DE TECLADO (PC)
                </div>
                <div className="space-y-1 font-mono-tech text-[11px] text-slate-400">
                  <div>• <span className="text-white">A / D ou Setas:</span> Mover personagem</div>
                  <div>• <span className="text-white">W / Espaço:</span> Pulo / Pulo Duplo</div>
                  <div>• <span className="text-white">Shift:</span> Dash com propulsão</div>
                  <div>• <span className="text-white">J:</span> Disparar Plasma</div>
                  <div>• <span className="text-white">K:</span> Golpe de Sabre</div>
                  <div>• <span className="text-white">E / Q:</span> Eco Temporal</div>
                  <div>• <span className="text-white">F / E:</span> Interagir com Terminal</div>
                  <div>• <span className="text-white">Esc / P:</span> Pausar</div>
                </div>
              </div>

              {/* Controls Touch */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 font-display font-bold text-emerald-400 mb-2">
                  <Smartphone className="w-4 h-4" />
                  CONTROLES TOUCHSCREEN (ANDROID)
                </div>
                <div className="space-y-1 font-mono-tech text-[11px] text-slate-400">
                  <div>• <span className="text-white">D-Pad Esquerdo:</span> Mover e agachar</div>
                  <div>• <span className="text-white">Botão [PULO]:</span> Salto e impulso aéreo</div>
                  <div>• <span className="text-white">Botão [DASH]:</span> Corrida rápida</div>
                  <div>• <span className="text-white">Botão [TIRO]:</span> Rajada de plasma</div>
                  <div>• <span className="text-white">Botão [SABRE]:</span> Golpe de lâmina</div>
                  <div>• <span className="text-white">Botão [ECO]:</span> Gravar e Invocação Quântica</div>
                  <div>• <span className="text-white">Botão [USAR]:</span> Hacking e elevador</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-bold rounded-lg transition-colors cursor-pointer"
              >
                ENTENDIDO, VAMOS LÁ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <span>Kaelen-07 Protocol</span>
          <span>·</span>
          <span>HTML5 Canvas 60 FPS</span>
          <span>·</span>
          <span>Áudio Procedural Web Audio API</span>
        </div>
        <div>
          <span>NEXO: TEMPO ZERO © 2026</span>
        </div>
      </div>
    </div>
  );
};
