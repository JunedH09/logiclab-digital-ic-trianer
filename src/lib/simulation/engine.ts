import { IC_REGISTRY } from '../ic/registry';
import { resolveNet } from './logic';
import {
  LogicState,
  SimulationSnapshot,
  SocketState,
  TerminalId,
  ValidationIssue,
  Wire,
} from './types';

export interface EngineInput {
  powerOn: boolean;
  inputSwitches: LogicState[];
  clockState: 0 | 1;
  pulserStates: [0 | 1, 0 | 1];
  sockets: SocketState[];
  wires: Wire[];
}

export interface EngineResult {
  snapshot: SimulationSnapshot;
  updatedSockets: SocketState[];
}

const MAX_SETTLE_ITERATIONS = 16;

function buildNets(wires: Wire[]): Map<TerminalId, Set<TerminalId>> {
  const adj = new Map<TerminalId, Set<TerminalId>>();
  for (const w of wires) {
    if (!adj.has(w.from)) adj.set(w.from, new Set());
    if (!adj.has(w.to)) adj.set(w.to, new Set());
    adj.get(w.from)!.add(w.to);
    adj.get(w.to)!.add(w.from);
  }

  const visited = new Set<TerminalId>();
  const netMap = new Map<TerminalId, Set<TerminalId>>();

  for (const node of adj.keys()) {
    if (visited.has(node)) continue;
    const component = new Set<TerminalId>();
    const queue = [node];
    visited.add(node);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      component.add(curr);
      for (const next of adj.get(curr) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    for (const member of component) {
      netMap.set(member, component);
    }
  }
  return netMap;
}

export function runSimulationStep(input: EngineInput): EngineResult {
  const issues: ValidationIssue[] = [];
  const terminalStates: Record<TerminalId, LogicState> = {};

  const updatedSockets: SocketState[] = input.sockets.map((s) => ({
    ...s,
    internalState: { ...s.internalState },
  }));

  if (!input.powerOn) {
    issues.push({
      id: 'power-off',
      severity: 'WARNING',
      code: 'POWER_OFF',
      message: 'Trainer power is OFF. Turn ON the main power switch to energize ICs.',
      terminals: [],
    });
    return {
      snapshot: {
        terminalStates,
        issues,
        outputBits: Array(8).fill(0),
        sevenSegLeft: null,
        sevenSegRight: null,
      },
      updatedSockets,
    };
  }

  const boardDrivers: Record<TerminalId, LogicState> = {};
  for (let i = 0; i < 5; i++) {
    boardDrivers[`VCC:${i}`] = 1;
    boardDrivers[`GND:${i}`] = 0;
  }
  boardDrivers['CLK:0'] = input.clockState;
  boardDrivers['CLK:1'] = input.clockState;
  boardDrivers['PULSE:0:POS'] = input.pulserStates[0];
  boardDrivers['PULSE:0:NEG'] = input.pulserStates[0] === 1 ? 0 : 1;
  boardDrivers['PULSE:1:POS'] = input.pulserStates[1];
  boardDrivers['PULSE:1:NEG'] = input.pulserStates[1] === 1 ? 0 : 1;

  for (let i = 0; i < 8; i++) {
    boardDrivers[`IN:${i}`] = input.inputSwitches[i] ?? 0;
  }

  const netMap = buildNets(input.wires);
  let icDrivers: Record<TerminalId, LogicState> = {};

  // 1. Iterative settling loop
  for (let iter = 0; iter < MAX_SETTLE_ITERATIONS; iter++) {
    const allDrivers: Record<TerminalId, LogicState> = { ...boardDrivers, ...icDrivers };
    const nextTerminalStates: Record<TerminalId, LogicState> = { ...allDrivers };

    const processedNets = new Set<Set<TerminalId>>();
    for (const net of netMap.values()) {
      if (processedNets.has(net)) continue;
      processedNets.add(net);

      const driversInNet: LogicState[] = [];
      for (const term of net) {
        if (allDrivers[term] !== undefined) {
          driversInNet.push(allDrivers[term]);
        }
      }

      const { state } = resolveNet(driversInNet);
      for (const term of net) {
        nextTerminalStates[term] = state;
      }
    }

    const nextIcDrivers: Record<TerminalId, LogicState> = {};
    let changed = false;

    for (const socket of updatedSockets) {
      if (!socket.icId) continue;
      const def = IC_REGISTRY[socket.icId];
      if (!def) continue;

      const vccOk = nextTerminalStates[`IC:${socket.socketIndex}:${def.vccPin}`] === 1;
      const gndOk = nextTerminalStates[`IC:${socket.socketIndex}:${def.gndPin}`] === 0;
      if (!vccOk || !gndOk) continue;

      const pinInputs: Record<number, LogicState> = {};
      for (const p of def.pins) {
        if (p.direction === 'INPUT') {
          const val = nextTerminalStates[`IC:${socket.socketIndex}:${p.pin}`];
          pinInputs[p.pin] = val === undefined || val === 'Z' ? 'X' : val;
        }
      }

      const { outputs, nextState } = def.evaluate(pinInputs, socket.internalState);
      socket.internalState = nextState;

      for (const [pinStr, val] of Object.entries(outputs)) {
        const outTerm = `IC:${socket.socketIndex}:${pinStr}`;
        nextIcDrivers[outTerm] = val;
        if (icDrivers[outTerm] !== val) changed = true;
      }
    }

    Object.assign(terminalStates, nextTerminalStates);
    icDrivers = nextIcDrivers;
    if (!changed && iter > 0) break;
  }

  // 2. Final electrical validation on settled nets & ICs
  const finalDrivers: Record<TerminalId, LogicState> = { ...boardDrivers, ...icDrivers };
  const checkedNets = new Set<Set<TerminalId>>();
  for (const net of netMap.values()) {
    if (checkedNets.has(net)) continue;
    checkedNets.add(net);

    let hasVcc = false;
    let hasGnd = false;
    const driversInNet: LogicState[] = [];

    for (const term of net) {
      if (term.startsWith('VCC:')) hasVcc = true;
      if (term.startsWith('GND:')) hasGnd = true;
      if (finalDrivers[term] !== undefined) driversInNet.push(finalDrivers[term]);
    }

    const { conflict } = resolveNet(driversInNet);
    if (hasVcc && hasGnd) {
      issues.push({
        id: `short-${Array.from(net)[0]}`,
        severity: 'ERROR',
        code: 'SHORT_CIRCUIT',
        message: 'Short circuit detected: +5V is directly connected to GND.',
        terminals: Array.from(net),
      });
    } else if (conflict) {
      issues.push({
        id: `conflict-${Array.from(net)[0]}`,
        severity: 'ERROR',
        code: 'OUTPUT_CONFLICT',
        message: 'Conflicting logic drivers on the same net (HIGH and LOW tied together).',
        terminals: Array.from(net),
      });
    }
  }

  for (const socket of updatedSockets) {
    if (!socket.icId) continue;
    const def = IC_REGISTRY[socket.icId];
    if (!def) continue;

    const vccTerm = `IC:${socket.socketIndex}:${def.vccPin}`;
    const gndTerm = `IC:${socket.socketIndex}:${def.gndPin}`;
    if (terminalStates[vccTerm] !== 1) {
      issues.push({
        id: `vcc-${socket.socketIndex}`,
        severity: 'WARNING',
        code: 'MISSING_VCC',
        message: `IC ${def.id} in Socket ${socket.socketIndex + 1} is missing +5V on Pin ${def.vccPin}.`,
        terminals: [vccTerm],
      });
    }
    if (terminalStates[gndTerm] !== 0) {
      issues.push({
        id: `gnd-${socket.socketIndex}`,
        severity: 'WARNING',
        code: 'MISSING_GND',
        message: `IC ${def.id} in Socket ${socket.socketIndex + 1} is missing GND on Pin ${def.gndPin}.`,
        terminals: [gndTerm],
      });
    }
  }

  // 3. Read 8 output LEDs & compute 7-segment values
  const outputBits: LogicState[] = Array.from({ length: 8 }, (_, i) => {
    const s = terminalStates[`OUT:${i}`];
    return s === undefined || s === 'Z' ? 0 : s;
  });

  const lowNibble = outputBits.slice(0, 4);
  const highNibble = outputBits.slice(4, 8);
  const toDec = (bits: LogicState[]) =>
    bits.every((b) => b === 0 || b === 1)
      ? ((bits[3] as number) << 3) |
        ((bits[2] as number) << 2) |
        ((bits[1] as number) << 1) |
        (bits[0] as number)
      : null;

  return {
    snapshot: {
      terminalStates,
      issues,
      outputBits,
      sevenSegRight: toDec(lowNibble),
      sevenSegLeft: toDec(highNibble),
    },
    updatedSockets,
  };
}