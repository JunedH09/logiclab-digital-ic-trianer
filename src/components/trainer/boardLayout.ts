import { TerminalId } from '@/lib/simulation/types';

export interface Point {
  x: number;
  y: number;
}

export const BOARD_WIDTH = 1200;
export const BOARD_HEIGHT = 760;

export const SOCKET_ORIGINS: { x: number; y: number }[] = [
  { x: 115, y: 110 },
  { x: 470, y: 110 },
  { x: 825, y: 110 },
  { x: 115, y: 285 },
  { x: 470, y: 285 },
  { x: 825, y: 285 },
];

export const PIN_PITCH = 28;

export function getTerminalPosition(id: TerminalId, pinCount: 14 | 16 = 14): Point | null {
  if (id.startsWith('VCC:')) {
    const idx = Number(id.split(':')[1]);
    return { x: 80 + idx * 36, y: 705 };
  }
  if (id.startsWith('GND:')) {
    const idx = Number(id.split(':')[1]);
    return { x: 960 + idx * 36, y: 705 };
  }
  if (id === 'CLK:0') return { x: 185, y: 515 };
  if (id === 'CLK:1') return { x: 185, y: 565 };
  if (id === 'PULSE:0:POS') return { x: 255, y: 505 };
  if (id === 'PULSE:0:NEG') return { x: 255, y: 575 };
  if (id === 'PULSE:1:POS') return { x: 325, y: 505 };
  if (id === 'PULSE:1:NEG') return { x: 325, y: 575 };
  if (id.startsWith('IN:')) {
    const idx = Number(id.split(':')[1]);
    return { x: 410 + idx * 38, y: 505 };
  }
  if (id.startsWith('OUT:')) {
    const idx = Number(id.split(':')[1]);
    return { x: 770 + idx * 38, y: 505 };
  }
  if (id.startsWith('IC:')) {
    const [, sockStr, pinStr] = id.split(':');
    const sockIdx = Number(sockStr);
    const pin = Number(pinStr);
    const origin = SOCKET_ORIGINS[sockIdx];
    if (!origin) return null;
    const half = pinCount / 2;
    if (pin <= half) {
      return { x: origin.x + (pin - 1) * PIN_PITCH + 20, y: origin.y + 84 };
    } else {
      const colFromRight = pin - half - 1;
      return { x: origin.x + (half - 1 - colFromRight) * PIN_PITCH + 20, y: origin.y - 16 };
    }
  }
  return null;
}
