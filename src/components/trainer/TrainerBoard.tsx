'use client';

import React, { useEffect } from 'react';
import { useTrainerStore } from '@/store/useTrainerStore';
import { IC_REGISTRY } from '@/lib/ic/registry';
import { LogicState, TerminalId } from '@/lib/simulation/types';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  getTerminalPosition,
  PIN_PITCH,
  SOCKET_ORIGINS,
} from './boardLayout';

const INPUT_LABELS = ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3'];
const OUTPUT_LABELS = ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7'];

function signalColor(state: LogicState | undefined, hasError = false): string {
  if (hasError) return '#ef4444';
  if (state === 1) return '#22c55e';
  if (state === 0) return '#3b82f6';
  if (state === 'X') return '#f59e0b';
  return '#94a3b8';
}

export const TrainerBoard: React.FC<{ onSelectSocket?: (socketIndex: number) => void }> = ({
  onSelectSocket,
}) => {
  const {
    powerOn,
    inputSwitches,
    clockRunning,
    clockHz,
    pulserStates,
    sockets,
    wires,
    activeWireStart,
    highlightedTerminals,
    snapshot,
    togglePower,
    toggleInputSwitch,
    toggleClockRunning,
    stepClock,
    setPulser,
    startOrCompleteWire,
    removeWire,
  } = useTrainerStore();

  useEffect(() => {
    if (!clockRunning || !powerOn) return;
    const interval = setInterval(() => stepClock(), Math.round(500 / clockHz));
    return () => clearInterval(interval);
  }, [clockRunning, clockHz, powerOn, stepClock]);

  const errorTerminals = new Set(
    snapshot.issues.filter((i) => i.severity === 'ERROR').flatMap((i) => i.terminals)
  );

  const getPinCount = (termId: TerminalId): 14 | 16 => {
    if (!termId.startsWith('IC:')) return 14;
    const sockIdx = Number(termId.split(':')[1]);
    const icId = sockets[sockIdx]?.icId;
    return icId && IC_REGISTRY[icId] ? IC_REGISTRY[icId].pinCount : 14;
  };

  const renderTerminal = (id: TerminalId, cx: number, cy: number, label?: string) => {
    const isStart = activeWireStart === id;
    const isHighlighted = highlightedTerminals.includes(id);
    const state = snapshot.terminalStates[id];
    const hasErr = errorTerminals.has(id);

    return (
      <g
        key={id}
        onClick={(e) => {
          e.stopPropagation();
          startOrCompleteWire(id);
        }}
        className="cursor-pointer group"
      >
        <title>
          {id} {label ? `(${label})` : ''} — State: {state ?? 'Z'}
        </title>
        {(isStart || isHighlighted) && (
          <circle
            cx={cx}
            cy={cy}
            r={13}
            fill="none"
            stroke={isStart ? '#facc15' : '#38bdf8'}
            strokeWidth={2.5}
            className="animate-pulse"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={8.5}
          fill="#d1d5db"
          stroke={hasErr ? '#ef4444' : '#475569'}
          strokeWidth={2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={4.2}
          fill={state === undefined ? '#0f172a' : signalColor(state, hasErr)}
        />
      </g>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
      <svg
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        className="w-full h-auto min-w-[900px] select-none"
      >
        <rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT} rx={16} fill="#9a6b3e" />
        <rect
          x={14}
          y={14}
          width={BOARD_WIDTH - 28}
          height={BOARD_HEIGHT - 28}
          rx={10}
          fill="#0f5c3a"
          stroke="#14532d"
          strokeWidth={4}
        />

        <text x={40} y={46} fill="#e2e8f0" fontSize={16} fontWeight="bold" letterSpacing={1.5}>
          HI-TECH ELECTRONICS (PUNE) — DIT9006 DIGITAL IC TRAINER
        </text>
        <text x={BOARD_WIDTH - 240} y={46} fill="#bbf7d0" fontSize={13} fontFamily="monospace">
          LOGICLAB VIRTUAL ENGINE
        </text>

        {sockets.map((socket) => {
          const origin = SOCKET_ORIGINS[socket.socketIndex];
          const ic = socket.icId ? IC_REGISTRY[socket.icId] : null;
          const pinCount = ic?.pinCount ?? 14;
          const half = pinCount / 2;
          const bodyWidth = (half - 1) * PIN_PITCH + 40;

          return (
            <g key={socket.socketIndex}>
              <rect
                x={origin.x - 10}
                y={origin.y - 34}
                width={bodyWidth + 20}
                height={136}
                rx={6}
                fill="none"
                stroke="#86efac"
                strokeOpacity={0.35}
                strokeDasharray="4 3"
              />
              <text x={origin.x - 4} y={origin.y - 40} fill="#dcfce7" fontSize={11} fontFamily="monospace">
                SOCKET {socket.socketIndex + 1} {ic ? `[IC ${ic.id}]` : '[EMPTY]'}
              </text>

              <rect
                x={origin.x}
                y={origin.y}
                width={bodyWidth}
                height={68}
                rx={5}
                fill="#1d4ed8"
                stroke="#1e3a8a"
                strokeWidth={2}
                onClick={() => onSelectSocket?.(socket.socketIndex)}
                className="cursor-pointer hover:brightness-110"
              />

              {ic ? (
                <g onClick={() => onSelectSocket?.(socket.socketIndex)} className="cursor-pointer">
                  <rect
                    x={origin.x + 10}
                    y={origin.y + 10}
                    width={bodyWidth - 20}
                    height={48}
                    rx={3}
                    fill="#1e293b"
                    stroke="#64748b"
                  />
                  <path
                    d={`M ${origin.x + 10} ${origin.y + 26} A 7 7 0 0 1 ${origin.x + 10} ${origin.y + 42}`}
                    fill="#475569"
                  />
                  <text
                    x={origin.x + bodyWidth / 2}
                    y={origin.y + 39}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize={15}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    SN74LS{ic.id.slice(2)} ({ic.id})
                  </text>
                </g>
              ) : (
                <text
                  x={origin.x + bodyWidth / 2}
                  y={origin.y + 39}
                  textAnchor="middle"
                  fill="#bfdbfe"
                  fontSize={12}
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  CLICK TO INSERT IC
                </text>
              )}

              {Array.from({ length: pinCount }, (_, idx) => {
                const pinNum = idx + 1;
                const termId = `IC:${socket.socketIndex}:${pinNum}`;
                const pos = getTerminalPosition(termId, pinCount)!;
                const pinMeta = ic?.pins.find((p) => p.pin === pinNum);
                return (
                  <g key={termId}>
                    {renderTerminal(termId, pos.x, pos.y, pinMeta?.name)}
                    <text
                      x={pos.x}
                      y={pinNum <= half ? pos.y + 20 : pos.y - 12}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize={9.5}
                      fontFamily="monospace"
                    >
                      {pinMeta ? `${pinNum}:${pinMeta.name}` : pinNum}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        <g>
          <rect x={40} y={445} width={320} height={285} rx={8} fill="#0b462c" stroke="#86efac" strokeOpacity={0.4} />
          <text x={60} y={472} fill="#f8fafc" fontSize={12} fontWeight="bold">POWER ON</text>
          <g onClick={togglePower} className="cursor-pointer">
            <rect x={60} y={484} width={44} height={24} rx={12} fill={powerOn ? '#16a34a' : '#475569'} />
            <circle cx={powerOn ? 92 : 72} cy={496} r={9} fill="#f8fafc" />
          </g>
          <circle cx={124} cy={496} r={7} fill={powerOn ? '#ef4444' : '#3f1d1d'} stroke="#991b1b" />
          <circle cx={90} cy={550} r={14} fill="#dc2626" stroke="#7f1d1d" strokeWidth={2} />
          <text x={72} y={580} fill="#e2e8f0" fontSize={11}>FUSE</text>

          <text x={160} y={472} fill="#f8fafc" fontSize={12} fontWeight="bold">CLOCK ({clockHz}Hz)</text>
          <g onClick={toggleClockRunning} className="cursor-pointer">
            <rect x={155} y={595} width={60} height={24} rx={4} fill={clockRunning ? '#2563eb' : '#334155'} />
            <text x={185} y={611} textAnchor="middle" fill="#fff" fontSize={11}>
              {clockRunning ? 'STOP' : 'START'}
            </text>
          </g>
          {renderTerminal('CLK:0', 185, 515, 'CLK')}
          {renderTerminal('CLK:1', 185, 565, 'CLK')}

          <text x={240} y={472} fill="#f8fafc" fontSize={12} fontWeight="bold">MANUAL PULSER</text>
          {[0, 1].map((idx) => {
            const x = idx === 0 ? 255 : 325;
            const active = pulserStates[idx as 0 | 1] === 1;
            return (
              <g key={idx}>
                {renderTerminal(`PULSE:${idx}:POS`, x, 505, `P${idx + 1}+`)}
                <circle
                  cx={x}
                  cy={540}
                  r={14}
                  fill={active ? '#ef4444' : '#b91c1c'}
                  stroke="#fecaca"
                  strokeWidth={2}
                  className="cursor-pointer"
                  onMouseDown={() => setPulser(idx as 0 | 1, true)}
                  onMouseUp={() => setPulser(idx as 0 | 1, false)}
                  onMouseLeave={() => setPulser(idx as 0 | 1, false)}
                />
                {renderTerminal(`PULSE:${idx}:NEG`, x, 575, `P${idx + 1}-`)}
              </g>
            );
          })}

          <text x={60} y={685} fill="#fca5a5" fontSize={12} fontWeight="bold">+5V VCC</text>
          {Array.from({ length: 5 }, (_, i) => renderTerminal(`VCC:${i}`, 80 + i * 36, 705, '+5V'))}
        </g>

        <g>
          <rect x={380} y={445} width={340} height={285} rx={8} fill="#0b462c" stroke="#86efac" strokeOpacity={0.4} />
          <text x={550} y={472} textAnchor="middle" fill="#f8fafc" fontSize={13} fontWeight="bold">
            8 BIT DATA INPUT (A0–A3, B0–B3)
          </text>
          {inputSwitches.map((val, i) => {
            const x = 410 + i * 38;
            const isHigh = val === 1;
            return (
              <g key={i}>
                {renderTerminal(`IN:${i}`, x, 505, INPUT_LABELS[i])}
                <text x={x} y={530} textAnchor="middle" fill="#dcfce7" fontSize={11} fontFamily="monospace">
                  {INPUT_LABELS[i]}
                </text>
                <circle cx={x} cy={554} r={7} fill={powerOn && isHigh ? '#ef4444' : '#3f1d1d'} stroke="#991b1b" />
                <g onClick={() => toggleInputSwitch(i)} className="cursor-pointer">
                  <rect x={x - 11} y={578} width={22} height={46} rx={5} fill="#1e293b" stroke="#94a3b8" />
                  <rect x={x - 8} y={isHigh ? 582 : 602} width={16} height={18} rx={3} fill={isHigh ? '#22c55e' : '#64748b'} />
                </g>
                <text x={x} y={644} textAnchor="middle" fill="#f8fafc" fontSize={12} fontFamily="monospace">
                  {isHigh ? '1' : '0'}
                </text>
              </g>
            );
          })}
        </g>

        <g>
          <rect x={740} y={445} width={420} height={285} rx={8} fill="#0b462c" stroke="#86efac" strokeOpacity={0.4} />
          <text x={950} y={472} textAnchor="middle" fill="#f8fafc" fontSize={13} fontWeight="bold">
            8 BIT DATA OUTPUT &amp; 7-SEGMENT DISPLAY
          </text>
          {snapshot.outputBits.map((val, i) => {
            const x = 770 + i * 38;
            const isHigh = powerOn && val === 1;
            return (
              <g key={i}>
                {renderTerminal(`OUT:${i}`, x, 505, OUTPUT_LABELS[i])}
                <text x={x} y={530} textAnchor="middle" fill="#dcfce7" fontSize={11} fontFamily="monospace">
                  {OUTPUT_LABELS[i]}
                </text>
                <circle cx={x} cy={558} r={8} fill={isHigh ? '#22c55e' : '#14532d'} stroke="#86efac" />
              </g>
            );
          })}

          {[snapshot.sevenSegLeft, snapshot.sevenSegRight].map((digit, idx) => (
            <g key={idx} transform={`translate(${780 + idx * 72}, 590)`}>
              <rect width={56} height={76} rx={6} fill="#09090b" stroke="#475569" strokeWidth={2} />
              <text
                x={28}
                y={52}
                textAnchor="middle"
                fill={powerOn && digit !== null ? '#ef4444' : '#3f1d1d'}
                fontSize={40}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {powerOn && digit !== null ? digit.toString(16).toUpperCase() : '-'}
              </text>
            </g>
          ))}

          <text x={960} y={685} fill="#93c5fd" fontSize={12} fontWeight="bold">GND (0V)</text>
          {Array.from({ length: 5 }, (_, i) => renderTerminal(`GND:${i}`, 960 + i * 36, 705, 'GND'))}
        </g>

        <g>
          {wires.map((wire) => {
            const p1 = getTerminalPosition(wire.from, getPinCount(wire.from));
            const p2 = getTerminalPosition(wire.to, getPinCount(wire.to));
            if (!p1 || !p2) return null;
            const state = snapshot.terminalStates[wire.from];
            const hasErr = errorTerminals.has(wire.from) || errorTerminals.has(wire.to);
            const stroke = signalColor(state, hasErr);
            const midX = (p1.x + p2.x) / 2;
            const sag = Math.min(80, Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.22);
            const pathD = `M ${p1.x} ${p1.y} Q ${midX} ${Math.max(p1.y, p2.y) + sag} ${p2.x} ${p2.y}`;

            return (
              <g
                key={wire.id}
                onClick={(e) => {
                  e.stopPropagation();
                  removeWire(wire.id);
                }}
                className="cursor-pointer group"
              >
                <title>Click to remove wire ({wire.from} ↔ {wire.to})</title>
                <path d={pathD} fill="none" stroke="#020617" strokeWidth={6} strokeLinecap="round" opacity={0.45} />
                <path
                  d={pathD}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  className="group-hover:stroke-red-400 transition-colors"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
