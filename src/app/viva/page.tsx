'use client';

import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';

interface VivaQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const VIVA_BANK: VivaQuestion[] = [
  { id: 1, category: 'Multiplexers', question: 'In IC 74151 (8:1 MUX), what logic level must be applied to the Strobe (Pin 7) to enable normal operation?', options: ['Logic HIGH (+5V)', 'Logic LOW (GND)', 'Clock Pulse', 'Floating'], correctIndex: 1, explanation: "Pin 7 (G') on IC 74151 is an active-low strobe; it must be tied to GND (0) to enable the multiplexer." },
  { id: 2, category: 'IC Pinouts', question: 'Which pins serve as VCC and GND on the 4-bit binary adder IC 7483?', options: ['VCC=16, GND=8', 'VCC=14, GND=7', 'VCC=5, GND=12', 'VCC=5, GND=10'], correctIndex: 2, explanation: 'IC 7483 uses non-standard center power pins: Pin 5 is VCC and Pin 12 is GND.' },
  { id: 3, category: 'Code Converters', question: 'What is the primary property of Gray Code that makes it useful in rotary encoders?', options: ['It is a weighted BCD code', 'Only one bit changes between consecutive values', 'It requires no XOR gates', 'It directly represents negative numbers'], correctIndex: 1, explanation: 'Gray code is a unit-distance (minimum-change) code where adjacent values differ by exactly one bit.' },
  { id: 4, category: 'Counters', question: 'To configure IC 7490 as a MOD-10 (Decade) counter, which two pins must be externally connected?', options: ['Pin 12 (QA) to Pin 1 (CKB)', 'Pin 11 (QD) to Pin 14 (CKA)', 'Pin 2 to Pin 5', 'Pin 8 to Pin 9'], correctIndex: 0, explanation: 'Cascading QA (Pin 12, MOD-2 output) into Input B (Pin 1, MOD-5 clock) produces a 2 × 5 = MOD-10 counter.' },
  { id: 5, category: 'Flip-Flops', question: 'In a clocked JK Flip-Flop, what happens on the active clock edge when J = 1 and K = 1?', options: ['Hold (No Change)', 'Reset to 0', 'Set to 1', "Toggle (Q becomes Q')"], correctIndex: 3, explanation: 'J=1, K=1 resolves the SR forbidden state by toggling the output Q to its complement.' },
];

export default function VivaPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const q = VIVA_BANK[index];
  const isFinished = index >= VIVA_BANK.length;

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    if (optIdx === q.correctIndex) setScore((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h1 className="text-xl font-bold flex items-center gap-2 text-white"><HelpCircle className="w-5 h-5 text-sky-400" /> DECO Viva Practice</h1>
          <span className="text-xs font-mono text-emerald-400">Score: {score} / {VIVA_BANK.length}</span>
        </div>
        {!isFinished ? (
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">{q.category} — Question {index + 1} of {VIVA_BANK.length}</span>
            <h2 className="text-base font-semibold text-white">{q.question}</h2>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIndex;
                const isPicked = i === selected;
                let style = 'bg-slate-950 border-slate-800 hover:border-slate-600';
                if (selected !== null) {
                  if (isCorrect) style = 'bg-emerald-950/50 border-emerald-500 text-emerald-200';
                  else if (isPicked) style = 'bg-red-950/50 border-red-500 text-red-200';
                }
                return (
                  <button key={i} onClick={() => handleSelect(i)} className={`w-full text-left p-3 rounded-xl border text-sm transition flex items-center justify-between ${style}`}>
                    <span>{opt}</span>
                    {selected !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {selected !== null && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-300 space-y-2">
                <p><strong className="text-sky-400">Explanation:</strong> {q.explanation}</p>
                <button onClick={() => { setIndex((i) => i + 1); setSelected(null); }} className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold">Next Question</button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <h2 className="text-2xl font-bold text-emerald-400">Viva Completed: {score} / {VIVA_BANK.length}</h2>
            <button onClick={() => { setIndex(0); setSelected(null); setScore(0); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold">
              <RotateCcw className="w-4 h-4" /> Restart Viva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
