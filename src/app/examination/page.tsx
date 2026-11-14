'use client';

import React, { useEffect, useState } from 'react';
import { EXPERIMENTS } from '@/lib/experiments/data';
import { TrainerBoard } from '@/components/trainer/TrainerBoard';
import { useTrainerStore } from '@/store/useTrainerStore';
import { createTroubleshootingFault, evaluateCircuit, EvaluationResult } from '@/lib/examination/evaluator';
import { AlertTriangle, CheckCircle2, Clock, Play, Wrench } from 'lucide-react';

const EXAM_HISTORY_KEY = 'logiclab_exam_history_v1';

export default function ExaminationPage() {
  const { sockets, wires, resetBoard, loadCircuit } = useTrainerStore();
  const [phase, setPhase] = useState<'SETUP' | 'ACTIVE' | 'RESULT'>('SETUP');
  const [mode, setMode] = useState<'BUILD' | 'TROUBLESHOOT'>('BUILD');
  const [expId, setExpId] = useState<number>(3);
  const [durationMin, setDurationMin] = useState<number>(15);
  const [secondsLeft, setSecondsLeft] = useState<number>(900);
  const [faultHint, setFaultHint] = useState<string>('');
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const exp = EXPERIMENTS.find((e) => e.id === expId) ?? EXPERIMENTS[0];

  const startExam = () => {
    setSecondsLeft(durationMin * 60);
    setResult(null);
    if (mode === 'BUILD') {
      resetBoard();
      setFaultHint('');
    } else {
      const fault = createTroubleshootingFault(expId);
      loadCircuit(fault.sockets, fault.wires);
      setFaultHint(fault.faultHint);
    }
    setPhase('ACTIVE');
  };

  const handleSubmit = () => {
    const evalRes = evaluateCircuit(expId, sockets, wires);
    setResult(evalRes);
    setPhase('RESULT');
    if (typeof window !== 'undefined') {
      const prev = JSON.parse(localStorage.getItem(EXAM_HISTORY_KEY) || '[]');
      localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify([{ ...evalRes, mode, date: new Date().toISOString() }, ...prev].slice(0, 20)));
    }
  };

  useEffect(() => {
    if (phase !== 'ACTIVE') return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  const formatTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-5">
      {phase === 'SETUP' && (
        <div className="max-w-2xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-white">DECO Practical Examination Mode</h1>
            <p className="text-sm text-slate-400">Practice timed circuit construction or fault troubleshooting with automated truth-table evaluation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setMode('BUILD')} className={`p-4 rounded-xl border text-left transition ${mode === 'BUILD' ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-800 bg-slate-950'}`}>
              <Play className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-bold text-sm">Circuit Construction Exam</div>
              <p className="text-xs text-slate-400 mt-1">Start with an empty trainer board, insert ICs, and wire the complete circuit.</p>
            </button>
            <button onClick={() => setMode('TROUBLESHOOT')} className={`p-4 rounded-xl border text-left transition ${mode === 'TROUBLESHOOT' ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-950'}`}>
              <Wrench className="w-5 h-5 text-amber-400 mb-2" />
              <div className="font-bold text-sm">Troubleshooting Exam</div>
              <p className="text-xs text-slate-400 mt-1">Diagnose and repair a deliberately faulted circuit under time pressure.</p>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Select Experiment</label>
              <select value={expId} onChange={(e) => setExpId(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm">
                {EXPERIMENTS.map((e) => <option key={e.id} value={e.id}>Exp {e.id}: {e.shortTitle}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Duration</label>
              <select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm">
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
              </select>
            </div>
          </div>
          <button onClick={startExam} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white">Start Practical Examination</button>
        </div>
      )}

      {phase === 'ACTIVE' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div>
              <span className="text-xs uppercase font-bold text-sky-400">{mode === 'BUILD' ? 'Practical Task' : 'Troubleshooting Task'}</span>
              <h2 className="text-lg font-bold text-white">{exp.title}</h2>
              <p className="text-xs text-slate-400">{exp.aim}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-lg text-amber-400"><Clock className="w-4 h-4" />{formatTime(secondsLeft)}</div>
              <button onClick={() => { if (confirm('Submit your circuit for automated evaluation?')) handleSubmit(); }} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white">Submit Exam</button>
            </div>
          </div>
          {mode === 'TROUBLESHOOT' && (
            <div className="rounded-lg bg-amber-950/40 border border-amber-500/40 p-3 text-xs text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /><span>Fault injected: Find and repair the broken connection on the trainer board.</span>
            </div>
          )}
          <TrainerBoard />
        </div>
      )}

      {phase === 'RESULT' && result && (
        <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Examination Evaluation</h2>
              <p className="text-sm text-slate-400">{result.expTitle}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-emerald-400">{result.marksObtained} / {result.totalMarks}</div>
              <div className="text-xs text-slate-400">{Math.round((result.marksObtained / result.totalMarks) * 100)}% Score</div>
            </div>
          </div>
          <div className="space-y-2.5">
            {result.breakdown.map((b) => (
              <div key={b.criterion} className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-3.5">
                <div>
                  <div className="font-semibold text-sm text-white flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-sky-400" />{b.criterion}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{b.feedback}</p>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-400">{b.obtained} / {b.max}</span>
              </div>
            ))}
          </div>
          {faultHint && <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300"><strong>Troubleshooting Review:</strong> {faultHint}</div>}
          <div className="flex gap-3">
            <button onClick={() => setPhase('SETUP')} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-semibold text-white">Take Another Exam</button>
            <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold">Print Result</button>
          </div>
        </div>
      )}
    </div>
  );
}
