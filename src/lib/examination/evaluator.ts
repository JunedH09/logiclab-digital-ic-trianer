import { EXPERIMENTS } from '@/lib/experiments/data';
import { runSimulationStep } from '@/lib/simulation/engine';
import { LogicState, SocketState, Wire } from '@/lib/simulation/types';

export interface MarkingScheme {
  icSelection: number;
  powerConnections: number;
  wiringIntegrity: number;
  functionalBehavior: number;
}

export const DEFAULT_MARKING_SCHEME: MarkingScheme = {
  icSelection: 2,
  powerConnections: 2,
  wiringIntegrity: 4,
  functionalBehavior: 10,
};

export interface EvaluationResult {
  expId: number;
  expTitle: string;
  marksObtained: number;
  totalMarks: number;
  breakdown: {
    criterion: string;
    obtained: number;
    max: number;
    feedback: string;
  }[];
  passedVectors: number;
  totalVectors: number;
}

export function evaluateCircuit(
  expId: number,
  sockets: SocketState[],
  wires: Wire[],
  scheme: MarkingScheme = DEFAULT_MARKING_SCHEME
): EvaluationResult {
  const exp = EXPERIMENTS.find((e) => e.id === expId) ?? EXPERIMENTS[0];
  const breakdown: EvaluationResult['breakdown'] = [];

  const insertedICs = sockets.map((s) => s.icId).filter(Boolean) as string[];
  const presetICs = exp.presetSockets.map((s) => s.icId);
  const allRequiredInserted = presetICs.every((req) => insertedICs.includes(req));
  const icMarks = allRequiredInserted ? scheme.icSelection : 0;
  breakdown.push({
    criterion: 'Correct IC Selection',
    obtained: icMarks,
    max: scheme.icSelection,
    feedback: allRequiredInserted
      ? `Required IC(s) [${presetICs.join(', ')}] properly inserted.`
      : `Missing required IC(s): ${presetICs.filter((r) => !insertedICs.includes(r)).join(', ')}.`,
  });

  const baseSim = runSimulationStep({
    powerOn: true,
    inputSwitches: [0, 0, 0, 0, 0, 0, 0, 0],
    clockState: 0,
    pulserStates: [0, 0],
    sockets,
    wires,
  });

  const powerIssues = baseSim.snapshot.issues.filter(
    (i) => i.code === 'MISSING_VCC' || i.code === 'MISSING_GND' || i.code === 'SHORT_CIRCUIT'
  );
  const powerMarks = insertedICs.length > 0 && powerIssues.length === 0 ? scheme.powerConnections : 0;
  breakdown.push({
    criterion: 'VCC & GND Power Connections',
    obtained: powerMarks,
    max: scheme.powerConnections,
    feedback:
      powerMarks > 0
        ? 'All inserted ICs are properly powered (+5V and GND).'
        : powerIssues[0]?.message ?? 'No powered ICs detected on the trainer board.',
  });

  const conflictIssues = baseSim.snapshot.issues.filter((i) => i.severity === 'ERROR');
  const hasWires = wires.length >= 4;
  const wiringMarks =
    hasWires && conflictIssues.length === 0 ? scheme.wiringIntegrity : hasWires ? Math.floor(scheme.wiringIntegrity / 2) : 0;
  breakdown.push({
    criterion: 'Circuit Wiring & Signal Integrity',
    obtained: wiringMarks,
    max: scheme.wiringIntegrity,
    feedback:
      conflictIssues.length > 0
        ? conflictIssues[0].message
        : hasWires
          ? `${wires.length} patch cords verified without electrical conflicts.`
          : 'Circuit is incomplete or unwired.',
  });

  let passedVectors = 0;
  let totalVectors = 0;

  if (expId === 1) {
    const expected = [1, 1, 0, 1, 0, 0, 1, 0];
    totalVectors = 8;
    for (let i = 0; i < 8; i++) {
      const sw: LogicState[] = [(i & 1) as LogicState, ((i >> 1) & 1) as LogicState, ((i >> 2) & 1) as LogicState, 0, 0, 0, 0, 0];
      const res = runSimulationStep({ powerOn: true, inputSwitches: sw, clockState: 0, pulserStates: [0, 0], sockets, wires });
      if (res.snapshot.outputBits[0] === expected[i]) passedVectors++;
    }
  } else if (expId === 3) {
    totalVectors = 8;
    for (let i = 0; i < 8; i++) {
      const a = i & 1, b = (i >> 1) & 1, cin = (i >> 2) & 1;
      const res = runSimulationStep({ powerOn: true, inputSwitches: [a as LogicState, b as LogicState, cin as LogicState, 0, 0, 0, 0, 0], clockState: 0, pulserStates: [0, 0], sockets, wires });
      if (res.snapshot.outputBits[0] === (a ^ b ^ cin) && res.snapshot.outputBits[1] === ((a & b) | (cin & (a ^ b)))) passedVectors++;
    }
  } else if (expId === 4) {
    totalVectors = 16;
    for (let n = 0; n < 16; n++) {
      const g = n ^ (n >> 1);
      const sw: LogicState[] = [(n & 1) as LogicState, ((n >> 1) & 1) as LogicState, ((n >> 2) & 1) as LogicState, ((n >> 3) & 1) as LogicState, 0, 0, 0, 0];
      const res = runSimulationStep({ powerOn: true, inputSwitches: sw, clockState: 0, pulserStates: [0, 0], sockets, wires });
      const outVal = ((res.snapshot.outputBits[3] === 1 ? 1 : 0) << 3) | ((res.snapshot.outputBits[2] === 1 ? 1 : 0) << 2) | ((res.snapshot.outputBits[1] === 1 ? 1 : 0) << 1) | (res.snapshot.outputBits[0] === 1 ? 1 : 0);
      if (outVal === g) passedVectors++;
    }
  } else if (expId === 5) {
    const pairs = [[3, 5], [7, 8], [9, 9], [15, 15], [0, 0], [12, 4]];
    totalVectors = pairs.length;
    for (const [a, b] of pairs) {
      const sw: LogicState[] = [
        (a & 1) as LogicState, ((a >> 1) & 1) as LogicState, ((a >> 2) & 1) as LogicState, ((a >> 3) & 1) as LogicState,
        (b & 1) as LogicState, ((b >> 1) & 1) as LogicState, ((b >> 2) & 1) as LogicState, ((b >> 3) & 1) as LogicState,
      ];
      const res = runSimulationStep({ powerOn: true, inputSwitches: sw, clockState: 0, pulserStates: [0, 0], sockets, wires });
      const out = ((res.snapshot.outputBits[4] === 1 ? 1 : 0) << 4) | ((res.snapshot.outputBits[3] === 1 ? 1 : 0) << 3) | ((res.snapshot.outputBits[2] === 1 ? 1 : 0) << 2) | ((res.snapshot.outputBits[1] === 1 ? 1 : 0) << 1) | (res.snapshot.outputBits[0] === 1 ? 1 : 0);
      if (out === a + b) passedVectors++;
    }
  } else if (expId === 7) {
    totalVectors = 10;
    let currSockets = sockets.map((s) => ({ ...s, internalState: {} }));
    for (let count = 0; count < 10; count++) {
      let step = runSimulationStep({ powerOn: true, inputSwitches: [0, 0, 0, 0, 0, 0, 0, 0], clockState: 1, pulserStates: [0, 0], sockets: currSockets, wires });
      currSockets = step.updatedSockets;
      step = runSimulationStep({ powerOn: true, inputSwitches: [0, 0, 0, 0, 0, 0, 0, 0], clockState: 0, pulserStates: [0, 0], sockets: currSockets, wires });
      currSockets = step.updatedSockets;
      const bcd = ((step.snapshot.outputBits[3] === 1 ? 1 : 0) << 3) | ((step.snapshot.outputBits[2] === 1 ? 1 : 0) << 2) | ((step.snapshot.outputBits[1] === 1 ? 1 : 0) << 1) | (step.snapshot.outputBits[0] === 1 ? 1 : 0);
      if (bcd === (count + 1) % 10) passedVectors++;
    }
  } else {
    totalVectors = 4;
    for (let i = 0; i < 4; i++) {
      const res = runSimulationStep({ powerOn: true, inputSwitches: [(i & 1) as LogicState, ((i >> 1) & 1) as LogicState, 1, 0, 0, 0, 0, 0], clockState: 0, pulserStates: [0, 0], sockets, wires });
      if (res.snapshot.issues.length === 0 && res.snapshot.outputBits.some((b) => b === 1)) passedVectors++;
    }
  }

  const funcMarks = totalVectors > 0 ? Math.round((passedVectors / totalVectors) * scheme.functionalBehavior) : 0;
  breakdown.push({
    criterion: 'Truth-Table & Logic Verification',
    obtained: funcMarks,
    max: scheme.functionalBehavior,
    feedback: `Passed ${passedVectors} / ${totalVectors} automated test vectors.`,
  });

  const marksObtained = icMarks + powerMarks + wiringMarks + funcMarks;
  const totalMarks = scheme.icSelection + scheme.powerConnections + scheme.wiringIntegrity + scheme.functionalBehavior;

  return { expId: exp.id, expTitle: exp.shortTitle, marksObtained, totalMarks, breakdown, passedVectors, totalVectors };
}

export function createTroubleshootingFault(expId: number): {
  sockets: { socketIndex: number; icId: string }[];
  wires: Wire[];
  faultHint: string;
} {
  const exp = EXPERIMENTS.find((e) => e.id === expId) ?? EXPERIMENTS[0];
  const wires = [...exp.presetWires];
  const removed = wires.splice(1, 1)[0];
  return {
    sockets: exp.presetSockets,
    wires,
    faultHint: `A critical connection (${removed?.from} ↔ ${removed?.to}) is missing or disconnected.`,
  };
}
