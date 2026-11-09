import { GameCamera, Particle, FloatingText, Player, EchoClone, Projectile, Enemy } from '../types/game';
import { LevelData } from './level';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 1280;
  private height: number = 720;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  public render(
    player: Player,
    echo: EchoClone,
    level: LevelData,
    camera: GameCamera,
    projectiles: Projectile[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    currentTime: number,
    echoState: string,
    recordTimer: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    // Clear background
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, this.width, this.height);

    // Camera shake offset
    let shakeX = 0;
    let shakeY = 0;
    if (camera.shake > 0) {
      shakeX = (Math.random() - 0.5) * camera.shake;
      shakeY = (Math.random() - 0.5) * camera.shake;
    }

    // 1. Draw Parallax Backgrounds (Before world transform)
    this.drawParallaxBackdrop(ctx, camera.x + shakeX, camera.y + shakeY, currentTime);

    // Apply Camera transform for world objects
    ctx.translate(-camera.x + shakeX, -camera.y + shakeY);

    // 2. Draw World Backdrop Structures
    this.drawWorldBackdrop(ctx, level, currentTime);

    // 3. Draw Level Objects (Acid, Bridges, Platforms, Doors, Plates, Terminals, Lasers, Elevator)
    this.drawLevelMechanisms(ctx, level, currentTime);
    this.drawPlatforms(ctx, level);
    this.drawCollectibles(ctx, level, currentTime);

    // 4. Draw Echo Holographic Clone
    if (echo.active) {
      this.drawEchoClone(ctx, echo, currentTime);
    }

    // 5. Draw Enemies
    for (const enemy of level.enemies) {
      this.drawEnemy(ctx, enemy, currentTime);
    }

    // 6. Draw Player Character
    this.drawPlayer(ctx, player, currentTime, echoState, recordTimer);

    // 7. Draw Projectiles
    this.drawProjectiles(ctx, projectiles);

    // 8. Draw Particles
    this.drawParticles(ctx, particles);

    // 9. Draw Floating Combat Text
    this.drawFloatingTexts(ctx, floatingTexts);

    ctx.restore();

    // 10. Post-process Screen Glitch or Vignette
    this.drawScreenVignette(ctx);
  }

  // --- Parallax Backgrounds ---
  private drawParallaxBackdrop(ctx: CanvasRenderingContext2D, camX: number, camY: number, time: number) {
    // Deep starry dystopian nebula layer (0.05 parallax speed)
    const p1X = -(camX * 0.05) % this.width;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#040714');
    gradient.addColorStop(0.6, '#080d21');
    gradient.addColorStop(1, '#0c071a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant futuristic megastructure silhouettes (0.12 parallax)
    const p2X = -(camX * 0.12) % 400;
    ctx.fillStyle = 'rgba(10, 18, 38, 0.7)';
    for (let x = -400 + p2X; x < this.width + 400; x += 180) {
      const h = 260 + Math.sin(x * 0.01) * 80;
      ctx.fillRect(x, this.height - h, 140, h);

      // Window pinprick lights
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      for (let wy = this.height - h + 20; wy < this.height - 40; wy += 35) {
        ctx.fillRect(x + 25, wy, 4, 8);
        ctx.fillRect(x + 65, wy, 4, 8);
        ctx.fillRect(x + 105, wy, 4, 8);
      }
      ctx.fillStyle = 'rgba(10, 18, 38, 0.7)';
    }

    // Atmospheric neon fog line
    const fogGrad = ctx.createLinearGradient(0, this.height - 200, 0, this.height);
    fogGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
    fogGrad.addColorStop(1, 'rgba(147, 51, 234, 0.15)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, this.height - 200, this.width, 200);
  }

  // --- World Backdrop Structures ---
  private drawWorldBackdrop(ctx: CanvasRenderingContext2D, level: LevelData, time: number) {
    // Large background structural columns & wires
    ctx.fillStyle = '#0c1427';
    for (let x = 100; x < level.width; x += 380) {
      ctx.fillRect(x, 150, 45, 600);
      // Support ribs
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      for (let y = 180; y < 650; y += 70) {
        ctx.fillRect(x - 10, y, 65, 8);
      }
      ctx.fillStyle = '#0c1427';
    }

    // Aesthetic decorations
    for (const dec of level.decorations) {
      if (dec.type === 'cryo_tube') {
        // Cryogenic glass chamber
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(dec.x, dec.y, dec.width, dec.height);
        // Interior fluid
        ctx.fillStyle = dec.color || '#06b6d4';
        ctx.globalAlpha = 0.35;
        ctx.fillRect(dec.x + 6, dec.y + 10, dec.width - 12, dec.height - 20);
        // Rising bubbles
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.7;
        for (let b = 0; b < 4; b++) {
          const by = dec.y + dec.height - 20 - ((time * 40 + b * 25) % (dec.height - 30));
          const bx = dec.x + 15 + ((b * 13) % (dec.width - 30));
          ctx.beginPath();
          ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Metal rim
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(dec.x, dec.y, dec.width, dec.height);
        ctx.restore();
      } else if (dec.type === 'holo_sign') {
        // Holographic warning sign
        ctx.save();
        const pulse = 0.6 + Math.sin(time * 5) * 0.25;
        ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.18})`;
        ctx.strokeStyle = `rgba(6, 182, 212, ${pulse * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.fillRect(dec.x, dec.y, dec.width, dec.height);
        ctx.strokeRect(dec.x, dec.y, dec.width, dec.height);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dec.text || 'SETOR ZERO', dec.x + dec.width / 2, dec.y + dec.height / 2);
        ctx.restore();
      } else if (dec.type === 'dangling_wires') {
        // Dangling severed wires with spark
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(dec.x, dec.y);
        ctx.quadraticCurveTo(dec.x - 10, dec.y + dec.height * 0.6, dec.x + 5, dec.y + dec.height);
        ctx.stroke();

        // Occasional electrical spark
        if (Math.sin(time * 8 + dec.x) > 0.85) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(dec.x + 5, dec.y + dec.height, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (dec.type === 'server_rack') {
        // Server stack
        ctx.fillStyle = '#111827';
        ctx.fillRect(dec.x, dec.y, dec.width, dec.height);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(dec.x, dec.y, dec.width, dec.height);

        // Blinking server lights
        for (let row = 0; row < 6; row++) {
          const sy = dec.y + 10 + row * 11;
          const isGreen = Math.sin(time * 6 + row + dec.x) > 0;
          ctx.fillStyle = isGreen ? '#10b981' : '#06b6d4';
          ctx.fillRect(dec.x + 8, sy, 4, 4);
          ctx.fillStyle = isGreen ? '#3b82f6' : '#ef4444';
          ctx.fillRect(dec.x + 18, sy, 4, 4);
        }
      }
    }
  }

  // --- Platforms ---
  private drawPlatforms(ctx: CanvasRenderingContext2D, level: LevelData) {
    for (const plat of level.platforms) {
      if (plat.type === 'solid') {
        // Sleek sci-fi metallic platform
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Neon edge highlight
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);

        // Subtly bevelled border
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

        // Tech panel detail lines on larger platforms
        if (plat.width > 120 && plat.height > 40) {
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
          for (let px = plat.x + 80; px < plat.x + plat.width - 20; px += 100) {
            ctx.beginPath();
            ctx.moveTo(px, plat.y + 10);
            ctx.lineTo(px, plat.y + 40);
            ctx.stroke();
          }
        }
      } else if (plat.type === 'one-way') {
        // Futuristic grated catwalk / ledge
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Glowing upper strip
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(plat.x, plat.y, plat.width, 2.5);

        // Grating lines
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        for (let gx = plat.x + 6; gx < plat.x + plat.width; gx += 12) {
          ctx.beginPath();
          ctx.moveTo(gx, plat.y + 3);
          ctx.lineTo(gx - 4, plat.y + plat.height);
          ctx.stroke();
        }
      } else if (plat.type === 'hazard') {
        // Acid trench bottom
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Bubbling caustic surface
        const pulse = Math.sin(plat.x + plat.y) * 4;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(plat.x, plat.y, plat.width, 6 + pulse);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ PERIGO: RESÍDUO ÁCIDO TÉRMICO ⚠', plat.x + plat.width / 2, plat.y + 24);
      }
    }
  }

  // --- Level Mechanisms: Doors, Plates, Bridges, Lasers, Terminals, Elevator ---
  private drawLevelMechanisms(ctx: CanvasRenderingContext2D, level: LevelData, time: number) {
    // 1. Light Bridges
    for (const bridge of level.lightBridges) {
      if (bridge.isActive) {
        ctx.save();
        const pulse = 0.7 + Math.sin(time * 10) * 0.2;
        ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.5})`;
        ctx.fillRect(bridge.x, bridge.y, bridge.width, bridge.height);

        // Top energetic surface
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bridge.x, bridge.y, bridge.width, 3);

        // Photon grid chevrons
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        for (let bx = bridge.x + 10; bx < bridge.x + bridge.width; bx += 25) {
          ctx.beginPath();
          ctx.moveTo(bx, bridge.y);
          ctx.lineTo(bx + 10, bridge.y + bridge.height / 2);
          ctx.lineTo(bx, bridge.y + bridge.height);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // Inactive ghost projector emitter
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(bridge.x, bridge.y, bridge.width, bridge.height);
        ctx.setLineDash([]);
      }
    }

    // 2. Pressure Plates
    for (const plate of level.pressurePlates) {
      ctx.save();
      const currentH = plate.isPressed ? 4 : plate.height;
      const currentY = plate.y + (plate.height - currentH);

      // Plate base
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(plate.x, plate.y, plate.width, plate.height);

      // Moving contact pad
      ctx.fillStyle = plate.isPressed ? '#10b981' : '#f59e0b';
      ctx.fillRect(plate.x + 4, currentY, plate.width - 8, currentH);

      // Quantum circuit lines leading to door
      ctx.strokeStyle = plate.isPressed ? '#10b981' : 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plate.x + plate.width / 2, plate.y + plate.height);
      ctx.lineTo(plate.x + plate.width / 2, plate.y + plate.height + 20);
      ctx.lineTo(plate.x + 300, plate.y + plate.height + 20);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Blast Doors
    for (const door of level.doors) {
      ctx.save();
      const doorOpenOffset = door.height * door.openProgress;
      const visibleHeight = door.height - doorOpenOffset;

      // Door frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(door.x - 4, door.y, door.width + 8, door.height);

      // Sliding door panel
      if (visibleHeight > 2) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(door.x, door.y, door.width, visibleHeight);

        // Security chevron stripes
        ctx.fillStyle = door.isLocked && !door.isOpen ? '#ef4444' : '#10b981';
        for (let dy = door.y + 10; dy < door.y + visibleHeight - 10; dy += 24) {
          ctx.fillRect(door.x + 6, dy, door.width - 12, 5);
        }

        // Lock status indicator
        ctx.fillStyle = door.isOpen ? '#10b981' : '#ef4444';
        ctx.fillRect(door.x + door.width / 2 - 4, door.y + visibleHeight / 2 - 4, 8, 8);
      }

      // Door label
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.font = '9px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(door.isOpen ? 'DESBLOQUEADO' : 'TRAVADO', door.x + door.width / 2, door.y - 8);

      ctx.restore();
    }

    // 4. Security Lasers
    for (const laser of level.lasers) {
      if (!laser.isActive) continue;

      ctx.save();
      // Laser core
      const pulse = 0.8 + Math.sin(time * 20 + laser.x) * 0.2;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;

      ctx.fillRect(laser.x + 3, laser.y, laser.width - 6, laser.height);

      // Bright white central beam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(laser.x + laser.width / 2 - 1, laser.y, 2, laser.height);

      // Emitter nodes top and bottom
      ctx.fillStyle = '#334155';
      ctx.shadowBlur = 0;
      ctx.fillRect(laser.x - 4, laser.y, laser.width + 8, 6);
      ctx.fillRect(laser.x - 4, laser.y + laser.height - 6, laser.width + 8, 6);

      ctx.restore();
    }

    // 5. Terminals
    for (const term of level.terminals) {
      ctx.save();
      // Pedestal
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(term.x + 10, term.y + 25, term.width - 20, term.height - 25);

      // Angled monitor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(term.x, term.y, term.width, 25);

      // Holographic projection above monitor
      const holoAlpha = 0.5 + Math.sin(time * 6) * 0.25;
      ctx.fillStyle = term.isHacked ? `rgba(16, 185, 129, ${holoAlpha})` : `rgba(6, 182, 212, ${holoAlpha})`;
      ctx.fillRect(term.x + 4, term.y - 30, term.width - 8, 22);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(term.isHacked ? 'SINCRONIZADO' : 'ATIVAR [E]', term.x + term.width / 2, term.y - 16);

      ctx.restore();
    }

    // 6. Escape Elevator
    const el = level.elevator;
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(el.x, el.y, el.width, el.height);

    ctx.strokeStyle = el.isUnlocked ? '#10b981' : '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(el.x, el.y, el.width, el.height);

    // Glowing energy lift pillar inside
    if (el.isUnlocked) {
      const pulse = 0.4 + Math.sin(time * 8) * 0.3;
      ctx.fillStyle = `rgba(16, 185, 129, ${pulse})`;
      ctx.fillRect(el.x + 10, el.y + 10, el.width - 20, el.height - 20);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EVACUAÇÃO', el.x + el.width / 2, el.y - 12);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BLOQUEADO', el.x + el.width / 2, el.y - 12);
    }
    ctx.restore();
  }

  // --- Collectibles ---
  private drawCollectibles(ctx: CanvasRenderingContext2D, level: LevelData, time: number) {
    for (const col of level.collectibles) {
      if (col.collected) continue;

      ctx.save();
      const floatY = Math.sin(time * 4 + col.x) * 5;
      const cy = col.y + floatY;

      if (col.type === 'DATA_CORE') {
        // Glowing octagonal Chrono Data Core
        ctx.fillStyle = '#8b5cf6';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(col.x + col.width / 2, cy + col.height / 2, col.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◆', col.x + col.width / 2, cy + col.height / 2);
      } else if (col.type === 'HEALTH') {
        // Nanite Medkit cross
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fillRect(col.x + 4, cy + 4, col.width - 8, col.height - 8);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(col.x + col.width / 2 - 2, cy + 6, 4, col.height - 12);
        ctx.fillRect(col.x + 6, cy + col.height / 2 - 2, col.width - 12, 4);
      } else if (col.type === 'ENERGY') {
        // Chrono Energy Battery
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(col.x + col.width / 2, cy + 2);
        ctx.lineTo(col.x + col.width - 4, cy + col.height / 2);
        ctx.lineTo(col.x + col.width / 2, cy + col.height - 2);
        ctx.lineTo(col.x + 4, cy + col.height / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', col.x + col.width / 2, cy + col.height / 2);
      }

      ctx.restore();
    }
  }

  // --- Player Character: Kaelen-07 ---
  private drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    time: number,
    echoState: string,
    recordTimer: number
  ) {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.scale(player.facing, 1);

    // Hit flash or invulnerability flicker
    if (player.invulnerableTimer > 0 && Math.floor(time * 30) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Recording aura / Chrono distortion
    if (echoState === 'RECORDING') {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 36 + Math.sin(time * 12) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Digital tape glyph
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 10px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`REC ${recordTimer.toFixed(1)}s`, 0, -player.height / 2 - 14);
    }

    // Dash trail effect
    if (player.isDashing) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fillRect(-player.width / 2 - 15, -player.height / 2, player.width + 10, player.height);
    }

    const halfW = player.width / 2;
    const halfH = player.height / 2;

    // Thruster flame on back / jump / dash
    if (!player.grounded || player.isDashing || Math.abs(player.vx) > 100) {
      ctx.save();
      ctx.fillStyle = player.isDashing ? '#06b6d4' : '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      const flameLen = player.isDashing ? 18 : (player.grounded ? 8 : 12);
      ctx.beginPath();
      ctx.moveTo(-halfW + 4, halfH - 12);
      ctx.lineTo(-halfW - flameLen, halfH - 6);
      ctx.lineTo(-halfW + 4, halfH - 2);
      ctx.fill();
      ctx.restore();
    }

    // Legs animation
    const runCycle = Math.sin(time * 18) * 10;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;

    // Left leg
    const legLeftAngle = player.grounded ? (Math.abs(player.vx) > 10 ? runCycle : 0) : 6;
    ctx.fillRect(-6 + legLeftAngle * 0.4, halfH - 18, 5, 18);
    // Right leg
    const legRightAngle = player.grounded ? (Math.abs(player.vx) > 10 ? -runCycle : 0) : -6;
    ctx.fillRect(1 + legRightAngle * 0.4, halfH - 18, 5, 18);

    // Torso / Biomechanical armor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-halfW + 6, -halfH + 12, player.width - 12, player.height - 26);

    // Armored chestplate
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfW + 8, -halfH + 14, player.width - 16, 14);

    // Glowing Chrono Core on chest
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 6;
    ctx.fillRect(-2, -halfH + 18, 4, 6);
    ctx.shadowBlur = 0;

    // Cybernetic Helmet
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfW + 7, -halfH, player.width - 14, 14);

    // Neon visor line
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 7;
    ctx.fillRect(0, -halfH + 4, halfW - 4, 4);
    ctx.shadowBlur = 0;

    // Weapon Arm (Blaster)
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, -halfH + 16, 14, 6);
    // Muzzle tip
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(14, -halfH + 17, 4, 4);

    // Shoot muzzle flash
    if (player.isShooting) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(22, -halfH + 19, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Chrono Sabre Slash Arc
    if (player.isSlashing) {
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.arc(8, 0, 38, -Math.PI * 0.4, Math.PI * 0.4, false);
      ctx.stroke();

      // Inner white hot cut line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // --- Echo Clone: Quantum Holographic Projection ---
  private drawEchoClone(ctx: CanvasRenderingContext2D, echo: EchoClone, time: number) {
    ctx.save();
    ctx.translate(echo.x + echo.width / 2, echo.y + echo.height / 2);
    ctx.scale(echo.facing, 1);

    // Holographic transparency & glitch effect
    const glitchOffset = Math.sin(time * 30) > 0.85 ? (Math.random() - 0.5) * 6 : 0;
    ctx.translate(glitchOffset, 0);

    ctx.globalAlpha = 0.72;

    // Chromatic aberration pass (Red fringe)
    ctx.save();
    ctx.translate(-2, 0);
    ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.fillRect(-echo.width / 2, -echo.height / 2, echo.width, echo.height);
    ctx.restore();

    // Cyan hologram body silhouette
    ctx.fillStyle = 'rgba(6, 182, 212, 0.65)';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 12;
    ctx.fillRect(-echo.width / 2, -echo.height / 2, echo.width, echo.height);

    // Interlaced scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    for (let sy = -echo.height / 2; sy < echo.height / 2; sy += 3) {
      ctx.fillRect(-echo.width / 2 - 4, sy, echo.width + 8, 1);
    }

    // Glowing visor
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -echo.height / 2 + 4, echo.width / 2 - 2, 4);

    // Slash arc if echo is slashing
    if (echo.isAttacking) {
      ctx.save();
      ctx.strokeStyle = '#c084fc';
      ctx.shadowColor = '#d8b4fe';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(8, 0, 36, -Math.PI * 0.4, Math.PI * 0.4, false);
      ctx.stroke();
      ctx.restore();
    }

    // Echo Label & Timeline Bar above clone
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 10px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ECO TEMPORAL', echo.x + echo.width / 2, echo.y - 12);

    // Remaining life ring
    const lifeRatio = echo.lifeTimer / echo.maxLife;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(echo.x + echo.width / 2, echo.y - 15, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
    ctx.stroke();
    ctx.restore();
  }

  // --- Enemies ---
  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
    if (enemy.hp <= 0) return;

    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    ctx.scale(enemy.facing, 1);

    // Hit flash
    if (enemy.hitFlashTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
      ctx.restore();
      return;
    }

    if (enemy.type === 'DRONE') {
      // Sentinel Drone: Floating robotic sphere
      const bobY = Math.sin(time * 6 + enemy.x) * 4;
      ctx.translate(0, bobY);

      // Chassis
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Outer rotating ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.width / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();

      // Red laser eye / sensor
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(6, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Target laser sight
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(160, 0);
      ctx.stroke();
    } else if (enemy.type === 'ANDROID') {
      // Corrupted Android: Bipedal mechanical worker
      const halfW = enemy.width / 2;
      const halfH = enemy.height / 2;

      // Heavy mechanical legs
      const walk = Math.sin(time * 12) * 8;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6 + walk * 0.4, halfH - 18, 6, 18);
      ctx.fillRect(2 - walk * 0.4, halfH - 18, 6, 18);

      // Torso
      ctx.fillStyle = '#334155';
      ctx.fillRect(-halfW + 4, -halfH + 10, enemy.width - 8, enemy.height - 24);

      // Hazard warning stripes
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-halfW + 6, -halfH + 18, enemy.width - 12, 6);

      // Head & red sensor slit
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-halfW + 6, -halfH, enemy.width - 12, 12);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.fillRect(0, -halfH + 3, halfW - 4, 4);

      // Mechanical cleaver / plasma torch arm
      ctx.fillStyle = '#64748b';
      ctx.fillRect(2, -halfH + 16, 16, 6);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(16, -halfH + 14, 6, 10);
    } else if (enemy.type === 'TURRET') {
      // Ceiling Turret
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, 10);

      // Rotating ball mount
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Dual barrel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(6, -4, 16, 8);

      // Targeting laser
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(260, 40);
      ctx.stroke();
    } else if (enemy.type === 'BOSS_GUARDIAN') {
      // GUARDIAN MK-IV BOSS
      const halfW = enemy.width / 2;
      const halfH = enemy.height / 2;

      // Heavy industrial legs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-20, halfH - 24, 16, 24);
      ctx.fillRect(6, halfH - 24, 16, 24);

      // Massive chassis
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-halfW, -halfH + 14, enemy.width, enemy.height - 34);

      // Shoulder missile pods
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-halfW - 8, -halfH + 8, 14, 20);
      ctx.fillRect(halfW - 6, -halfH + 8, 14, 20);

      // Glowing central reactor core (Vulnerable spot)
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -6, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Heavy dual Gatling arm
      ctx.fillStyle = '#475569';
      ctx.fillRect(halfW - 8, 0, 24, 12);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(halfW + 16, 2, 4, 8);

      // Glowing Hexagon Energy Shield
      if (enemy.shieldActive && (enemy.shieldHp ?? 0) > 0) {
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.width * 0.72, -Math.PI * 0.6, Math.PI * 0.6, false);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Enemy Health Bar
    ctx.save();
    const barW = Math.max(enemy.width, 36);
    const barH = enemy.type === 'BOSS_GUARDIAN' ? 7 : 4;
    const barX = enemy.x + enemy.width / 2 - barW / 2;
    const barY = enemy.y - (enemy.type === 'BOSS_GUARDIAN' ? 20 : 12);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(barX, barY, barW, barH);

    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = enemy.type === 'BOSS_GUARDIAN' ? '#ef4444' : '#eab308';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // If boss, show name
    if (enemy.type === 'BOSS_GUARDIAN') {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GUARDIÃO MK-IV [SISTEMA CENTRAL]', enemy.x + enemy.width / 2, barY - 6);
    }

    ctx.restore();
  }

  // --- Projectiles ---
  private drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
    for (const p of projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // White inner core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // --- Particles ---
  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const pt of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color;

      if (pt.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (pt.shape === 'square') {
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      } else if (pt.shape === 'line') {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = pt.size;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - pt.vx * 0.05, pt.y - pt.vy * 0.05);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // --- Floating Combat Texts ---
  private drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
    for (const t of texts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillStyle = t.color;
      ctx.font = 'bold 13px "Chakra Petch", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  // --- Screen Vignette ---
  private drawScreenVignette(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.35,
      this.width / 2,
      this.height / 2,
      this.width * 0.72
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
}
