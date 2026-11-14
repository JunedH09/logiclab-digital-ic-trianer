import { describe, expect, it } from 'vitest';
import { runSimulationStep } from '@/lib/simulation/engine';
import { EXPERIMENTS } from '@/lib/experiments/data';
import { LogicState, SocketState, Wire } from '@/lib/simulation/types';

const makeSockets = (defs: { socketIndex: number; icId: string }[]): SocketState[] =>
  Array.from({ length: 6 }, (_, i) => {
    const found = defs.find((d) => d.socketIndex === i);
    return { socketIndex: i, icId: found?.icId ?? null, internalState: {} };
  });

describe('LogicLab Digital Simulation Engine', () => {
  it('verifies Experiment 1: IC 74151 F(X,Y,Z) = Σ(0,1,3,6)', () => {
    const exp1 = EXPERIMENTS[0];
    const sockets = makeSockets(exp1.presetSockets);
    const expected = [1, 1, 0, 1, 0, 0, 1, 0];
    for (let i = 0; i < 8; i++) {
      const res = runSimulationStep({
        powerOn: true,
        inputSwitches: [(i & 1) as LogicState, ((i >> 1) & 1) as LogicState, ((i >> 2) & 1) as LogicState, 0, 0, 0, 0, 0],
        clockState: 0,
        pulserStates: [0, 0],
        sockets,
        wires: exp1.presetWires,
      });
      expect(res.snapshot.outputBits[0]).toBe(expected[i]);
      expect(res.snapshot.outputBits[1]).toBe(expected[i] === 1 ? 0 : 1);
    }
  });

  it('verifies Experiment 3: Full Adder across all 8 input combinations', () => {
    const exp3 = EXPERIMENTS[2];
    const sockets = makeSockets(exp3.presetSockets);
    for (let i = 0; i < 8; i++) {
      const a = i & 1, b = (i >> 1) & 1, cin = (i >> 2) & 1;
      const res = runSimulationStep({
        powerOn: true,
        inputSwitches: [a as LogicState, b as LogicState, cin as LogicState, 0, 0, 0, 0, 0],
        clockState: 0,
        pulserStates: [0, 0],
        sockets,
        wires: exp3.presetWires,
      });
      expect(res.snapshot.outputBits[0]).toBe(a ^ b ^ cin);
      expect(res.snapshot.outputBits[1]).toBe((a & b) | (cin & (a ^ b)));
    }
  });

  it('verifies Experiment 4: All 16 Binary-to-Gray combinations', () => {
    const exp4 = EXPERIMENTS[3];
    const sockets = makeSockets(exp4.presetSockets);
    for (let n = 0; n < 16; n++) {
      const g = n ^ (n >> 1);
      const res = runSimulationStep({
        powerOn: true,
        inputSwitches: [(n & 1) as LogicState, ((n >> 1) & 1) as LogicState, ((n >> 2) & 1) as LogicState, ((n >> 3) & 1) as LogicState, 0, 0, 0, 0],
        clockState: 0,
        pulserStates: [0, 0],
        sockets,
        wires: exp4.presetWires,
      });
      const out = ((res.snapshot.outputBits[3] as number) << 3) | ((res.snapshot.outputBits[2] as number) << 2) | ((res.snapshot.outputBits[1] as number) << 1) | (res.snapshot.outputBits[0] as number);
      expect(out).toBe(g);
    }
  });

  it('verifies Experiment 5: All 256 operand combinations on IC 7483', () => {
    const exp5 = EXPERIMENTS[4];
    const sockets = makeSockets(exp5.presetSockets);
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const res = runSimulationStep({
          powerOn: true,
          inputSwitches: [
            (a & 1) as LogicState, ((a >> 1) & 1) as LogicState, ((a >> 2) & 1) as LogicState, ((a >> 3) & 1) as LogicState,
            (b & 1) as LogicState, ((b >> 1) & 1) as LogicState, ((b >> 2) & 1) as LogicState, ((b >> 3) & 1) as LogicState,
          ],
          clockState: 0,
          pulserStates: [0, 0],
          sockets,
          wires: exp5.presetWires,
        });
        const sum = ((res.snapshot.outputBits[4] as number) << 4) | ((res.snapshot.outputBits[3] as number) << 3) | ((res.snapshot.outputBits[2] as number) << 2) | ((res.snapshot.outputBits[1] as number) << 1) | (res.snapshot.outputBits[0] as number);
        expect(sum).toBe(a + b);
      }
    }
  });

  it('verifies Experiment 7: IC 7490 MOD-10 Decade Counter sequence (0→9→0)', () => {
    const exp7 = EXPERIMENTS[6];
    let sockets = makeSockets(exp7.presetSockets);
    for (let pulse = 1; pulse <= 10; pulse++) {
      let step = runSimulationStep({ powerOn: true, inputSwitches: [0, 0, 0, 0, 0, 0, 0, 0], clockState: 1, pulserStates: [0, 0], sockets, wires: exp7.presetWires });
      sockets = step.updatedSockets;
      step = runSimulationStep({ powerOn: true, inputSwitches: [0, 0, 0, 0, 0, 0, 0, 0], clockState: 0, pulserStates: [0, 0], sockets, wires: exp7.presetWires });
      sockets = step.updatedSockets;
      const bcd = ((step.snapshot.outputBits[3] as number) << 3) | ((step.snapshot.outputBits[2] as number) << 2) | ((step.snapshot.outputBits[1] as number) << 1) | (step.snapshot.outputBits[0] as number);
      expect(bcd).toBe(pulse % 10);
    }
  });

  it('detects missing VCC/GND and short circuits', () => {
    const sockets = makeSockets([{ socketIndex: 0, icId: '7408' }]);
    const shortWires: Wire[] = [{ id: 's1', from: 'VCC:0', to: 'GND:0' }];
    const res = runSimulationStep({ powerOn: true, inputSwitches: [0, 0, 0, 0, 0, 0, 0, 0], clockState: 0, pulserStates: [0, 0], sockets, wires: shortWires });
    expect(res.snapshot.issues.some((i) => i.code === 'SHORT_CIRCUIT')).toBe(true);
    expect(res.snapshot.issues.some((i) => i.code === 'MISSING_VCC')).toBe(true);
  });
});
