import {
  BlastDoor,
  Collectible,
  EchoClone,
  EchoState,
  Elevator,
  Enemy,
  FloatingText,
  GameCamera,
  GameScreen,
  InputState,
  LightBridge,
  MissionObjectives,
  Particle,
  Player,
  PressurePlate,
  Projectile,
  RecordedFrame,
  SecurityLaser,
  Terminal,
} from '../types/game';
import { soundManager } from './audio';
import { createMissionSectorZero, LevelData } from './level';
import {
  ACCELERATION,
  AIR_ACCEL,
  AIR_DRAG,
  checkAABB,
  COYOTE_TIME,
  DASH_COOLDOWN,
  DASH_DURATION,
  DASH_SPEED,
  DOUBLE_JUMP_IMPULSE,
  FRICTION,
  GRAVITY,
  JUMP_BUFFER_TIME,
  JUMP_IMPULSE,
  MAX_FALL_SPEED,
  moveAndCollide,
  MOVE_SPEED,
  pointInRect,
} from './physics';

export class GameEngine {
  public screen: GameScreen = 'TITLE';
  public level: LevelData;
  public player: Player;
  public echoClone: EchoClone;
  public camera: GameCamera;

  // Echo recording buffer
  public echoState: EchoState = 'IDLE';
  public recordTimer: number = 0;
  public maxRecordTime: number = 5.0; // seconds
  public recordingBuffer: RecordedFrame[] = [];
  public echoCooldownTimer: number = 0;

  // Projectiles & FX
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Mission Objectives & Stats
  public objectives: MissionObjectives;
  public gameTime: number = 0;
  public score: number = 0;
  public enemiesDefeated: number = 0;

  // Input
  public input: InputState = {
    left: false,
    right: false,
    down: false,
    up: false,
    jump: false,
    jumpJustPressed: false,
    dash: false,
    dashJustPressed: false,
    shoot: false,
    slash: false,
    slashJustPressed: false,
    echo: false,
    echoJustPressed: false,
    interact: false,
    interactJustPressed: false,
  };

  // Viewport
  public viewportWidth: number = 1280;
  public viewportHeight: number = 720;

  // Checkpoint
  private checkpointSpawn: { x: number; y: number } = { x: 120, y: 640 };

  constructor() {
    this.level = createMissionSectorZero();
    this.player = this.createInitialPlayer(this.level.spawnPoint.x, this.level.spawnPoint.y);
    this.echoClone = this.createInitialEcho();
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      shake: 0,
      shakeDuration: 0,
    };
    this.objectives = {
      hasEchoDevice: false,
      openedPressureDoor: false,
      bossDefeated: false,
      reachedElevator: false,
      dataCoresCollected: 0,
      totalDataCores: 3,
    };
  }

  private createInitialPlayer(x: number, y: number): Player {
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      facing: 1,
      grounded: true,
      canDoubleJump: true,
      coyoteTimer: 0,
      jumpBufferTimer: 0,

      maxHp: 100,
      hp: 100,
      maxEnergy: 100,
      energy: 100,
      invulnerableTimer: 0,

      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,

      isShooting: false,
      shootCooldown: 0,

      isSlashing: false,
      slashTimer: 0,
      slashCooldown: 0,

      animFrame: 0,
      animTimer: 0,
      currentAction: 'idle',
    };
  }

  private createInitialEcho(): EchoClone {
    return {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      facing: 1,
      currentAction: 'idle',
      frameIndex: 0,
      recordedFrames: [],
      lifeTimer: 0,
      maxLife: 5.0,
      isAttacking: false,
      isShooting: false,
    };
  }

  public setViewport(w: number, h: number) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  public startMission() {
    this.level = createMissionSectorZero();
    this.player = this.createInitialPlayer(this.level.spawnPoint.x, this.level.spawnPoint.y);
    this.echoClone = this.createInitialEcho();
    this.echoState = 'IDLE';
    this.recordTimer = 0;
    this.recordingBuffer = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.gameTime = 0;
    this.enemiesDefeated = 0;
    this.score = 0;
    this.objectives = {
      hasEchoDevice: false,
      openedPressureDoor: false,
      bossDefeated: false,
      reachedElevator: false,
      dataCoresCollected: 0,
      totalDataCores: 3,
    };
    this.screen = 'PLAYING';
    soundManager.startMusic();
  }

  public restartFromCheckpoint() {
    this.player = this.createInitialPlayer(this.checkpointSpawn.x, this.checkpointSpawn.y);
    // Keep echo device unlocked if previously collected
    if (this.objectives.hasEchoDevice) {
      this.objectives.hasEchoDevice = true;
    }
    this.echoClone.active = false;
    this.echoState = 'IDLE';
    this.recordTimer = 0;
    this.recordingBuffer = [];
    this.screen = 'PLAYING';
    soundManager.startMusic();
  }

  public triggerScreenShake(amount: number, duration: number = 0.25) {
    this.camera.shake = Math.max(this.camera.shake, amount);
    this.camera.shakeDuration = duration;
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#ffffff') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -35,
      color,
      alpha: 1.0,
      life: 1.2,
    });
  }

  public spawnParticles(x: number, y: number, color: string, count: number, speed: number = 120, shape: Particle['shape'] = 'circle') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.3 + Math.random() * 0.7) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2 + Math.random() * 4,
        color,
        alpha: 1.0,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        shape,
      });
    }
  }

  // --- Main Tick Update ---
  public update(dt: number) {
    if (this.screen !== 'PLAYING') return;

    // Clamp dt to 50ms to avoid physics exploding
    const clampedDt = Math.min(dt, 0.05);
    this.gameTime += clampedDt;

    // 1. Update Camera Shake
    if (this.camera.shakeDuration > 0) {
      this.camera.shakeDuration -= clampedDt;
      if (this.camera.shakeDuration <= 0) {
        this.camera.shake = 0;
      }
    }

    // 2. Update Player Logic & Input
    this.updatePlayer(clampedDt);

    // 3. Update Echo Recording & Clone Playback
    this.updateEchoSystem(clampedDt);

    // 4. Update Level Mechanisms (Doors, Plates, Bridges, Lasers, Terminals, Elevator)
    this.updateLevelMechanisms(clampedDt);

    // 5. Update Enemies AI
    this.updateEnemies(clampedDt);

    // 6. Update Projectiles
    this.updateProjectiles(clampedDt);

    // 7. Update Particles & Floating Text
    this.updateParticles(clampedDt);

    // 8. Update Camera Position (Follow player smoothly)
    this.updateCamera(clampedDt);

    // Reset Edge-triggered Inputs for next tick
    this.input.jumpJustPressed = false;
    this.input.dashJustPressed = false;
    this.input.slashJustPressed = false;
    this.input.echoJustPressed = false;
    this.input.interactJustPressed = false;
  }

  // --- Player Logic ---
  private updatePlayer(dt: number) {
    const p = this.player;

    // Invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer -= dt;
    }

    // Energy regeneration
    if (p.energy < p.maxEnergy) {
      p.energy = Math.min(p.maxEnergy, p.energy + 14 * dt);
    }

    // Dash timer & cooldown
    if (p.dashCooldown > 0) {
      p.dashCooldown -= dt;
    }
    if (p.isDashing) {
      p.dashTimer -= dt;
      p.vx = p.facing * DASH_SPEED;
      p.vy = 0; // zero gravity during dash

      // Spawn dash jet particles
      if (Math.random() < 0.6) {
        this.spawnParticles(p.x + (p.facing > 0 ? 0 : p.width), p.y + p.height / 2, '#38bdf8', 1, 40);
      }

      if (p.dashTimer <= 0) {
        p.isDashing = false;
      }
    }

    // Shooting cooldown
    if (p.shootCooldown > 0) {
      p.shootCooldown -= dt;
    }
    if (p.isShooting && p.shootCooldown <= 0.1) {
      p.isShooting = false;
    }

    // Slashing cooldown & timer
    if (p.slashCooldown > 0) {
      p.slashCooldown -= dt;
    }
    if (p.isSlashing) {
      p.slashTimer -= dt;
      if (p.slashTimer <= 0) {
        p.isSlashing = false;
      }
    }

    // --- Input: Dash Activation ---
    if (this.input.dashJustPressed && p.dashCooldown <= 0 && p.energy >= 20 && !p.isDashing) {
      p.isDashing = true;
      p.dashTimer = DASH_DURATION;
      p.dashCooldown = DASH_COOLDOWN;
      p.energy -= 20;
      soundManager.playDash();
      this.triggerScreenShake(3, 0.15);
      this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#06b6d4', 8, 140);
    }

    // --- Input: Shoot Activation ---
    if (this.input.shoot && p.shootCooldown <= 0 && p.energy >= 5) {
      p.isShooting = true;
      p.shootCooldown = 0.22;
      p.energy -= 5;
      soundManager.playShoot();

      // Spawn plasma projectile
      const spawnX = p.facing > 0 ? p.x + p.width + 4 : p.x - 4;
      const spawnY = p.y + 19;
      this.projectiles.push({
        id: Math.random().toString(),
        x: spawnX,
        y: spawnY,
        vx: p.facing * 750,
        vy: 0,
        radius: 5,
        isPlayer: true,
        isEcho: false,
        damage: 18,
        color: '#38bdf8',
        life: 1.2,
        maxLife: 1.2,
      });

      this.spawnParticles(spawnX, spawnY, '#38bdf8', 4, 80);
    }

    // --- Input: Chrono Sabre Slash ---
    if (this.input.slashJustPressed && p.slashCooldown <= 0 && !p.isSlashing) {
      p.isSlashing = true;
      p.slashTimer = 0.22;
      p.slashCooldown = 0.35;
      soundManager.playSlash();
      this.triggerScreenShake(2, 0.1);

      // Check melee slash hit area
      const slashBox = {
        x: p.facing > 0 ? p.x + p.width : p.x - 48,
        y: p.y - 6,
        width: 48,
        height: p.height + 12,
      };

      for (const enemy of this.level.enemies) {
        if (enemy.hp > 0 && checkAABB(slashBox, enemy)) {
          this.damageEnemy(enemy, 45, p.facing);
          this.triggerScreenShake(5, 0.18);
        }
      }

      // Sabre also destroys hostile projectiles in path
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const pr = this.projectiles[i];
        if (!pr.isPlayer && !pr.isEcho && pointInRect(pr.x, pr.y, slashBox)) {
          this.spawnParticles(pr.x, pr.y, '#38bdf8', 6, 120);
          this.projectiles.splice(i, 1);
        }
      }
    }

    // --- Horizontal Movement Physics (if not dashing) ---
    if (!p.isDashing) {
      let moveDir = 0;
      if (this.input.left) moveDir -= 1;
      if (this.input.right) moveDir += 1;

      if (moveDir !== 0) {
        p.facing = moveDir as 1 | -1;
        const accel = p.grounded ? ACCELERATION : AIR_ACCEL;
        p.vx += moveDir * accel * dt;
        p.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, p.vx));
      } else {
        const fric = p.grounded ? FRICTION : AIR_DRAG;
        if (p.vx > 0) {
          p.vx = Math.max(0, p.vx - fric * dt);
        } else if (p.vx < 0) {
          p.vx = Math.min(0, p.vx + fric * dt);
        }
      }

      // Gravity
      p.vy += GRAVITY * dt;
      if (p.vy > MAX_FALL_SPEED) {
        p.vy = MAX_FALL_SPEED;
      }
    }

    // --- Jump & Double Jump with Coyote Time & Jump Buffering ---
    if (p.grounded) {
      p.coyoteTimer = COYOTE_TIME;
      p.canDoubleJump = true;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    if (this.input.jumpJustPressed) {
      p.jumpBufferTimer = JUMP_BUFFER_TIME;
    } else {
      p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
    }

    // Execute Jump
    if (p.jumpBufferTimer > 0) {
      if (p.coyoteTimer > 0) {
        // Normal Jump
        p.vy = JUMP_IMPULSE;
        p.grounded = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        soundManager.playJump(false);
        this.spawnParticles(p.x + p.width / 2, p.y + p.height, '#94a3b8', 6, 60);
      } else if (p.canDoubleJump && p.energy >= 10) {
        // Double Jump (Jetpack burst)
        p.vy = DOUBLE_JUMP_IMPULSE;
        p.canDoubleJump = false;
        p.jumpBufferTimer = 0;
        p.energy -= 10;
        soundManager.playJump(true);
        this.spawnParticles(p.x + p.width / 2, p.y + p.height, '#06b6d4', 8, 100);
      }
    }

    // Variable jump height: cut velocity if jump button released early while ascending
    if (!this.input.jump && p.vy < -180) {
      p.vy *= 0.6;
    }

    // Move & Collide with platforms, doors, and bridges
    moveAndCollide(p, dt, this.level.platforms, this.level.doors, this.level.lightBridges);

    // Hazard check (Acid trench)
    for (const plat of this.level.platforms) {
      if (plat.type === 'hazard' && checkAABB(p, plat)) {
        this.damagePlayer(40, 'RESÍDUO ÁCIDO');
        // Bounce player back up
        p.vy = -380;
      }
    }

    // Determine current action state
    if (p.isDashing) {
      p.currentAction = 'dash';
    } else if (p.isSlashing) {
      p.currentAction = 'attack';
    } else if (p.isShooting) {
      p.currentAction = 'shoot';
    } else if (!p.grounded) {
      p.currentAction = p.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(p.vx) > 15) {
      p.currentAction = 'run';
    } else {
      p.currentAction = 'idle';
    }
  }

  // --- Echo Temporal System ---
  private updateEchoSystem(dt: number) {
    if (this.echoCooldownTimer > 0) {
      this.echoCooldownTimer -= dt;
    }

    // 1. Handle Triggering Echo
    if (this.input.echoJustPressed && this.objectives.hasEchoDevice) {
      if (this.echoState === 'IDLE') {
        // Start Recording
        this.echoState = 'RECORDING';
        this.recordTimer = 0;
        this.recordingBuffer = [];
        soundManager.playEchoRecordStart();
        this.addFloatingText('GRAVANDO ECO...', this.player.x, this.player.y - 20, '#a855f7');
      } else if (this.echoState === 'RECORDING') {
        // Prematurely end recording and invoke clone immediately!
        this.spawnEchoCloneFromBuffer();
      }
    }

    // 2. While Recording: Store Frame Snapshots
    if (this.echoState === 'RECORDING') {
      this.recordTimer += dt;
      this.recordingBuffer.push({
        timestamp: this.recordTimer,
        x: this.player.x,
        y: this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
        facing: this.player.facing,
        state: this.player.currentAction,
        isAttacking: this.player.isSlashing,
        isShooting: this.player.isShooting,
        isDashing: this.player.isDashing,
      });

      if (this.recordTimer >= this.maxRecordTime) {
        this.spawnEchoCloneFromBuffer();
      }
    }

    // 3. While Echo Clone is Active: Re-enact frames
    if (this.echoClone.active) {
      const ec = this.echoClone;
      ec.lifeTimer += dt;

      if (ec.frameIndex < ec.recordedFrames.length) {
        const frame = ec.recordedFrames[ec.frameIndex];
        ec.x = frame.x;
        ec.y = frame.y;
        ec.vx = frame.vx;
        ec.vy = frame.vy;
        ec.facing = frame.facing;
        ec.currentAction = frame.state;
        ec.isAttacking = frame.isAttacking;
        ec.isShooting = frame.isShooting;

        // If recorded frame was shooting on this frame edge
        if (frame.isShooting && ec.frameIndex % 8 === 0) {
          const spawnX = ec.facing > 0 ? ec.x + ec.width + 4 : ec.x - 4;
          const spawnY = ec.y + 19;
          this.projectiles.push({
            id: Math.random().toString(),
            x: spawnX,
            y: spawnY,
            vx: ec.facing * 750,
            vy: 0,
            radius: 5,
            isPlayer: false,
            isEcho: true,
            damage: 16,
            color: '#a855f7',
            life: 1.2,
            maxLife: 1.2,
          });
          soundManager.playShoot();
        }

        // If recorded frame was slashing
        if (frame.isAttacking && ec.frameIndex % 6 === 0) {
          const slashBox = {
            x: ec.facing > 0 ? ec.x + ec.width : ec.x - 48,
            y: ec.y - 6,
            width: 48,
            height: ec.height + 12,
          };
          for (const enemy of this.level.enemies) {
            if (enemy.hp > 0 && checkAABB(slashBox, enemy)) {
              this.damageEnemy(enemy, 35, ec.facing);
            }
          }
        }

        ec.frameIndex++;
      } else {
        // Loop or dissolve
        this.dissolveEchoClone();
      }

      if (ec.lifeTimer >= ec.maxLife) {
        this.dissolveEchoClone();
      }
    }
  }

  private spawnEchoCloneFromBuffer() {
    if (this.recordingBuffer.length === 0) {
      this.echoState = 'IDLE';
      return;
    }

    this.echoClone.active = true;
    this.echoClone.recordedFrames = [...this.recordingBuffer];
    this.echoClone.frameIndex = 0;
    this.echoClone.lifeTimer = 0;
    this.echoClone.maxLife = this.recordTimer;
    this.echoClone.x = this.recordingBuffer[0].x;
    this.echoClone.y = this.recordingBuffer[0].y;
    this.echoClone.facing = this.recordingBuffer[0].facing;

    this.echoState = 'ACTIVE';
    soundManager.playEchoSpawn();
    this.triggerScreenShake(3, 0.15);
    this.addFloatingText('ECO TEMPORAL PROJETADO!', this.echoClone.x, this.echoClone.y - 20, '#06b6d4');
    this.spawnParticles(this.echoClone.x + 14, this.echoClone.y + 24, '#c084fc', 16, 160);
  }

  private dissolveEchoClone() {
    if (this.echoClone.active) {
      this.spawnParticles(this.echoClone.x + 14, this.echoClone.y + 24, '#06b6d4', 12, 100);
      this.echoClone.active = false;
      this.echoState = 'IDLE';
      this.echoCooldownTimer = 1.0;
    }
  }

  // --- Level Mechanisms: Plates, Doors, Bridges, Lasers, Terminals, Pickups ---
  private updateLevelMechanisms(dt: number) {
    // 1. Pressure Plates (Checked against BOTH Player AND Echo Clone!)
    for (const plate of this.level.pressurePlates) {
      let isSteppedOn = false;

      // Check player
      const playerFeet = {
        x: this.player.x + 4,
        y: this.player.y + this.player.height - 4,
        width: this.player.width - 8,
        height: 6,
      };
      if (checkAABB(playerFeet, plate)) {
        isSteppedOn = true;
      }

      // Check Echo Clone
      if (this.echoClone.active) {
        const echoFeet = {
          x: this.echoClone.x + 4,
          y: this.echoClone.y + this.echoClone.height - 4,
          width: this.echoClone.width - 8,
          height: 6,
        };
        if (checkAABB(echoFeet, plate)) {
          isSteppedOn = true;
        }
      }

      if (isSteppedOn !== plate.isPressed) {
        plate.isPressed = isSteppedOn;
        if (isSteppedOn) {
          soundManager.playClick();
          this.addFloatingText('MECANISMO ATIVADO', plate.x, plate.y - 14, '#10b981');
        }
      }

      // Link to blast door
      const targetDoor = this.level.doors.find((d) => d.id === plate.targetDoorId);
      if (targetDoor) {
        targetDoor.isOpen = plate.isPressed;
        if (targetDoor.isOpen && !this.objectives.openedPressureDoor) {
          this.objectives.openedPressureDoor = true;
        }
      }
    }

    // 2. Blast Doors animation
    for (const door of this.level.doors) {
      if (door.isOpen) {
        if (door.openProgress < 1.0) {
          door.openProgress = Math.min(1.0, door.openProgress + 2.5 * dt);
          if (door.openProgress >= 0.98) {
            door.isLocked = false;
          }
        }
      } else {
        if (door.openProgress > 0) {
          door.openProgress = Math.max(0, door.openProgress - 2.5 * dt);
          if (door.openProgress <= 0.05) {
            door.isLocked = true;
          }
        }
      }
    }

    // 3. Security Lasers
    for (const laser of this.level.lasers) {
      laser.timer += dt;
      if (laser.timer >= laser.interval) {
        laser.timer = 0;
        laser.isActive = !laser.isActive;
      }

      // Check collision with player if active
      if (laser.isActive && checkAABB(this.player, laser)) {
        // Player taking damage unless mid-dash
        if (!this.player.isDashing) {
          this.damagePlayer(laser.damage, 'LASER DE DEFESA');
        }
      }
    }

    // 4. Terminals interaction
    for (const term of this.level.terminals) {
      if (term.isHacked) continue;

      const triggerZone = {
        x: term.x - 20,
        y: term.y - 10,
        width: term.width + 40,
        height: term.height + 20,
      };

      if (checkAABB(this.player, triggerZone) && this.input.interactJustPressed) {
        term.isHacked = true;
        soundManager.playPickup();
        this.triggerScreenShake(3, 0.2);

        if (term.actionType === 'UNLOCK_ECHO') {
          this.objectives.hasEchoDevice = true;
          this.checkpointSpawn = { x: term.x, y: term.y };
          this.addFloatingText('DISPOSITIVO DE ECO RECUPERADO!', term.x - 30, term.y - 30, '#06b6d4');
        } else if (term.actionType === 'ACTIVATE_BRIDGE') {
          const bridge = this.level.lightBridges.find((b) => b.terminalId === term.id);
          if (bridge) {
            bridge.isActive = true;
            soundManager.playDoorOpen();
            this.addFloatingText('PONTE DE FÓTONS ENERGIZADA!', term.x - 20, term.y - 30, '#38bdf8');
          }
        }
      }
    }

    // 5. Collectibles
    for (const col of this.level.collectibles) {
      if (col.collected) continue;

      if (checkAABB(this.player, col)) {
        col.collected = true;
        soundManager.playPickup();

        if (col.type === 'DATA_CORE') {
          this.objectives.dataCoresCollected++;
          this.score += 500;
          this.addFloatingText('+DISCO DE DADOS', col.x, col.y - 15, '#c084fc');
          this.spawnParticles(col.x, col.y, '#8b5cf6', 10, 100);
        } else if (col.type === 'HEALTH') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + col.value);
          this.addFloatingText(`+${col.value} HP`, col.x, col.y - 15, '#10b981');
          this.spawnParticles(col.x, col.y, '#10b981', 8, 80);
        } else if (col.type === 'ENERGY') {
          this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + col.value);
          this.addFloatingText(`+${col.value} ENERGIA`, col.x, col.y - 15, '#06b6d4');
          this.spawnParticles(col.x, col.y, '#06b6d4', 8, 80);
        }
      }
    }

    // 6. Escape Elevator
    const el = this.level.elevator;
    if (this.objectives.bossDefeated) {
      el.isUnlocked = true;
      const elDoor = this.level.doors.find((d) => d.id === 'door_boss_exit');
      if (elDoor) elDoor.isOpen = true;
    }

    if (el.isUnlocked && checkAABB(this.player, el) && this.input.interactJustPressed) {
      this.objectives.reachedElevator = true;
      this.screen = 'VICTORY';
      soundManager.stopMusic();
    }
  }

  // --- Enemies AI ---
  private updateEnemies(dt: number) {
    for (const enemy of this.level.enemies) {
      if (enemy.hp <= 0) continue;

      if (enemy.hitFlashTimer > 0) {
        enemy.hitFlashTimer -= dt;
      }
      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= dt;
      }

      // Determine target (Player or Echo Clone, whichever is closer)
      let targetX = this.player.x;
      let targetY = this.player.y;
      let distToPlayer = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);

      if (this.echoClone.active) {
        const distToEcho = Math.hypot(enemy.x - this.echoClone.x, enemy.y - this.echoClone.y);
        if (distToEcho < distToPlayer) {
          targetX = this.echoClone.x;
          targetY = this.echoClone.y;
          distToPlayer = distToEcho;
        }
      }

      // --- Behavior: Sentinel Drone ---
      if (enemy.type === 'DRONE') {
        // Patrol horizontally
        enemy.x += enemy.vx * dt;
        if (enemy.x <= enemy.patrolMinX || enemy.x >= enemy.patrolMaxX) {
          enemy.vx *= -1;
          enemy.facing = enemy.vx > 0 ? 1 : -1;
        }

        // If target in visual range (< 320px)
        if (distToPlayer < 320) {
          enemy.facing = targetX > enemy.x ? 1 : -1;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 2.0;
            // Fire plasma orb towards target
            const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
            this.projectiles.push({
              id: Math.random().toString(),
              x: enemy.x + (enemy.facing > 0 ? enemy.width : 0),
              y: enemy.y + enemy.height / 2,
              vx: Math.cos(angle) * 320,
              vy: Math.sin(angle) * 320,
              radius: 5,
              isPlayer: false,
              isEcho: false,
              damage: 16,
              color: '#ef4444',
              life: 2.0,
              maxLife: 2.0,
            });
            soundManager.playShoot();
          }
        }
      }

      // --- Behavior: Corrupted Android ---
      else if (enemy.type === 'ANDROID') {
        // Walk patrol
        enemy.x += enemy.vx * dt;
        if (enemy.x <= enemy.patrolMinX || enemy.x >= enemy.patrolMaxX) {
          enemy.vx *= -1;
          enemy.facing = enemy.vx > 0 ? 1 : -1;
        }

        // If player close (< 140px), lunge to attack
        if (distToPlayer < 140) {
          enemy.facing = targetX > enemy.x ? 1 : -1;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 1.2;
            // Melee cleave
            const cleaveRect = {
              x: enemy.facing > 0 ? enemy.x + enemy.width : enemy.x - 30,
              y: enemy.y,
              width: 30,
              height: enemy.height,
            };
            if (checkAABB(this.player, cleaveRect)) {
              this.damagePlayer(24, 'CORTE ANDROIDE');
            }
          }
        }
      }

      // --- Behavior: Security Turret ---
      else if (enemy.type === 'TURRET') {
        enemy.facing = targetX > enemy.x ? 1 : -1;
        if (distToPlayer < 400 && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1.8;
          const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
          this.projectiles.push({
            id: Math.random().toString(),
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            vx: Math.cos(angle) * 420,
            vy: Math.sin(angle) * 420,
            radius: 4,
            isPlayer: false,
            isEcho: false,
            damage: 20,
            color: '#ef4444',
            life: 2.0,
            maxLife: 2.0,
          });
          soundManager.playShoot();
        }
      }

      // --- Behavior: BOSS GUARDIAN MK-IV ---
      else if (enemy.type === 'BOSS_GUARDIAN') {
        enemy.facing = targetX > enemy.x ? 1 : -1;

        // Slow heavy boss patrol / reposition
        enemy.x += enemy.vx * dt;
        if (enemy.x <= enemy.patrolMinX || enemy.x >= enemy.patrolMaxX) {
          enemy.vx *= -1;
        }

        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.hp < 180 ? 1.4 : 2.0;

          // Attack pattern 1: Quad burst
          for (let b = -1; b <= 2; b++) {
            const spreadAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x) + b * 0.12;
            this.projectiles.push({
              id: Math.random().toString(),
              x: enemy.x + (enemy.facing > 0 ? enemy.width : 0),
              y: enemy.y + enemy.height * 0.4,
              vx: Math.cos(spreadAngle) * 360,
              vy: Math.sin(spreadAngle) * 360,
              radius: 6,
              isPlayer: false,
              isEcho: false,
              damage: 22,
              color: '#ef4444',
              life: 2.5,
              maxLife: 2.5,
            });
          }
          soundManager.playShoot();
          this.triggerScreenShake(3, 0.2);
        }
      }
    }
  }

  // --- Projectiles Update ---
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Check collision with solid platforms
      let hitSolid = false;
      for (const plat of this.level.platforms) {
        if (plat.type === 'solid' && pointInRect(p.x, p.y, plat)) {
          hitSolid = true;
          break;
        }
      }
      for (const door of this.level.doors) {
        if (door.openProgress < 0.85 && pointInRect(p.x, p.y, door)) {
          hitSolid = true;
          break;
        }
      }

      if (hitSolid || p.life <= 0) {
        this.spawnParticles(p.x, p.y, p.color, 4, 60);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Player / Echo Projectiles hitting enemies
      if (p.isPlayer || p.isEcho) {
        for (const enemy of this.level.enemies) {
          if (enemy.hp > 0 && pointInRect(p.x, p.y, enemy)) {
            this.damageEnemy(enemy, p.damage, p.vx > 0 ? 1 : -1);
            this.spawnParticles(p.x, p.y, p.color, 6, 80);
            this.projectiles.splice(i, 1);
            break;
          }
        }
      } else {
        // Enemy Projectile hitting Player
        if (pointInRect(p.x, p.y, this.player)) {
          if (!this.player.isDashing) {
            this.damagePlayer(p.damage, 'PROJÉTIL DE PLASMA');
            this.spawnParticles(p.x, p.y, '#ef4444', 6, 90);
            this.projectiles.splice(i, 1);
          }
        }
      }
    }
  }

  // --- Damage Handlers ---
  public damageEnemy(enemy: Enemy, damage: number, dir: number) {
    // Shield mechanics for Boss
    if (enemy.shieldActive && (enemy.shieldHp ?? 0) > 0) {
      // If hit from behind (opposite of facing), penetrate shield!
      const hitFromBehind = (dir > 0 && enemy.facing > 0) || (dir < 0 && enemy.facing < 0);
      if (hitFromBehind) {
        damage = Math.round(damage * 1.5);
        this.addFloatingText(`REATOR CRÍTICO! ${damage}`, enemy.x, enemy.y - 15, '#f59e0b');
      } else {
        enemy.shieldHp = Math.max(0, (enemy.shieldHp ?? 0) - damage);
        if (enemy.shieldHp <= 0) {
          enemy.shieldActive = false;
          this.addFloatingText('ESCUDO DESATIVADO!', enemy.x, enemy.y - 20, '#06b6d4');
        }
      }
    }

    enemy.hp -= damage;
    enemy.hitFlashTimer = 0.12;
    soundManager.playHit();
    this.addFloatingText(`-${damage}`, enemy.x + Math.random() * 10, enemy.y - 10, '#f87171');
    this.spawnParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#f87171', 6, 100);

    if (enemy.hp <= 0) {
      soundManager.playExplosion();
      this.triggerScreenShake(8, 0.35);
      this.enemiesDefeated++;
      this.score += enemy.type === 'BOSS_GUARDIAN' ? 3000 : 300;
      this.spawnParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#f97316', 22, 180);

      if (enemy.type === 'BOSS_GUARDIAN') {
        this.objectives.bossDefeated = true;
        this.addFloatingText('GUARDIÃO NEUTRALIZADO! ECLUSA ABERTA', enemy.x, enemy.y - 30, '#10b981');
      }
    }
  }

  public damagePlayer(damage: number, source: string) {
    if (this.player.invulnerableTimer > 0) return;

    this.player.hp = Math.max(0, this.player.hp - damage);
    this.player.invulnerableTimer = 0.9;
    soundManager.playHit();
    this.triggerScreenShake(8, 0.25);
    this.addFloatingText(`-${damage} HP [${source}]`, this.player.x, this.player.y - 20, '#ef4444');
    this.spawnParticles(this.player.x + 14, this.player.y + 24, '#ef4444', 8, 110);

    if (this.player.hp <= 0) {
      soundManager.playExplosion();
      this.screen = 'GAMEOVER';
      soundManager.stopMusic();
    }
  }

  // --- Particles & Text Update ---
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      pt.alpha = pt.life / pt.maxLife;

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const txt = this.floatingTexts[i];
      txt.y += txt.vy * dt;
      txt.life -= dt;
      txt.alpha = Math.max(0, txt.life);

      if (txt.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- Camera Update ---
  private updateCamera(dt: number) {
    // Lead target in player facing direction
    const leadX = this.player.facing * 120;
    this.camera.targetX = this.player.x + leadX - this.viewportWidth / 2;
    this.camera.targetY = this.player.y - this.viewportHeight / 2 - 30;

    // Smooth lerp
    this.camera.x += (this.camera.targetX - this.camera.x) * 6 * dt;
    this.camera.y += (this.camera.targetY - this.camera.y) * 6 * dt;

    // Clamp camera within level bounds
    this.camera.x = Math.max(0, Math.min(this.level.width - this.viewportWidth, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.level.height - this.viewportHeight, this.camera.y));
  }
}
