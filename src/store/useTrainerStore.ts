'use client';

import { create } from 'zustand';
import { runSimulationStep } from '@/lib/simulation/engine';
import {
  LogicState,
  SimulationSnapshot,
  SocketState,
  TerminalId,
  Wire,
} from '@/lib/simulation/types';

export interface SavedCircuit {
  id: string;
  name: string;
  createdAt: string;
  sockets: { socketIndex: number; icId: string | null }[];
  wires: Wire[];
}

interface TrainerState {
  powerOn: boolean;
  inputSwitches: LogicState[];
  clockState: 0 | 1;
  clockRunning: boolean;
  clockHz: number;
  pulserStates: [0 | 1, 0 | 1];
  sockets: SocketState[];
  wires: Wire[];
  activeWireStart: TerminalId | null;
  undoStack: Wire[][];
  redoStack: Wire[][];
  highlightedTerminals: TerminalId[];
  snapshot: SimulationSnapshot;
  savedCircuits: SavedCircuit[];
  togglePower: () => void;
  toggleInputSwitch: (index: number) => void;
  setInputByte: (value: number) => void;
  toggleClockRunning: () => void;
  setClockHz: (hz: number) => void;
  stepClock: () => void;
  setPulser: (index: 0 | 1, pressed: boolean) => void;
  insertIC: (socketIndex: number, icId: string | null) => void;
  startOrCompleteWire: (terminalId: TerminalId) => void;
  cancelWire: () => void;
  removeWire: (wireId: string) => void;
  clearWires: () => void;
  resetBoard: () => void;
  undo: () => void;
  redo: () => void;
  setHighlightedTerminals: (terminals: TerminalId[]) => void;
  loadCircuit: (sockets: { socketIndex: number; icId: string | null }[], wires: Wire[]) => void;
  saveCurrentCircuit: (name: string) => void;
  deleteSavedCircuit: (id: string) => void;
  hydrateSavedCircuits: () => void;
}

const STORAGE_KEY = 'logiclab_saved_circuits_v1';

const createEmptySockets = (): SocketState[] =>
  Array.from({ length: 6 }, (_, i) => ({
    socketIndex: i,
    icId: null,
    internalState: {},
  }));

const initialSnapshot: SimulationSnapshot = {
  terminalStates: {},
  issues: [],
  outputBits: Array(8).fill(0),
  sevenSegLeft: null,
  sevenSegRight: null,
};

function recompute(state: {
  powerOn: boolean;
  inputSwitches: LogicState[];
  clockState: 0 | 1;
  pulserStates: [0 | 1, 0 | 1];
  sockets: SocketState[];
  wires: Wire[];
}) {
  const { snapshot, updatedSockets } = runSimulationStep(state);
  return { snapshot, sockets: updatedSockets };
}

export const useTrainerStore = create<TrainerState>((set, get) => ({
  powerOn: true,
  inputSwitches: [0, 0, 0, 0, 0, 0, 0, 0],
  clockState: 0,
  clockRunning: false,
  clockHz: 1,
  pulserStates: [0, 0],
  sockets: createEmptySockets(),
  wires: [],
  activeWireStart: null,
  undoStack: [],
  redoStack: [],
  highlightedTerminals: [],
  snapshot: initialSnapshot,
  savedCircuits: [],

  togglePower: () =>
    set((s) => {
      const powerOn = !s.powerOn;
      return { powerOn, ...recompute({ ...s, powerOn }) };
    }),

  toggleInputSwitch: (index) =>
    set((s) => {
      const inputSwitches = [...s.inputSwitches];
      inputSwitches[index] = inputSwitches[index] === 1 ? 0 : 1;
      return { inputSwitches, ...recompute({ ...s, inputSwitches }) };
    }),

  setInputByte: (value) =>
    set((s) => {
      const clamped = Math.max(0, Math.min(255, value));
      const inputSwitches: LogicState[] = Array.from(
        { length: 8 },
        (_, i) => (((clamped >> i) & 1) as LogicState)
      );
      return { inputSwitches, ...recompute({ ...s, inputSwitches }) };
    }),

  toggleClockRunning: () => set((s) => ({ clockRunning: !s.clockRunning })),
  setClockHz: (hz) => set({ clockHz: Math.max(0.25, Math.min(10, hz)) }),

  stepClock: () =>
    set((s) => {
      const clockState: 0 | 1 = s.clockState === 0 ? 1 : 0;
      return { clockState, ...recompute({ ...s, clockState }) };
    }),

  setPulser: (index, pressed) =>
    set((s) => {
      const pulserStates: [0 | 1, 0 | 1] = [...s.pulserStates] as [0 | 1, 0 | 1];
      pulserStates[index] = pressed ? 1 : 0;
      return { pulserStates, ...recompute({ ...s, pulserStates }) };
    }),

  insertIC: (socketIndex, icId) =>
    set((s) => {
      const sockets = s.sockets.map((sock) =>
        sock.socketIndex === socketIndex ? { socketIndex, icId, internalState: {} } : sock
      );
      return { ...recompute({ ...s, sockets }) };
    }),

  startOrCompleteWire: (terminalId) =>
    set((s) => {
      if (!s.activeWireStart) return { activeWireStart: terminalId };
      if (s.activeWireStart === terminalId) return { activeWireStart: null };
      const exists = s.wires.some(
        (w) =>
          (w.from === s.activeWireStart && w.to === terminalId) ||
          (w.from === terminalId && w.to === s.activeWireStart)
      );
      if (exists) return { activeWireStart: null };
      const newWire: Wire = {
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: s.activeWireStart,
        to: terminalId,
      };
      const wires = [...s.wires, newWire];
      return {
        wires,
        activeWireStart: null,
        undoStack: [...s.undoStack.slice(-29), s.wires],
        redoStack: [],
        ...recompute({ ...s, wires }),
      };
    }),

  cancelWire: () => set({ activeWireStart: null }),

  removeWire: (wireId) =>
    set((s) => {
      const wires = s.wires.filter((w) => w.id !== wireId);
      return {
        wires,
        undoStack: [...s.undoStack.slice(-29), s.wires],
        redoStack: [],
        ...recompute({ ...s, wires }),
      };
    }),

  clearWires: () =>
    set((s) => ({
      wires: [],
      activeWireStart: null,
      undoStack: [...s.undoStack.slice(-29), s.wires],
      redoStack: [],
      ...recompute({ ...s, wires: [] }),
    })),

  resetBoard: () =>
    set((s) => {
      const sockets = createEmptySockets();
      const wires: Wire[] = [];
      return {
        wires,
        activeWireStart: null,
        undoStack: [...s.undoStack.slice(-29), s.wires],
        redoStack: [],
        ...recompute({ ...s, sockets, wires }),
      };
    }),

  undo: () =>
    set((s) => {
      if (s.undoStack.length === 0) return s;
      const previous = s.undoStack[s.undoStack.length - 1];
      const undoStack = s.undoStack.slice(0, -1);
      return {
        wires: previous,
        undoStack,
        redoStack: [...s.redoStack, s.wires],
        ...recompute({ ...s, wires: previous }),
      };
    }),

  redo: () =>
    set((s) => {
      if (s.redoStack.length === 0) return s;
      const next = s.redoStack[s.redoStack.length - 1];
      const redoStack = s.redoStack.slice(0, -1);
      return {
        wires: next,
        undoStack: [...s.undoStack, s.wires],
        redoStack,
        ...recompute({ ...s, wires: next }),
      };
    }),

  setHighlightedTerminals: (highlightedTerminals) => set({ highlightedTerminals }),

  loadCircuit: (socketDefs, wires) =>
    set((s) => {
      const sockets = createEmptySockets().map((sock) => {
        const match = socketDefs.find((d) => d.socketIndex === sock.socketIndex);
        return match ? { ...sock, icId: match.icId, internalState: {} } : sock;
      });
      return {
        wires,
        activeWireStart: null,
        undoStack: [],
        redoStack: [],
        ...recompute({ ...s, sockets, wires }),
      };
    }),

  saveCurrentCircuit: (name) => {
    const s = get();
    const entry: SavedCircuit = {
      id: `ckt-${Date.now()}`,
      name: name.trim() || 'Untitled Circuit',
      createdAt: new Date().toISOString(),
      sockets: s.sockets.map(({ socketIndex, icId }) => ({ socketIndex, icId })),
      wires: s.wires,
    };
    const next = [entry, ...s.savedCircuits];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    set({ savedCircuits: next });
  },

  deleteSavedCircuit: (id) => {
    const next = get().savedCircuits.filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    set({ savedCircuits: next });
  },

  hydrateSavedCircuits: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) set({ savedCircuits: JSON.parse(raw) });
    } catch {}
  },
}));
