import { LogicState } from './types';

export function isDefined(v: LogicState | undefined): v is 0 | 1 {
  return v === 0 || v === 1;
}

export function logicNot(a: LogicState): LogicState {
  if (a === 0) return 1;
  if (a === 1) return 0;
  return 'X';
}

export function logicAnd(...inputs: LogicState[]): LogicState {
  if (inputs.some((v) => v === 0)) return 0;
  if (inputs.every((v) => v === 1)) return 1;
  return 'X';
}

export function logicOr(...inputs: LogicState[]): LogicState {
  if (inputs.some((v) => v === 1)) return 1;
  if (inputs.every((v) => v === 0)) return 0;
  return 'X';
}

export function logicNand(...inputs: LogicState[]): LogicState {
  return logicNot(logicAnd(...inputs));
}

export function logicNor(...inputs: LogicState[]): LogicState {
  return logicNot(logicOr(...inputs));
}

export function logicXor(a: LogicState, b: LogicState): LogicState {
  if (!isDefined(a) || !isDefined(b)) return 'X';
  return a !== b ? 1 : 0;
}

export function logicXnor(a: LogicState, b: LogicState): LogicState {
  return logicNot(logicXor(a, b));
}

export function resolveNet(drivers: LogicState[]): {
  state: LogicState;
  conflict: boolean;
} {
  const active = drivers.filter((d) => d !== 'Z');
  if (active.length === 0) return { state: 'Z', conflict: false };
  if (active.includes('X')) return { state: 'X', conflict: false };

  const has0 = active.includes(0);
  const has1 = active.includes(1);
  if (has0 && has1) {
    return { state: 'X', conflict: true };
  }
  return { state: has1 ? 1 : 0, conflict: false };
}
