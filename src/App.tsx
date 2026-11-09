import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { soundManager } from './game/audio';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine>(new GameEngine());
  const rendererRef = useRef<GameRenderer | null>(null);

  // React UI State
  const [screen, setScreen] = useState<GameEngine['screen']>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTouch, setShowTouch] = useState<boolean>(true);
  const [, setHudTick] = useState<number>(0);

  // Check touch capabilities on mount
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowTouch(isTouchDevice);
  }, []);

  // --- Keyboard Input Listeners ---
  useEffect(() => {
    const engine = engineRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on space / arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.repeat) return;

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          engine.input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          engine.input.right = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          engine.input.down = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          engine.input.jump = true;
          engine.input.jumpJustPressed = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          engine.input.dash = true;
          engine.input.dashJustPressed = true;
          break;
        case 'KeyJ':
          engine.input.shoot = true;
          break;
        case 'KeyK':
        case 'KeyX':
          engine.input.slash = true;
          engine.input.slashJustPressed = true;
          break;
        case 'KeyE':
        case 'KeyQ':
          engine.input.echo = true;
          engine.input.echoJustPressed = true;
          engine.input.interact = true;
          engine.input.interactJustPressed = true;
          break;
        case 'KeyF':
          engine.input.interact = true;
          engine.input.interactJustPressed = true;
          break;
        case 'Escape':
        case 'KeyP':
          if (engine.screen === 'PLAYING') {
            engine.screen = 'PAUSED';
            setScreen('PAUSED');
          } else if (engine.screen === 'PAUSED') {
            engine.screen = 'PLAYING';
            setScreen('PLAYING');
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          engine.input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          engine.input.right = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          engine.input.down = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          engine.input.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          engine.input.dash = false;
          break;
        case 'KeyJ':
          engine.input.shoot = false;
          break;
        case 'KeyK':
        case 'KeyX':
          engine.input.slash = false;
          break;
        case 'KeyE':
        case 'KeyQ':
          engine.input.echo = false;
          engine.input.interact = false;
          break;
        case 'KeyF':
          engine.input.interact = false;
          break;
      }
    };

    const handleBlur = () => {
      // Clear all held inputs on window blur
      engine.input.left = false;
      engine.input.right = false;
      engine.input.down = false;
      engine.input.jump = false;
      engine.input.dash = false;
      engine.input.shoot = false;
      engine.input.slash = false;
      engine.input.echo = false;
      engine.input.interact = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // --- Main Game Loop & Resize ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new GameRenderer(ctx);
    rendererRef.current = renderer;

    const engine = engineRef.current;

    // Handle canvas sizing
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      renderer.setDimensions(width, height);
      engine.setViewport(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let lastTime = performance.now();
    let hudTimer = 0;
    let animId: number;

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      // Update engine
      engine.update(rawDt);

      // Render world
      renderer.render(
        engine.player,
        engine.echoClone,
        engine.level,
        engine.camera,
        engine.projectiles,
        engine.particles,
        engine.floatingTexts,
        engine.gameTime,
        engine.echoState,
        engine.recordTimer
      );

      // Check screen transitions
      if (engine.screen !== screen) {
        setScreen(engine.screen);
      }

      // Throttle HUD state synchronization (10 times/sec)
      hudTimer += rawDt;
      if (hudTimer >= 0.1) {
        hudTimer = 0;
        setHudTick((prev) => prev + 1);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [screen]);

  // --- Actions ---
  const handleStartMission = useCallback(() => {
    const engine = engineRef.current;
    engine.startMission();
    setScreen('PLAYING');
  }, []);

  const handlePause = useCallback(() => {
    const engine = engineRef.current;
    if (engine.screen === 'PLAYING') {
      engine.screen = 'PAUSED';
      setScreen('PAUSED');
    }
  }, []);

  const handleResume = useCallback(() => {
    const engine = engineRef.current;
    engine.screen = 'PLAYING';
    setScreen('PLAYING');
  }, []);

  const handleRestartCheckpoint = useCallback(() => {
    const engine = engineRef.current;
    engine.restartFromCheckpoint();
    setScreen('PLAYING');
  }, []);

  const handleExitTitle = useCallback(() => {
    const engine = engineRef.current;
    soundManager.stopMusic();
    engine.screen = 'TITLE';
    setScreen('TITLE');
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleToggleTouch = useCallback(() => {
    setShowTouch((prev) => !prev);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 60fps Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-crosshair"
      />

      {/* Futuristic CRT Scanline overlay effect */}
      <div className="scanlines-overlay absolute inset-0 pointer-events-none z-10" />

      {/* In-Game HUD (During PLAYING and PAUSED) */}
      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <HUD
          engine={engineRef.current}
          onPause={handlePause}
          showTouch={showTouch}
          onToggleTouch={handleToggleTouch}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Android Multi-Touch Controls */}
      {screen === 'PLAYING' && (
        <TouchControls
          engine={engineRef.current}
          showControls={showTouch}
        />
      )}

      {/* Screen Modals */}
      {screen === 'TITLE' && (
        <TitleScreen onStart={handleStartMission} />
      )}

      {screen === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestartCheckpoint}
          onExitTitle={handleExitTitle}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          showTouch={showTouch}
          onToggleTouch={handleToggleTouch}
        />
      )}

      {screen === 'VICTORY' && (
        <VictoryModal
          engine={engineRef.current}
          onPlayAgain={handleStartMission}
          onExitTitle={handleExitTitle}
        />
      )}

      {screen === 'GAMEOVER' && (
        <GameOverModal
          onRestart={handleRestartCheckpoint}
          onExitTitle={handleExitTitle}
        />
      )}
    </div>
  );
}
