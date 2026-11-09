export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export type EchoState = 'IDLE' | 'RECORDING' | 'ACTIVE' | 'COOLDOWN';

export interface RecordedFrame {
  timestamp: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  state: 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'attack' | 'shoot';
  isAttacking: boolean;
  isShooting: boolean;
  isDashing: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  grounded: boolean;
  canDoubleJump: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  
  // Health & Energy
  maxHp: number;
  hp: number;
  maxEnergy: number;
  energy: number;
  invulnerableTimer: number;

  // Actions
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  
  isShooting: boolean;
  shootCooldown: number;
  
  isSlashing: boolean;
  slashTimer: number;
  slashCooldown: number;
  
  // Animation state
  animFrame: number;
  animTimer: number;
  currentAction: 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'attack' | 'shoot';
}

export interface EchoClone {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  currentAction: 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'attack' | 'shoot';
  frameIndex: number;
  recordedFrames: RecordedFrame[];
  lifeTimer: number;
  maxLife: number;
  isAttacking: boolean;
  isShooting: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPlayer: boolean;
  isEcho: boolean;
  damage: number;
  color: string;
  life: number;
  maxLife: number;
}

export type EnemyType = 'DRONE' | 'ANDROID' | 'TURRET' | 'BOSS_GUARDIAN';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  grounded: boolean;
  patrolMinX: number;
  patrolMaxX: number;
  attackCooldown: number;
  state: 'patrol' | 'alert' | 'attack' | 'stunned';
  hitFlashTimer: number;
  shieldActive?: boolean;
  shieldHp?: number;
  phase?: number;
}

export interface PressurePlate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPressed: boolean;
  targetDoorId: string;
}

export interface BlastDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  openProgress: number; // 0 to 1
  requiredPlateIds: string[];
  keyId?: string;
  isLocked: boolean;
  label: string;
}

export interface LightBridge {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  terminalId: string;
}

export interface SecurityLaser {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vertical: boolean;
  isActive: boolean;
  interval: number;
  timer: number;
  damage: number;
}

export interface Terminal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isHacked: boolean;
  title: string;
  description: string;
  actionType: 'UNLOCK_ECHO' | 'ACTIVATE_BRIDGE' | 'DISABLE_LASERS';
}

export interface Collectible {
  id: string;
  type: 'HEALTH' | 'ENERGY' | 'DATA_CORE' | 'ECHO_CHIP';
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  value: number;
  name: string;
}

export interface Elevator {
  x: number;
  y: number;
  width: number;
  height: number;
  isUnlocked: boolean;
  activated: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'line' | 'glitch';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
}

export interface MissionObjectives {
  hasEchoDevice: boolean;
  openedPressureDoor: boolean;
  bossDefeated: boolean;
  reachedElevator: boolean;
  dataCoresCollected: number;
  totalDataCores: number;
}

export interface GameCamera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  shake: number;
  shakeDuration: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  down: boolean;
  up: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  dash: boolean;
  dashJustPressed: boolean;
  shoot: boolean;
  slash: boolean;
  slashJustPressed: boolean;
  echo: boolean;
  echoJustPressed: boolean;
  interact: boolean;
  interactJustPressed: boolean;
}
