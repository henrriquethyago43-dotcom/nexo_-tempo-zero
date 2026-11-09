import { Player, BlastDoor, LightBridge, PressurePlate, SecurityLaser, Collectible, Terminal, Elevator } from '../types/game';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlatformBlock extends Rect {
  type: 'solid' | 'one-way' | 'hazard';
}

export function checkAABB(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function pointInRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}

// Physics Constants
export const GRAVITY = 1150; // pixels / s^2
export const MAX_FALL_SPEED = 780;
export const MOVE_SPEED = 260;
export const ACCELERATION = 1900;
export const FRICTION = 1700;
export const AIR_ACCEL = 1300;
export const AIR_DRAG = 450;
export const JUMP_IMPULSE = -520;
export const DOUBLE_JUMP_IMPULSE = -480;
export const DASH_SPEED = 650;
export const DASH_DURATION = 0.22;
export const DASH_COOLDOWN = 0.8;
export const COYOTE_TIME = 0.12;
export const JUMP_BUFFER_TIME = 0.15;

/**
 * Resolves movement and collisions for an entity against static platforms, closed doors, and active light bridges.
 */
export function moveAndCollide(
  entity: { x: number; y: number; vx: number; vy: number; width: number; height: number; grounded: boolean },
  dt: number,
  platforms: PlatformBlock[],
  doors: BlastDoor[],
  lightBridges: LightBridge[]
) {
  // Build active solid obstacles list
  const solids: Rect[] = [];

  for (const plat of platforms) {
    if (plat.type === 'solid') {
      solids.push(plat);
    }
  }

  for (const door of doors) {
    // If not fully open, it is solid
    if (door.openProgress < 0.85) {
      // Calculate current closed barrier height
      const closedHeight = door.height * (1 - door.openProgress);
      solids.push({
        x: door.x,
        y: door.y,
        width: door.width,
        height: closedHeight,
      });
    }
  }

  for (const bridge of lightBridges) {
    if (bridge.isActive) {
      solids.push({
        x: bridge.x,
        y: bridge.y,
        width: bridge.width,
        height: bridge.height,
      });
    }
  }

  // --- Horizontal Step ---
  entity.x += entity.vx * dt;
  const entityRectX: Rect = {
    x: entity.x,
    y: entity.y,
    width: entity.width,
    height: entity.height,
  };

  for (const solid of solids) {
    if (checkAABB(entityRectX, solid)) {
      if (entity.vx > 0) {
        entity.x = solid.x - entity.width;
      } else if (entity.vx < 0) {
        entity.x = solid.x + solid.width;
      }
      entity.vx = 0;
      break;
    }
  }

  // --- Vertical Step ---
  entity.grounded = false;
  entity.y += entity.vy * dt;
  const entityRectY: Rect = {
    x: entity.x,
    y: entity.y,
    width: entity.width,
    height: entity.height,
  };

  for (const solid of solids) {
    if (checkAABB(entityRectY, solid)) {
      if (entity.vy > 0) {
        entity.y = solid.y - entity.height;
        entity.vy = 0;
        entity.grounded = true;
      } else if (entity.vy < 0) {
        entity.y = solid.y + solid.height;
        entity.vy = 0;
      }
      break;
    }
  }

  // Also check one-way platforms (only when falling through top)
  for (const plat of platforms) {
    if (plat.type === 'one-way' && entity.vy >= 0) {
      const prevBottom = entity.y + entity.height - entity.vy * dt;
      if (prevBottom <= plat.y + 4 && entity.y + entity.height >= plat.y) {
        if (entity.x + entity.width > plat.x && entity.x < plat.x + plat.width) {
          entity.y = plat.y - entity.height;
          entity.vy = 0;
          entity.grounded = true;
        }
      }
    }
  }
}
