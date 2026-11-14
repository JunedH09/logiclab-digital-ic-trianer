import { TerminalId, Wire } from '@/lib/simulation/types';

export interface GuidedStep {
  title: string;
  instruction: string;
  highlightTerminals: TerminalId[];
}

export interface TruthTableRow {
  inputs: Record<string, number | string>;
  outputs: Record<string, number | string>;
}

export interface ExperimentDefinition {
  id: number;
  title: string;
  shortTitle: string;
  aim: string;
  apparatus: string[];
  requiredICs: string[];
  theory: string;
  booleanEquations: string[];
  steps: GuidedStep[];
  truthTableHeaders: { inputs: string[]; outputs: string[] };
  truthTable: TruthTableRow[];
  conclusion: string;
  presetSockets: { socketIndex: number; icId: string }[];
  presetWires: Wire[];
}

const w = (id: string, from: TerminalId, to: TerminalId): Wire => ({ id, from, to });

export const EXPERIMENTS: ExperimentDefinition[] = [
  {
    id: 1,
    title: 'Experiment 1: Boolean Function & Multiplexers (4:1 MUX, IC 74151, IC 74153)',
    shortTitle: 'Multiplexers (74151 / 74153)',
    aim: 'Implementation of the given Boolean function F(X,Y,Z) = Σ(0,1,3,6) using IC 74151 (8:1 MUX), 4:1 MUX using basic gates, and Dual 4:1 MUX using IC 74153.',
    apparatus: ['Digital IC Trainer Kit (DIT9006)', 'IC 74151 (8:1 MUX)', 'IC 74153 (Dual 4:1 MUX)', 'IC 7404, 7408, 7432', 'Patch Cords'],
    requiredICs: ['74151', '74153', '7404', '7408', '7432'],
    theory: 'An 8:1 Multiplexer (IC 74151) selects one of eight data inputs (D0–D7) using three select lines (S2, S1, S0) when the active-low Strobe (Pin 7) is grounded.',
    booleanEquations: [
      "4:1 MUX: Y = S1'S0'D0 + S1'S0D1 + S1S0'D2 + S1S0D3",
      '8:1 MUX: F(X,Y,Z) = Σ(0, 1, 3, 6)',
    ],
    steps: [
      { title: 'Insert IC 74151', instruction: 'Click Socket 1 and insert IC 74151 (16-pin 8:1 Multiplexer).', highlightTerminals: ['IC:0:16', 'IC:0:8'] },
      { title: 'Connect Power & Active-Low Strobe', instruction: "Connect +5V to Pin 16 (VCC). Connect GND to Pin 8 (GND) and Pin 7 (Strobe G').", highlightTerminals: ['VCC:0', 'IC:0:16', 'GND:0', 'IC:0:8', 'IC:0:7'] },
      { title: 'Tie Minterm Data Inputs', instruction: 'Connect D0(4), D1(3), D3(1), D6(13) to +5V. Connect D2(2), D4(15), D5(14), D7(12) to GND.', highlightTerminals: ['IC:0:4', 'IC:0:3', 'IC:0:1', 'IC:0:13'] },
      { title: 'Wire Select Lines & Outputs', instruction: 'Connect A0→S0(11), A1→S1(10), A2→S2(9). Connect Y(5)→OUT:0 and W(6)→OUT:1.', highlightTerminals: ['IN:0', 'IN:1', 'IN:2', 'IC:0:5', 'OUT:0'] },
    ],
    truthTableHeaders: { inputs: ['S2(X)', 'S1(Y)', 'S0(Z)'], outputs: ['F (Y)', "W (Y')"] },
    truthTable: [
      { inputs: { 'S2(X)': 0, 'S1(Y)': 0, 'S0(Z)': 0 }, outputs: { 'F (Y)': 1, "W (Y')": 0 } },
      { inputs: { 'S2(X)': 0, 'S1(Y)': 0, 'S0(Z)': 1 }, outputs: { 'F (Y)': 1, "W (Y')": 0 } },
      { inputs: { 'S2(X)': 0, 'S1(Y)': 1, 'S0(Z)': 0 }, outputs: { 'F (Y)': 0, "W (Y')": 1 } },
      { inputs: { 'S2(X)': 0, 'S1(Y)': 1, 'S0(Z)': 1 }, outputs: { 'F (Y)': 1, "W (Y')": 0 } },
      { inputs: { 'S2(X)': 1, 'S1(Y)': 0, 'S0(Z)': 0 }, outputs: { 'F (Y)': 0, "W (Y')": 1 } },
      { inputs: { 'S2(X)': 1, 'S1(Y)': 0, 'S0(Z)': 1 }, outputs: { 'F (Y)': 0, "W (Y')": 1 } },
      { inputs: { 'S2(X)': 1, 'S1(Y)': 1, 'S0(Z)': 0 }, outputs: { 'F (Y)': 1, "W (Y')": 0 } },
      { inputs: { 'S2(X)': 1, 'S1(Y)': 1, 'S0(Z)': 1 }, outputs: { 'F (Y)': 0, "W (Y')": 1 } },
    ],
    conclusion: 'Studied and verified 4:1 MUX using gates and 3-variable Boolean function F(X,Y,Z)=Σ(0,1,3,6) using IC 74151.',
    presetSockets: [{ socketIndex: 0, icId: '74151' }],
    presetWires: [
      w('e1-1', 'VCC:0', 'IC:0:16'), w('e1-2', 'GND:0', 'IC:0:8'), w('e1-3', 'GND:1', 'IC:0:7'),
      w('e1-4', 'VCC:1', 'IC:0:4'), w('e1-5', 'VCC:1', 'IC:0:3'), w('e1-6', 'GND:2', 'IC:0:2'),
      w('e1-7', 'VCC:2', 'IC:0:1'), w('e1-8', 'GND:2', 'IC:0:15'), w('e1-9', 'GND:3', 'IC:0:14'),
      w('e1-10', 'VCC:3', 'IC:0:13'), w('e1-11', 'GND:3', 'IC:0:12'), w('e1-12', 'IN:0', 'IC:0:11'),
      w('e1-13', 'IN:1', 'IC:0:10'), w('e1-14', 'IN:2', 'IC:0:9'), w('e1-15', 'IC:0:5', 'OUT:0'),
      w('e1-16', 'IC:0:6', 'OUT:1'),
    ],
  },
  {
    id: 2,
    title: 'Experiment 2: Decoder, Encoder & Demultiplexer',
    shortTitle: 'Decoder / Encoder / Demux',
    aim: 'Implementation and verification of 3:8 Decoder, 8:3 Octal-to-Binary Encoder, and 1:4 Demultiplexer using logic gates.',
    apparatus: ['Digital IC Trainer Kit', 'IC 7404 (NOT)', 'IC 7408 (AND)', 'IC 7432 (OR)', 'Patch Cords'],
    requiredICs: ['7404', '7408', '7432'],
    theory: 'A 1:4 Demultiplexer steers a single data input D to one of 4 outputs (O0–O3) based on select lines S1, S0.',
    booleanEquations: [
      "1:4 Demux: O0 = D·S1'·S0', O1 = D·S1'·S0, O2 = D·S1·S0', O3 = D·S1·S0",
      '8:3 Encoder: Y0 = I1+I3+I5+I7, Y1 = I2+I3+I6+I7, Y2 = I4+I5+I6+I7',
    ],
    steps: [
      { title: 'Insert ICs 7404 & 7408', instruction: 'Insert IC 7404 in Socket 1 and IC 7408 in Socket 2.', highlightTerminals: ['IC:0:14', 'IC:1:14'] },
      { title: 'Power Both ICs', instruction: 'Connect Pin 14 of both ICs to +5V and Pin 7 of both ICs to GND.', highlightTerminals: ['VCC:0', 'GND:0'] },
      { title: 'Wire 2:4 Decoder / 1:4 Demux Selectors', instruction: 'Invert S0 (IN:0) and S1 (IN:1) using 7404, then AND combinations in 7408 to drive OUT:0–OUT:3.', highlightTerminals: ['IN:0', 'IN:1', 'OUT:0', 'OUT:1', 'OUT:2', 'OUT:3'] },
    ],
    truthTableHeaders: { inputs: ['S1', 'S0'], outputs: ['O0', 'O1', 'O2', 'O3'] },
    truthTable: [
      { inputs: { S1: 0, S0: 0 }, outputs: { O0: 1, O1: 0, O2: 0, O3: 0 } },
      { inputs: { S1: 0, S0: 1 }, outputs: { O0: 0, O1: 1, O2: 0, O3: 0 } },
      { inputs: { S1: 1, S0: 0 }, outputs: { O0: 0, O1: 0, O2: 1, O3: 0 } },
      { inputs: { S1: 1, S0: 1 }, outputs: { O0: 0, O1: 0, O2: 0, O3: 1 } },
    ],
    conclusion: 'Decoder, 8:3 Encoder, and 1:4 Demultiplexer circuits have been implemented and verified.',
    presetSockets: [{ socketIndex: 0, icId: '7404' }, { socketIndex: 1, icId: '7408' }],
    presetWires: [
      w('e2-1', 'VCC:0', 'IC:0:14'), w('e2-2', 'GND:0', 'IC:0:7'), w('e2-3', 'VCC:1', 'IC:1:14'), w('e2-4', 'GND:1', 'IC:1:7'),
      w('e2-5', 'IN:0', 'IC:0:1'), w('e2-6', 'IN:1', 'IC:0:3'),
      w('e2-7', 'IC:0:2', 'IC:1:1'), w('e2-8', 'IC:0:4', 'IC:1:2'), w('e2-9', 'IC:1:3', 'OUT:0'),
      w('e2-10', 'IN:0', 'IC:1:4'), w('e2-11', 'IC:0:4', 'IC:1:5'), w('e2-12', 'IC:1:6', 'OUT:1'),
      w('e2-13', 'IC:0:2', 'IC:1:9'), w('e2-14', 'IN:1', 'IC:1:10'), w('e2-15', 'IC:1:8', 'OUT:2'),
      w('e2-16', 'IN:0', 'IC:1:12'), w('e2-17', 'IN:1', 'IC:1:13'), w('e2-18', 'IC:1:11', 'OUT:3'),
    ],
  },
  {
    id: 3,
    title: 'Experiment 3: Half Adder & Full Adder',
    shortTitle: 'Half & Full Adder',
    aim: 'Implementation of Half Adder and Full Adder using basic logic gates (IC 7486, 7408, 7432).',
    apparatus: ['Digital IC Trainer Kit', 'IC 7486 (XOR)', 'IC 7408 (AND)', 'IC 7432 (OR)', 'IC 7400 (NAND)'],
    requiredICs: ['7486', '7408', '7432', '7400'],
    theory: 'A Full Adder adds three 1-bit inputs (A, B, Cin) to produce Sum (S) and Carry-out (Cout).',
    booleanEquations: ['Half Adder: S = A ⊕ B,  C = A · B', 'Full Adder: S = (A ⊕ B) ⊕ Cin,  Cout = A·B + Cin·(A ⊕ B)'],
    steps: [
      { title: 'Insert ICs 7486, 7408 & 7432', instruction: 'Place 7486 in Socket 1, 7408 in Socket 2, and 7432 in Socket 3.', highlightTerminals: ['IC:0:14', 'IC:1:14', 'IC:2:14'] },
      { title: 'Connect VCC & GND', instruction: 'Connect Pin 14 of all three ICs to +5V and Pin 7 to GND.', highlightTerminals: ['VCC:0', 'GND:0'] },
      { title: 'Wire Full Adder Logic', instruction: 'Use A=IN:0, B=IN:1, Cin=IN:2. Route Sum to OUT:0 and Cout to OUT:1.', highlightTerminals: ['IN:0', 'IN:1', 'IN:2', 'OUT:0', 'OUT:1'] },
    ],
    truthTableHeaders: { inputs: ['A', 'B', 'Cin'], outputs: ['Sum (S)', 'Cout'] },
    truthTable: [
      { inputs: { A: 0, B: 0, Cin: 0 }, outputs: { 'Sum (S)': 0, Cout: 0 } },
      { inputs: { A: 0, B: 0, Cin: 1 }, outputs: { 'Sum (S)': 1, Cout: 0 } },
      { inputs: { A: 0, B: 1, Cin: 0 }, outputs: { 'Sum (S)': 1, Cout: 0 } },
      { inputs: { A: 0, B: 1, Cin: 1 }, outputs: { 'Sum (S)': 0, Cout: 1 } },
      { inputs: { A: 1, B: 0, Cin: 0 }, outputs: { 'Sum (S)': 1, Cout: 0 } },
      { inputs: { A: 1, B: 0, Cin: 1 }, outputs: { 'Sum (S)': 0, Cout: 1 } },
      { inputs: { A: 1, B: 1, Cin: 0 }, outputs: { 'Sum (S)': 0, Cout: 1 } },
      { inputs: { A: 1, B: 1, Cin: 1 }, outputs: { 'Sum (S)': 1, Cout: 1 } },
    ],
    conclusion: 'Half Adder and Full Adder circuits were constructed and their truth tables verified.',
    presetSockets: [{ socketIndex: 0, icId: '7486' }, { socketIndex: 1, icId: '7408' }, { socketIndex: 2, icId: '7432' }],
    presetWires: [
      w('e3-1', 'VCC:0', 'IC:0:14'), w('e3-2', 'GND:0', 'IC:0:7'), w('e3-3', 'VCC:1', 'IC:1:14'),
      w('e3-4', 'GND:1', 'IC:1:7'), w('e3-5', 'VCC:2', 'IC:2:14'), w('e3-6', 'GND:2', 'IC:2:7'),
      w('e3-7', 'IN:0', 'IC:0:1'), w('e3-8', 'IN:1', 'IC:0:2'), w('e3-9', 'IC:0:3', 'IC:0:4'),
      w('e3-10', 'IN:2', 'IC:0:5'), w('e3-11', 'IC:0:6', 'OUT:0'), w('e3-12', 'IN:0', 'IC:1:1'),
      w('e3-13', 'IN:1', 'IC:1:2'), w('e3-14', 'IC:0:3', 'IC:1:4'), w('e3-15', 'IN:2', 'IC:1:5'),
      w('e3-16', 'IC:1:3', 'IC:2:1'), w('e3-17', 'IC:1:6', 'IC:2:2'), w('e3-18', 'IC:2:3', 'OUT:1'),
    ],
  },
  {
    id: 4,
    title: 'Experiment 4: 4-Bit Binary-to-Gray & Gray-to-Binary Converter',
    shortTitle: 'Binary ↔ Gray Code',
    aim: 'Design and verify a 4-bit Binary-to-Gray and 4-bit Gray-to-Binary code converter using IC 7486.',
    apparatus: ['Digital IC Trainer Kit', 'IC 7486 (Quad XOR)', 'Patch Cords'],
    requiredICs: ['7486'],
    theory: 'Gray code is a non-weighted minimum-change code where only one bit changes between successive numbers.',
    booleanEquations: ['Binary→Gray: G3 = B3, G2 = B3 ⊕ B2, G1 = B2 ⊕ B1, G0 = B1 ⊕ B0', 'Gray→Binary: B3 = G3, B2 = B3 ⊕ G2, B1 = B2 ⊕ G1, B0 = B1 ⊕ G0'],
    steps: [
      { title: 'Insert IC 7486', instruction: 'Insert IC 7486 (Quad XOR) into Socket 1 and connect VCC (Pin 14) and GND (Pin 7).', highlightTerminals: ['VCC:0', 'IC:0:14', 'GND:0', 'IC:0:7'] },
      { title: 'Wire Binary-to-Gray Equations', instruction: 'Connect B3(IN:3) directly to G3(OUT:3). XOR adjacent bits for G2, G1, G0.', highlightTerminals: ['IN:0', 'IN:1', 'IN:2', 'IN:3', 'OUT:0', 'OUT:1', 'OUT:2', 'OUT:3'] },
    ],
    truthTableHeaders: { inputs: ['B3', 'B2', 'B1', 'B0'], outputs: ['G3', 'G2', 'G1', 'G0'] },
    truthTable: Array.from({ length: 16 }, (_, n) => {
      const g = n ^ (n >> 1);
      return {
        inputs: { B3: (n >> 3) & 1, B2: (n >> 2) & 1, B1: (n >> 1) & 1, B0: n & 1 },
        outputs: { G3: (g >> 3) & 1, G2: (g >> 2) & 1, G1: (g >> 1) & 1, G0: g & 1 },
      };
    }),
    conclusion: '4-bit Binary-to-Gray and Gray-to-Binary converters were constructed and verified for all 16 combinations.',
    presetSockets: [{ socketIndex: 0, icId: '7486' }],
    presetWires: [
      w('e4-1', 'VCC:0', 'IC:0:14'), w('e4-2', 'GND:0', 'IC:0:7'), w('e4-3', 'IN:3', 'OUT:3'),
      w('e4-4', 'IN:3', 'IC:0:1'), w('e4-5', 'IN:2', 'IC:0:2'), w('e4-6', 'IC:0:3', 'OUT:2'),
      w('e4-7', 'IN:2', 'IC:0:4'), w('e4-8', 'IN:1', 'IC:0:5'), w('e4-9', 'IC:0:6', 'OUT:1'),
      w('e4-10', 'IN:1', 'IC:0:9'), w('e4-11', 'IN:0', 'IC:0:10'), w('e4-12', 'IC:0:8', 'OUT:0'),
    ],
  },
  {
    id: 5,
    title: 'Experiment 5: 4-Bit Binary Adder using IC 7483',
    shortTitle: '4-Bit Adder (IC 7483)',
    aim: 'Design and implement a 4-bit binary parallel adder using IC 7483.',
    apparatus: ['Digital IC Trainer Kit', 'IC 7483 (4-Bit Adder)', 'IC 7486', 'IC 7404', 'Patch Cords'],
    requiredICs: ['7483', '7486', '7404'],
    theory: 'IC 7483 adds two 4-bit binary numbers A4A3A2A1 and B4B3B2B1 along with Carry-In C0 (Pin 13). Note: VCC = Pin 5, GND = Pin 12.',
    booleanEquations: ['{C4, S4, S3, S2, S1} = A[4:1] + B[4:1] + C0'],
    steps: [
      { title: 'Insert IC 7483 & Connect Non-Standard Power', instruction: 'Insert IC 7483 in Socket 1. Connect +5V to Pin 5 and GND to Pin 12. Ground C0 (Pin 13).', highlightTerminals: ['VCC:0', 'IC:0:5', 'GND:0', 'IC:0:12', 'IC:0:13'] },
      { title: 'Connect Operands A & B', instruction: 'Map A0–A3 (IN:0..3) to A1(10), A2(8), A3(3), A4(1) and B0–B3 (IN:4..7) to B1(11), B2(7), B3(4), B4(16).', highlightTerminals: ['IN:0', 'IN:4', 'IC:0:10', 'IC:0:11'] },
      { title: 'Connect Sum & Carry Outputs', instruction: 'Connect S1(9)→OUT:0, S2(6)→OUT:1, S3(2)→OUT:2, S4(15)→OUT:3, and C4(14)→OUT:4.', highlightTerminals: ['IC:0:9', 'IC:0:6', 'IC:0:2', 'IC:0:15', 'IC:0:14', 'OUT:0'] },
    ],
    truthTableHeaders: { inputs: ['A (Dec)', 'B (Dec)', 'C0'], outputs: ['Sum (S4..S1)', 'C4', 'Total'] },
    truthTable: [
      { inputs: { 'A (Dec)': 3, 'B (Dec)': 5, C0: 0 }, outputs: { 'Sum (S4..S1)': '1000', C4: 0, Total: 8 } },
      { inputs: { 'A (Dec)': 7, 'B (Dec)': 8, C0: 0 }, outputs: { 'Sum (S4..S1)': '1111', C4: 0, Total: 15 } },
      { inputs: { 'A (Dec)': 9, 'B (Dec)': 9, C0: 0 }, outputs: { 'Sum (S4..S1)': '0010', C4: 1, Total: 18 } },
      { inputs: { 'A (Dec)': 15, 'B (Dec)': 15, C0: 0 }, outputs: { 'Sum (S4..S1)': '1110', C4: 1, Total: 30 } },
    ],
    conclusion: 'Implemented and verified the 4-bit parallel binary adder using IC 7483.',
    presetSockets: [{ socketIndex: 0, icId: '7483' }],
    presetWires: [
      w('e5-1', 'VCC:0', 'IC:0:5'), w('e5-2', 'GND:0', 'IC:0:12'), w('e5-3', 'GND:1', 'IC:0:13'),
      w('e5-4', 'IN:0', 'IC:0:10'), w('e5-5', 'IN:1', 'IC:0:8'), w('e5-6', 'IN:2', 'IC:0:3'), w('e5-7', 'IN:3', 'IC:0:1'),
      w('e5-8', 'IN:4', 'IC:0:11'), w('e5-9', 'IN:5', 'IC:0:7'), w('e5-10', 'IN:6', 'IC:0:4'), w('e5-11', 'IN:7', 'IC:0:16'),
      w('e5-12', 'IC:0:9', 'OUT:0'), w('e5-13', 'IC:0:6', 'OUT:1'), w('e5-14', 'IC:0:2', 'OUT:2'),
      w('e5-15', 'IC:0:15', 'OUT:3'), w('e5-16', 'IC:0:14', 'OUT:4'),
    ],
  },
  {
    id: 6,
    title: 'Experiment 6: Flip-Flops (SR, D, T & JK using NAND/NOR Gates)',
    shortTitle: 'Flip-Flops (7400 / 7402)',
    aim: 'Verification of truth tables of clocked SR, JK, T, and D flip-flops using NAND (7400, 7410) and NOR (7402) gates.',
    apparatus: ['Digital IC Trainer Kit', 'IC 7400 (Quad NAND)', 'IC 7402 (Quad NOR)', 'IC 7410 (Triple 3-in NAND)'],
    requiredICs: ['7400', '7402', '7410'],
    theory: 'A clocked SR Flip-Flop built with four 2-input NAND gates (IC 7400) stores 1 bit of state.',
    booleanEquations: ["SR: Q(n+1) = S + R'·Q(n)", 'D: Q(n+1) = D', "JK: Q(n+1) = J·Q'(n) + K'·Q(n)", 'T: Q(n+1) = T ⊕ Q(n)'],
    steps: [
      { title: 'Insert IC 7400', instruction: 'Insert IC 7400 in Socket 1 and connect Pin 14 (+5V) and Pin 7 (GND).', highlightTerminals: ['VCC:0', 'IC:0:14', 'GND:0', 'IC:0:7'] },
      { title: 'Wire Clocked SR Latch', instruction: "Connect S=IN:0, R=IN:1, CP=IN:2. Cross-couple Gate 3 (Pin 8) and Gate 4 (Pin 11) for Q (OUT:0) and Q' (OUT:1).", highlightTerminals: ['IN:0', 'IN:1', 'IN:2', 'OUT:0', 'OUT:1'] },
    ],
    truthTableHeaders: { inputs: ['CP', 'S', 'R'], outputs: ['Q(n+1)', "Q'(n+1)", 'State'] },
    truthTable: [
      { inputs: { CP: 0, S: 'X', R: 'X' }, outputs: { 'Q(n+1)': 'Qn', "Q'(n+1)": "Qn'", State: 'Hold' } },
      { inputs: { CP: 1, S: 0, R: 0 }, outputs: { 'Q(n+1)': 'Qn', "Q'(n+1)": "Qn'", State: 'Hold' } },
      { inputs: { CP: 1, S: 0, R: 1 }, outputs: { 'Q(n+1)': 0, "Q'(n+1)": 1, State: 'Reset' } },
      { inputs: { CP: 1, S: 1, R: 0 }, outputs: { 'Q(n+1)': 1, "Q'(n+1)": 0, State: 'Set' } },
      { inputs: { CP: 1, S: 1, R: 1 }, outputs: { 'Q(n+1)': '1*', "Q'(n+1)": '1*', State: 'Forbidden' } },
    ],
    conclusion: 'Verified the truth tables and state retention of SR, D, T, and JK flip-flops.',
    presetSockets: [{ socketIndex: 0, icId: '7400' }],
    presetWires: [
      w('e6-1', 'VCC:0', 'IC:0:14'), w('e6-2', 'GND:0', 'IC:0:7'),
      w('e6-3', 'IN:0', 'IC:0:1'), w('e6-4', 'IN:2', 'IC:0:2'), w('e6-5', 'IN:1', 'IC:0:4'), w('e6-6', 'IN:2', 'IC:0:5'),
      w('e6-7', 'IC:0:3', 'IC:0:9'), w('e6-8', 'IC:0:6', 'IC:0:13'), w('e6-9', 'IC:0:8', 'IC:0:12'),
      w('e6-10', 'IC:0:11', 'IC:0:10'), w('e6-11', 'IC:0:8', 'OUT:0'), w('e6-12', 'IC:0:11', 'OUT:1'),
    ],
  },
  {
    id: 7,
    title: 'Experiment 7: MOD-N Decade Counter using IC 7490',
    shortTitle: 'MOD-10 Counter (IC 7490)',
    aim: 'Design and implement MOD-2, MOD-5, and MOD-10 (Decade/BCD) ripple counter using IC 7490.',
    apparatus: ['Digital IC Trainer Kit', 'IC 7490 (Decade Counter)', 'Patch Cords'],
    requiredICs: ['7490'],
    theory: 'IC 7490 contains an internal negative-edge-triggered MOD-2 section (CKA→QA) and MOD-5 section (CKB→QB,QC,QD). Cascading QA (Pin 12) to CKB (Pin 1) creates a MOD-10 BCD counter.',
    booleanEquations: ['MOD-10 Cascade: CKA = Clock, CKB = QA, R0(1)=R0(2)=R9(1)=R9(2)=0'],
    steps: [
      { title: 'Insert IC 7490 & Power', instruction: 'Insert IC 7490 in Socket 1. Connect +5V to Pin 5 and GND to Pin 10.', highlightTerminals: ['VCC:0', 'IC:0:5', 'GND:0', 'IC:0:10'] },
      { title: 'Ground Reset/Preset Pins', instruction: 'Connect R0(1)[2], R0(2)[3], R9(1)[6], R9(2)[7] to GND to enable counting mode.', highlightTerminals: ['IC:0:2', 'IC:0:3', 'IC:0:6', 'IC:0:7', 'GND:1'] },
      { title: 'Cascade QA → CKB & Connect Clock', instruction: 'Connect CLK:0 to CKA (Pin 14), and wire QA (Pin 12) to CKB (Pin 1).', highlightTerminals: ['CLK:0', 'IC:0:14', 'IC:0:12', 'IC:0:1'] },
      { title: 'Connect Outputs to LEDs & 7-Segment', instruction: 'Connect QA(12)→OUT:0, QB(9)→OUT:1, QC(8)→OUT:2, QD(11)→OUT:3. Start the Clock!', highlightTerminals: ['IC:0:12', 'IC:0:9', 'IC:0:8', 'IC:0:11', 'OUT:0'] },
    ],
    truthTableHeaders: { inputs: ['CLK Pulse'], outputs: ['QD', 'QC', 'QB', 'QA', 'Dec'] },
    truthTable: Array.from({ length: 10 }, (_, n) => ({
      inputs: { 'CLK Pulse': n },
      outputs: { QD: (n >> 3) & 1, QC: (n >> 2) & 1, QB: (n >> 1) & 1, QA: n & 1, Dec: n },
    })),
    conclusion: 'Implemented MOD-2, MOD-5, and MOD-10 decade counter using IC 7490 and verified the 0–9 BCD sequence.',
    presetSockets: [{ socketIndex: 0, icId: '7490' }],
    presetWires: [
      w('e7-1', 'VCC:0', 'IC:0:5'), w('e7-2', 'GND:0', 'IC:0:10'),
      w('e7-3', 'GND:1', 'IC:0:2'), w('e7-4', 'GND:1', 'IC:0:3'), w('e7-5', 'GND:2', 'IC:0:6'), w('e7-6', 'GND:2', 'IC:0:7'),
      w('e7-7', 'CLK:0', 'IC:0:14'), w('e7-8', 'IC:0:12', 'IC:0:1'),
      w('e7-9', 'IC:0:12', 'OUT:0'), w('e7-10', 'IC:0:9', 'OUT:1'), w('e7-11', 'IC:0:8', 'OUT:2'), w('e7-12', 'IC:0:11', 'OUT:3'),
    ],
  },
];
