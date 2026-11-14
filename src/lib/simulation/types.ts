export type LogicState = 0 | 1 | 'X' | 'Z';

export type PinDirection = 'INPUT' | 'OUTPUT' | 'VCC' | 'GND' | 'NC';

export interface PinDefinition {
  pin: number;
  name: string;
  direction: PinDirection;
  description?: string;
}

export interface ICDefinition {
  id: string;
  name: string;
  category: 'GATE' | 'MUX' | 'ARITHMETIC' | 'COUNTER';
  pinCount: 14 | 16;
  description: string;
  vccPin: number;
  gndPin: number;
  pins: PinDefinition[];
  evaluate: (
    inputs: Record<number, LogicState>,
    prevState: Record<string, any>
  ) => {
    outputs: Record<number, LogicState>;
    nextState: Record<string, any>;
  };
}

export interface SocketState {
  socketIndex: number;
  icId: string | null;
  internalState: Record<string, any>;
}

export type TerminalId = string;

export interface Wire {
  id: string;
  from: TerminalId;
  to: TerminalId;
  color?: string;
}

export interface ValidationIssue {
  id: string;
  severity: 'ERROR' | 'WARNING';
  code:
    | 'SHORT_CIRCUIT'
    | 'OUTPUT_CONFLICT'
    | 'MISSING_VCC'
    | 'MISSING_GND'
    | 'FLOATING_INPUT'
    | 'POWER_OFF';
  message: string;
  terminals: TerminalId[];
}

export interface SimulationSnapshot {
  terminalStates: Record<TerminalId, LogicState>;
  issues: ValidationIssue[];
  outputBits: LogicState[];
  sevenSegLeft: number | null;
  sevenSegRight: number | null;
}
