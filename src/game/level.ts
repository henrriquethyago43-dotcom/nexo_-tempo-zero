import { BlastDoor, Collectible, Elevator, Enemy, LightBridge, PressurePlate, SecurityLaser, Terminal } from '../types/game';
import { PlatformBlock } from './physics';

export interface LevelData {
  width: number;
  height: number;
  spawnPoint: { x: number; y: number };
  platforms: PlatformBlock[];
  doors: BlastDoor[];
  pressurePlates: PressurePlate[];
  lightBridges: LightBridge[];
  lasers: SecurityLaser[];
  terminals: Terminal[];
  collectibles: Collectible[];
  enemies: Enemy[];
  elevator: Elevator;
  decorations: Array<{
    type: 'cryo_tube' | 'holo_sign' | 'dangling_wires' | 'server_rack' | 'warning_stripe';
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    text?: string;
  }>;
}

export function createMissionSectorZero(): LevelData {
  // Map dimensions: 4400px wide x 1200px tall
  const width = 4500;
  const height = 1200;

  const platforms: PlatformBlock[] = [
    // --- Sector 1: Cryo Awakening Chamber ---
    // Floor
    { x: 0, y: 700, width: 850, height: 200, type: 'solid' },
    // Left boundary wall
    { x: -50, y: 200, width: 70, height: 600, type: 'solid' },
    // Ceiling
    { x: 0, y: 150, width: 4500, height: 60, type: 'solid' },
    // Lower steps & tutorial ledges
    { x: 300, y: 580, width: 140, height: 24, type: 'one-way' },
    { x: 500, y: 480, width: 160, height: 24, type: 'one-way' },
    { x: 720, y: 400, width: 130, height: 24, type: 'one-way' },

    // Separation wall between Sector 1 and Sector 2
    { x: 850, y: 200, width: 40, height: 350, type: 'solid' },
    // Floor continues under door
    { x: 850, y: 700, width: 1050, height: 200, type: 'solid' },

    // --- Sector 2: Quantum Echo Chamber (Echo Puzzle) ---
    // Elevated pressure plate platform
    { x: 1050, y: 550, width: 220, height: 24, type: 'solid' },
    { x: 960, y: 620, width: 100, height: 20, type: 'one-way' },
    
    // Separation wall between Sector 2 and Sector 3 with Blast Door 1
    { x: 1480, y: 200, width: 40, height: 360, type: 'solid' },
    // Platform after Blast Door 1
    { x: 1520, y: 700, width: 380, height: 200, type: 'solid' },

    // Upper route in Sector 2
    { x: 1250, y: 410, width: 180, height: 20, type: 'one-way' },

    // --- Sector 3: Laser Corridor & Acid Trench ---
    // Drop down trench
    { x: 1900, y: 920, width: 800, height: 40, type: 'hazard' }, // Acid pit at bottom!
    // Wall before trench
    { x: 1900, y: 700, width: 50, height: 220, type: 'solid' },
    // Floating stepping platforms over acid
    { x: 2050, y: 680, width: 110, height: 20, type: 'solid' },
    { x: 2280, y: 620, width: 120, height: 20, type: 'solid' },
    { x: 2520, y: 570, width: 130, height: 20, type: 'solid' },
    // Landing platform
    { x: 2700, y: 650, width: 500, height: 250, type: 'solid' },

    // Middle laser gauntlet platforms
    { x: 2850, y: 520, width: 180, height: 20, type: 'one-way' },
    { x: 3080, y: 440, width: 120, height: 20, type: 'one-way' },

    // Wall leading to Boss Chamber
    { x: 3200, y: 200, width: 40, height: 320, type: 'solid' },

    // --- Sector 4: Main Containment Core (Boss Arena) ---
    // Massive flat floor with raised balconies
    { x: 3240, y: 750, width: 1260, height: 200, type: 'solid' },
    // Left balcony
    { x: 3340, y: 590, width: 160, height: 20, type: 'one-way' },
    // Right balcony
    { x: 4000, y: 590, width: 160, height: 20, type: 'one-way' },
    // Central high vantage
    { x: 3650, y: 480, width: 200, height: 20, type: 'one-way' },

    // Right boundary wall behind elevator
    { x: 4450, y: 200, width: 60, height: 750, type: 'solid' },
  ];

  // Doors
  const doors: BlastDoor[] = [
    // Door 1: Unlocked by pressure plate in Sector 2 (requires Echo or weight)
    {
      id: 'door_sector_2',
      x: 1480,
      y: 560,
      width: 40,
      height: 140,
      isOpen: false,
      openProgress: 0,
      requiredPlateIds: ['plate_echo_puzzle'],
      isLocked: true,
      label: 'PORTA 01 - CONTENÇÃO QUÂNTICA',
    },
    // Door 2: Guarded by Boss in Sector 4
    {
      id: 'door_boss_exit',
      x: 4220,
      y: 590,
      width: 40,
      height: 160,
      isOpen: false,
      openProgress: 0,
      requiredPlateIds: [],
      isLocked: true,
      label: 'ECLUSA DE EVACUAÇÃO',
    },
  ];

  // Pressure Plates
  const pressurePlates: PressurePlate[] = [
    {
      id: 'plate_echo_puzzle',
      x: 1140,
      y: 540,
      width: 60,
      height: 12,
      isPressed: false,
      targetDoorId: 'door_sector_2',
    },
  ];

  // Light Bridges
  const lightBridges: LightBridge[] = [
    {
      id: 'bridge_acid_abyss',
      x: 2000,
      y: 780,
      width: 680,
      height: 16,
      isActive: false,
      terminalId: 'terminal_bridge',
    },
  ];

  // Lasers
  const lasers: SecurityLaser[] = [
    // Vertical laser barrier near puzzle
    {
      id: 'laser_1',
      x: 1380,
      y: 560,
      width: 12,
      height: 140,
      vertical: true,
      isActive: true,
      interval: 3.2,
      timer: 0,
      damage: 20,
    },
    // Laser gauntlet in Sector 3
    {
      id: 'laser_2',
      x: 2400,
      y: 400,
      width: 12,
      height: 220,
      vertical: true,
      isActive: true,
      interval: 2.5,
      timer: 1.2,
      damage: 25,
    },
    {
      id: 'laser_3',
      x: 2950,
      y: 540,
      width: 14,
      height: 110,
      vertical: true,
      isActive: true,
      interval: 2.0,
      timer: 0.5,
      damage: 25,
    },
  ];

  // Terminals
  const terminals: Terminal[] = [
    // Terminal 1: Unlocks Echo Device
    {
      id: 'terminal_echo_device',
      x: 680,
      y: 640,
      width: 44,
      height: 60,
      isHacked: false,
      title: 'TERMINAL DE SINCRONIA QUÂNTICA',
      description: 'Módulo de Eco Temporal recuperado. Pressione o botão ECO para gravar seus passos e invocar um clone quântico.',
      actionType: 'UNLOCK_ECHO',
    },
    // Terminal 2: Activates Light Bridge over acid
    {
      id: 'terminal_bridge',
      x: 1850,
      y: 640,
      width: 44,
      height: 60,
      isHacked: false,
      title: 'GERADOR DE PONTE DE FÓTONS',
      description: 'Ponte de partículas energizada. Cruzamento seguro sobre o fosso de resíduos habilitado.',
      actionType: 'ACTIVATE_BRIDGE',
    },
  ];

  // Collectibles
  const collectibles: Collectible[] = [
    {
      id: 'core_1',
      type: 'DATA_CORE',
      x: 450,
      y: 440,
      width: 28,
      height: 28,
      collected: false,
      value: 100,
      name: 'Disco de Dados 01: Relatório de Anomalia Temporal',
    },
    {
      id: 'medkit_1',
      type: 'HEALTH',
      x: 750,
      y: 360,
      width: 24,
      height: 24,
      collected: false,
      value: 35,
      name: 'Pacote de Nanites Médicos (+35 HP)',
    },
    {
      id: 'energy_1',
      type: 'ENERGY',
      x: 1300,
      y: 370,
      width: 24,
      height: 24,
      collected: false,
      value: 50,
      name: 'Célula de Energia Quântica (+50 EN)',
    },
    {
      id: 'core_2',
      type: 'DATA_CORE',
      x: 2320,
      y: 570,
      width: 28,
      height: 28,
      collected: false,
      value: 100,
      name: 'Disco de Dados 02: Projeto NEXO e Clones Fásicos',
    },
    {
      id: 'medkit_2',
      type: 'HEALTH',
      x: 2600,
      y: 530,
      width: 24,
      height: 24,
      collected: false,
      value: 40,
      name: 'Pacote de Nanites Médicos (+40 HP)',
    },
    {
      id: 'energy_2',
      type: 'ENERGY',
      x: 3000,
      y: 480,
      width: 24,
      height: 24,
      collected: false,
      value: 50,
      name: 'Célula de Energia Quântica (+50 EN)',
    },
    {
      id: 'core_3',
      type: 'DATA_CORE',
      x: 3400,
      y: 540,
      width: 28,
      height: 28,
      collected: false,
      value: 100,
      name: 'Disco de Dados 03: Protocolo de Sobrecarga do Guardião',
    },
  ];

  // Enemies
  const enemies: Enemy[] = [
    // Sentinel Drone 1 (Sector 1)
    {
      id: 'drone_1',
      type: 'DRONE',
      x: 480,
      y: 490,
      vx: 40,
      vy: 0,
      width: 32,
      height: 32,
      hp: 30,
      maxHp: 30,
      facing: -1,
      grounded: false,
      patrolMinX: 340,
      patrolMaxX: 680,
      attackCooldown: 1.5,
      state: 'patrol',
      hitFlashTimer: 0,
    },
    // Corrupted Android 1 (Sector 2 - patrolling lower corridor)
    {
      id: 'android_1',
      type: 'ANDROID',
      x: 1100,
      y: 648,
      vx: -50,
      vy: 0,
      width: 36,
      height: 52,
      hp: 60,
      maxHp: 60,
      facing: -1,
      grounded: true,
      patrolMinX: 950,
      patrolMaxX: 1350,
      attackCooldown: 1.2,
      state: 'patrol',
      hitFlashTimer: 0,
    },
    // Security Turret (Sector 2 - watching plate area)
    {
      id: 'turret_1',
      type: 'TURRET',
      x: 1420,
      y: 380,
      vx: 0,
      vy: 0,
      width: 34,
      height: 30,
      hp: 45,
      maxHp: 45,
      facing: -1,
      grounded: false,
      patrolMinX: 1420,
      patrolMaxX: 1420,
      attackCooldown: 2.0,
      state: 'patrol',
      hitFlashTimer: 0,
    },
    // Sentinel Drone 2 (Sector 3 over acid gap)
    {
      id: 'drone_2',
      type: 'DRONE',
      x: 2150,
      y: 600,
      vx: 60,
      vy: 0,
      width: 32,
      height: 32,
      hp: 35,
      maxHp: 35,
      facing: 1,
      grounded: false,
      patrolMinX: 2000,
      patrolMaxX: 2350,
      attackCooldown: 1.8,
      state: 'patrol',
      hitFlashTimer: 0,
    },
    // Corrupted Android 2 (Sector 3 - landing platform)
    {
      id: 'android_2',
      type: 'ANDROID',
      x: 2800,
      y: 598,
      vx: 60,
      vy: 0,
      width: 36,
      height: 52,
      hp: 75,
      maxHp: 75,
      facing: 1,
      grounded: true,
      patrolMinX: 2720,
      patrolMaxX: 3050,
      attackCooldown: 1.0,
      state: 'patrol',
      hitFlashTimer: 0,
    },
    // BOSS GUARDIAN MK-IV in Sector 4
    {
      id: 'boss_guardian_mk4',
      type: 'BOSS_GUARDIAN',
      x: 3750,
      y: 670,
      vx: 30,
      vy: 0,
      width: 68,
      height: 80,
      hp: 350,
      maxHp: 350,
      facing: -1,
      grounded: true,
      patrolMinX: 3450,
      patrolMaxX: 4100,
      attackCooldown: 1.4,
      state: 'patrol',
      hitFlashTimer: 0,
      shieldActive: true,
      shieldHp: 100,
      phase: 1,
    },
  ];

  // Escape Elevator
  const elevator: Elevator = {
    x: 4320,
    y: 650,
    width: 60,
    height: 100,
    isUnlocked: false,
    activated: false,
  };

  // Aesthetic decorations for abandoned futuristic laboratory
  const decorations = [
    // Broken Cryo Tubes in awakening room
    { type: 'cryo_tube' as const, x: 80, y: 580, width: 60, height: 120, color: '#06b6d4' },
    { type: 'cryo_tube' as const, x: 180, y: 580, width: 60, height: 120, color: '#ef4444' }, // cracked/red
    // Holo Signs
    { type: 'holo_sign' as const, x: 300, y: 350, width: 140, height: 40, text: 'SETOR 00: CRIOGENIA' },
    { type: 'holo_sign' as const, x: 1050, y: 320, width: 180, height: 40, text: 'LAB QUÂNTICO - ACESSO RESTRITO' },
    { type: 'holo_sign' as const, x: 2000, y: 500, width: 160, height: 40, text: 'FOSSO DE RESÍDUOS TÉRMICOS' },
    { type: 'holo_sign' as const, x: 3500, y: 340, width: 220, height: 44, text: 'CÂMARA DO REATOR PRINCIPAL' },
    // Dangling Cables / Servers
    { type: 'dangling_wires' as const, x: 420, y: 210, width: 30, height: 90 },
    { type: 'dangling_wires' as const, x: 1200, y: 210, width: 40, height: 110 },
    { type: 'dangling_wires' as const, x: 2600, y: 210, width: 30, height: 120 },
    { type: 'dangling_wires' as const, x: 3800, y: 210, width: 50, height: 130 },
    { type: 'server_rack' as const, x: 890, y: 620, width: 45, height: 80 },
    { type: 'server_rack' as const, x: 1780, y: 620, width: 50, height: 80 },
  ];

  return {
    width,
    height,
    spawnPoint: { x: 120, y: 640 },
    platforms,
    doors,
    pressurePlates,
    lightBridges,
    lasers,
    terminals,
    collectibles,
    enemies,
    elevator,
    decorations,
  };
}
