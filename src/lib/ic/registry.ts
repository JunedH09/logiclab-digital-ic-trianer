import { ICDefinition, LogicState } from '../simulation/types';
import {
  isDefined,
  logicAnd,
  logicNand,
  logicNor,
  logicNot,
  logicOr,
  logicXor,
} from '../simulation/logic';

const quad2InputPins = (gate: string) => [
  { pin: 1, name: '1A', direction: 'INPUT' as const },
  { pin: 2, name: '1B', direction: 'INPUT' as const },
  { pin: 3, name: '1Y', direction: 'OUTPUT' as const, description: `Gate 1 ${gate} Out` },
  { pin: 4, name: '2A', direction: 'INPUT' as const },
  { pin: 5, name: '2B', direction: 'INPUT' as const },
  { pin: 6, name: '2Y', direction: 'OUTPUT' as const, description: `Gate 2 ${gate} Out` },
  { pin: 7, name: 'GND', direction: 'GND' as const },
  { pin: 8, name: '3Y', direction: 'OUTPUT' as const, description: `Gate 3 ${gate} Out` },
  { pin: 9, name: '3A', direction: 'INPUT' as const },
  { pin: 10, name: '3B', direction: 'INPUT' as const },
  { pin: 11, name: '4Y', direction: 'OUTPUT' as const, description: `Gate 4 ${gate} Out` },
  { pin: 12, name: '4A', direction: 'INPUT' as const },
  { pin: 13, name: '4B', direction: 'INPUT' as const },
  { pin: 14, name: 'VCC', direction: 'VCC' as const },
];

const evalQuadStandard =
  (fn: (a: LogicState, b: LogicState) => LogicState) =>
  (inputs: Record<number, LogicState>, prevState: Record<string, any>) => ({
    outputs: {
      3: fn(inputs[1] ?? 'X', inputs[2] ?? 'X'),
      6: fn(inputs[4] ?? 'X', inputs[5] ?? 'X'),
      8: fn(inputs[9] ?? 'X', inputs[10] ?? 'X'),
      11: fn(inputs[12] ?? 'X', inputs[13] ?? 'X'),
    },
    nextState: prevState,
  });

export const IC_REGISTRY: Record<string, ICDefinition> = {
  '7400': {
    id: '7400',
    name: 'Quad 2-Input NAND Gate',
    category: 'GATE',
    pinCount: 14,
    description: 'Four independent 2-input NAND gates.',
    vccPin: 14,
    gndPin: 7,
    pins: quad2InputPins('NAND'),
    evaluate: evalQuadStandard((a, b) => logicNand(a, b)),
  },
  '7402': {
    id: '7402',
    name: 'Quad 2-Input NOR Gate',
    category: 'GATE',
    pinCount: 14,
    description: 'Four independent 2-input NOR gates (outputs on pins 1, 4, 10, 13).',
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pin: 1, name: '1Y', direction: 'OUTPUT' },
      { pin: 2, name: '1A', direction: 'INPUT' },
      { pin: 3, name: '1B', direction: 'INPUT' },
      { pin: 4, name: '2Y', direction: 'OUTPUT' },
      { pin: 5, name: '2A', direction: 'INPUT' },
      { pin: 6, name: '2B', direction: 'INPUT' },
      { pin: 7, name: 'GND', direction: 'GND' },
      { pin: 8, name: '3A', direction: 'INPUT' },
      { pin: 9, name: '3B', direction: 'INPUT' },
      { pin: 10, name: '3Y', direction: 'OUTPUT' },
      { pin: 11, name: '4A', direction: 'INPUT' },
      { pin: 12, name: '4B', direction: 'INPUT' },
      { pin: 13, name: '4Y', direction: 'OUTPUT' },
      { pin: 14, name: 'VCC', direction: 'VCC' },
    ],
    evaluate: (inputs, prevState) => ({
      outputs: {
        1: logicNor(inputs[2] ?? 'X', inputs[3] ?? 'X'),
        4: logicNor(inputs[5] ?? 'X', inputs[6] ?? 'X'),
        10: logicNor(inputs[8] ?? 'X', inputs[9] ?? 'X'),
        13: logicNor(inputs[11] ?? 'X', inputs[12] ?? 'X'),
      },
      nextState: prevState,
    }),
  },
  '7404': {
    id: '7404',
    name: 'Hex Inverter (NOT Gate)',
    category: 'GATE',
    pinCount: 14,
    description: 'Six independent NOT inverters.',
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pin: 1, name: '1A', direction: 'INPUT' },
      { pin: 2, name: '1Y', direction: 'OUTPUT' },
      { pin: 3, name: '2A', direction: 'INPUT' },
      { pin: 4, name: '2Y', direction: 'OUTPUT' },
      { pin: 5, name: '3A', direction: 'INPUT' },
      { pin: 6, name: '3Y', direction: 'OUTPUT' },
      { pin: 7, name: 'GND', direction: 'GND' },
      { pin: 8, name: '4Y', direction: 'OUTPUT' },
      { pin: 9, name: '4A', direction: 'INPUT' },
      { pin: 10, name: '5Y', direction: 'OUTPUT' },
      { pin: 11, name: '5A', direction: 'INPUT' },
      { pin: 12, name: '6Y', direction: 'OUTPUT' },
      { pin: 13, name: '6A', direction: 'INPUT' },
      { pin: 14, name: 'VCC', direction: 'VCC' },
    ],
    evaluate: (inputs, prevState) => ({
      outputs: {
        2: logicNot(inputs[1] ?? 'X'),
        4: logicNot(inputs[3] ?? 'X'),
        6: logicNot(inputs[5] ?? 'X'),
        8: logicNot(inputs[9] ?? 'X'),
        10: logicNot(inputs[11] ?? 'X'),
        12: logicNot(inputs[13] ?? 'X'),
      },
      nextState: prevState,
    }),
  },
  '7408': {
    id: '7408',
    name: 'Quad 2-Input AND Gate',
    category: 'GATE',
    pinCount: 14,
    description: 'Four independent 2-input AND gates.',
    vccPin: 14,
    gndPin: 7,
    pins: quad2InputPins('AND'),
    evaluate: evalQuadStandard((a, b) => logicAnd(a, b)),
  },
  '7432': {
    id: '7432',
    name: 'Quad 2-Input OR Gate',
    category: 'GATE',
    pinCount: 14,
    description: 'Four independent 2-input OR gates.',
    vccPin: 14,
    gndPin: 7,
    pins: quad2InputPins('OR'),
    evaluate: evalQuadStandard((a, b) => logicOr(a, b)),
  },
  '7486': {
    id: '7486',
    name: 'Quad 2-Input XOR Gate',
    category: 'GATE',
    pinCount: 14,
    description: 'Four independent 2-input Exclusive-OR gates.',
    vccPin: 14,
    gndPin: 7,
    pins: quad2InputPins('XOR'),
    evaluate: evalQuadStandard((a, b) => logicXor(a, b)),
  },
  '7410': {
    id: '7410',
    name: 'Triple 3-Input NAND Gate',
    category: 'GATE',
    pinCount: 14,
    description: 'Three independent 3-input NAND gates.',
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pin: 1, name: '1A', direction: 'INPUT' },
      { pin: 2, name: '1B', direction: 'INPUT' },
      { pin: 3, name: '2A', direction: 'INPUT' },
      { pin: 4, name: '2B', direction: 'INPUT' },
      { pin: 5, name: '2C', direction: 'INPUT' },
      { pin: 6, name: '2Y', direction: 'OUTPUT' },
      { pin: 7, name: 'GND', direction: 'GND' },
      { pin: 8, name: '3Y', direction: 'OUTPUT' },
      { pin: 9, name: '3A', direction: 'INPUT' },
      { pin: 10, name: '3B', direction: 'INPUT' },
      { pin: 11, name: '3C', direction: 'INPUT' },
      { pin: 12, name: '1Y', direction: 'OUTPUT' },
      { pin: 13, name: '1C', direction: 'INPUT' },
      { pin: 14, name: 'VCC', direction: 'VCC' },
    ],
    evaluate: (inputs, prevState) => ({
      outputs: {
        12: logicNand(inputs[1] ?? 'X', inputs[2] ?? 'X', inputs[13] ?? 'X'),
        6: logicNand(inputs[3] ?? 'X', inputs[4] ?? 'X', inputs[5] ?? 'X'),
        8: logicNand(inputs[9] ?? 'X', inputs[10] ?? 'X', inputs[11] ?? 'X'),
      },
      nextState: prevState,
    }),
  },
  '74151': {
    id: '74151',
    name: '8-to-1 Line Data Selector / Multiplexer',
    category: 'MUX',
    pinCount: 16,
    description: '8-input multiplexer with active-low strobe and complementary outputs Y and W.',
    vccPin: 16,
    gndPin: 8,
    pins: [
      { pin: 1, name: 'D3', direction: 'INPUT' },
      { pin: 2, name: 'D2', direction: 'INPUT' },
      { pin: 3, name: 'D1', direction: 'INPUT' },
      { pin: 4, name: 'D0', direction: 'INPUT' },
      { pin: 5, name: 'Y', direction: 'OUTPUT' },
      { pin: 6, name: "W (Y')", direction: 'OUTPUT' },
      { pin: 7, name: "STROBE (G')", direction: 'INPUT' },
      { pin: 8, name: 'GND', direction: 'GND' },
      { pin: 9, name: 'S2 (C)', direction: 'INPUT' },
      { pin: 10, name: 'S1 (B)', direction: 'INPUT' },
      { pin: 11, name: 'S0 (A)', direction: 'INPUT' },
      { pin: 12, name: 'D7', direction: 'INPUT' },
      { pin: 13, name: 'D6', direction: 'INPUT' },
      { pin: 14, name: 'D5', direction: 'INPUT' },
      { pin: 15, name: 'D4', direction: 'INPUT' },
      { pin: 16, name: 'VCC', direction: 'VCC' },
    ],
    evaluate: (inputs, prevState) => {
      const strobe = inputs[7] ?? 'X';
      if (strobe === 1) return { outputs: { 5: 0, 6: 1 }, nextState: prevState };
      if (strobe !== 0) return { outputs: { 5: 'X', 6: 'X' }, nextState: prevState };
      const s2 = inputs[9];
      const s1 = inputs[10];
      const s0 = inputs[11];
      if (!isDefined(s2) || !isDefined(s1) || !isDefined(s0)) {
        return { outputs: { 5: 'X', 6: 'X' }, nextState: prevState };
      }
      const dataPinMap = [4, 3, 2, 1, 15, 14, 13, 12];
      const idx = (s2 << 2) | (s1 << 1) | s0;
      const y = inputs[dataPinMap[idx]] ?? 'X';
      return { outputs: { 5: y, 6: logicNot(y) }, nextState: prevState };
    },
  },
  '74153': {
    id: '74153',
    name: 'Dual 4-to-1 Line Multiplexer',
    category: 'MUX',
    pinCount: 16,
    description: 'Two independent 4:1 multiplexers with common select lines A, B and active-low strobes.',
    vccPin: 16,
    gndPin: 8,
    pins: [
      { pin: 1, name: "1G'", direction: 'INPUT' },
      { pin: 2, name: 'B (S1)', direction: 'INPUT' },
      { pin: 3, name: '1C3', direction: 'INPUT' },
      { pin: 4, name: '1C2', direction: 'INPUT' },
      { pin: 5, name: '1C1', direction: 'INPUT' },
      { pin: 6, name: '1C0', direction: 'INPUT' },
      { pin: 7, name: '1Y', direction: 'OUTPUT' },
      { pin: 8, name: 'GND', direction: 'GND' },
      { pin: 9, name: '2Y', direction: 'OUTPUT' },
      { pin: 10, name: '2C0', direction: 'INPUT' },
      { pin: 11, name: '2C1', direction: 'INPUT' },
      { pin: 12, name: '2C2', direction: 'INPUT' },
      { pin: 13, name: '2C3', direction: 'INPUT' },
      { pin: 14, name: 'A (S0)', direction: 'INPUT' },
      { pin: 15, name: "2G'", direction: 'INPUT' },
      { pin: 16, name: 'VCC', direction: 'VCC' },
    ],
    evaluate: (inputs, prevState) => {
      const evalMux = (gPin: number, cPins: number[]): LogicState => {
        const g = inputs[gPin];
        if (g === 1) return 0;
        if (g !== 0) return 'X';
        const b = inputs[2];
        const a = inputs[14];
        if (!isDefined(a) || !isDefined(b)) return 'X';
        return inputs[cPins[(b << 1) | a]] ?? 'X';
      };
      return {
        outputs: {
          7: evalMux(1, [6, 5, 4, 3]),
          9: evalMux(15, [10, 11, 12, 13]),
        },
        nextState: prevState,
      };
    },
  },
  '7483': {
    id: '7483',
    name: '4-Bit Binary Full Adder',
    category: 'ARITHMETIC',
    pinCount: 16,
    description: '4-bit binary full adder with fast carry (VCC=5, GND=12).',
    vccPin: 5,
    gndPin: 12,
    pins: [
      { pin: 1, name: 'A4', direction: 'INPUT' },
      { pin: 2, name: 'S3', direction: 'OUTPUT' },
      { pin: 3, name: 'A3', direction: 'INPUT' },
      { pin: 4, name: 'B3', direction: 'INPUT' },
      { pin: 5, name: 'VCC', direction: 'VCC' },
      { pin: 6, name: 'S2', direction: 'OUTPUT' },
      { pin: 7, name: 'B2', direction: 'INPUT' },
      { pin: 8, name: 'A2', direction: 'INPUT' },
      { pin: 9, name: 'S1', direction: 'OUTPUT' },
      { pin: 10, name: 'A1', direction: 'INPUT' },
      { pin: 11, name: 'B1', direction: 'INPUT' },
      { pin: 12, name: 'GND', direction: 'GND' },
      { pin: 13, name: 'C0', direction: 'INPUT' },
      { pin: 14, name: 'C4', direction: 'OUTPUT' },
      { pin: 15, name: 'S4', direction: 'OUTPUT' },
      { pin: 16, name: 'B4', direction: 'INPUT' },
    ],
    evaluate: (inputs, prevState) => {
      const aPins = [10, 8, 3, 1];
      const bPins = [11, 7, 4, 16];
      const c0 = inputs[13];
      const allVals = [...aPins.map((p) => inputs[p]), ...bPins.map((p) => inputs[p]), c0];
      if (!allVals.every(isDefined)) {
        return {
          outputs: { 9: 'X', 6: 'X', 2: 'X', 15: 'X', 14: 'X' },
          nextState: prevState,
        };
      }
      const a =
        ((inputs[1] as number) << 3) |
        ((inputs[3] as number) << 2) |
        ((inputs[8] as number) << 1) |
        (inputs[10] as number);
      const b =
        ((inputs[16] as number) << 3) |
        ((inputs[4] as number) << 2) |
        ((inputs[7] as number) << 1) |
        (inputs[11] as number);
      const sum = a + b + (c0 as number);
      return {
        outputs: {
          9: ((sum >> 0) & 1) as LogicState,
          6: ((sum >> 1) & 1) as LogicState,
          2: ((sum >> 2) & 1) as LogicState,
          15: ((sum >> 3) & 1) as LogicState,
          14: ((sum >> 4) & 1) as LogicState,
        },
        nextState: prevState,
      };
    },
  },
  '7490': {
    id: '7490',
    name: 'Decade Counter (MOD-2 & MOD-5)',
    category: 'COUNTER',
    pinCount: 14,
    description: 'Negative-edge-triggered divide-by-2 and divide-by-5 ripple counter (VCC=5, GND=10).',
    vccPin: 5,
    gndPin: 10,
    pins: [
      { pin: 1, name: 'CKB (Input B)', direction: 'INPUT' },
      { pin: 2, name: 'R0(1)', direction: 'INPUT' },
      { pin: 3, name: 'R0(2)', direction: 'INPUT' },
      { pin: 4, name: 'NC', direction: 'NC' },
      { pin: 5, name: 'VCC', direction: 'VCC' },
      { pin: 6, name: 'R9(1)', direction: 'INPUT' },
      { pin: 7, name: 'R9(2)', direction: 'INPUT' },
      { pin: 8, name: 'QC', direction: 'OUTPUT' },
      { pin: 9, name: 'QB', direction: 'OUTPUT' },
      { pin: 10, name: 'GND', direction: 'GND' },
      { pin: 11, name: 'QD', direction: 'OUTPUT' },
      { pin: 12, name: 'QA', direction: 'OUTPUT' },
      { pin: 13, name: 'NC', direction: 'NC' },
      { pin: 14, name: 'CKA (Input A)', direction: 'INPUT' },
    ],
    evaluate: (inputs, prevState) => {
      let qa: 0 | 1 = prevState.qa ?? 0;
      let mod5: number = prevState.mod5 ?? 0;
      const prevCka: LogicState = prevState.prevCka ?? 0;
      const prevCkb: LogicState = prevState.prevCkb ?? 0;
      const cka = inputs[14] ?? 0;
      const ckb = inputs[1] ?? 0;
      const r01 = inputs[2] ?? 0;
      const r02 = inputs[3] ?? 0;
      const r91 = inputs[6] ?? 0;
      const r92 = inputs[7] ?? 0;

      if (r91 === 1 && r92 === 1) {
        qa = 1;
        mod5 = 4;
      } else if (r01 === 1 && r02 === 1) {
        qa = 0;
        mod5 = 0;
      } else {
        if (prevCka === 1 && cka === 0) {
          qa = qa === 0 ? 1 : 0;
        }
        if (prevCkb === 1 && ckb === 0) {
          mod5 = (mod5 + 1) % 5;
        }
      }

      const qb = ((mod5 >> 0) & 1) as LogicState;
      const qc = ((mod5 >> 1) & 1) as LogicState;
      const qd = ((mod5 >> 2) & 1) as LogicState;

      return {
        outputs: { 12: qa, 9: qb, 8: qc, 11: qd },
        nextState: {
          qa,
          mod5,
          prevCka: isDefined(cka) ? cka : prevCka,
          prevCkb: isDefined(ckb) ? ckb : prevCkb,
        },
      };
    },
  },
};
