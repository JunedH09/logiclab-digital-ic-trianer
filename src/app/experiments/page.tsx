'use client';

import React, { useEffect, useState } from 'react';
import { EXPERIMENTS } from '@/lib/experiments/data';
import { TrainerBoard } from '@/components/trainer/TrainerBoard';
import { ReportGenerator } from '@/components/common/ReportGenerator';
import { useTrainerStore } from '@/store/useTrainerStore';
import { CheckCircle2, ChevronLeft, ChevronRight, Play, RotateCcw, Zap } from 'lucide-react';

export default function GuidedExperimentsPage() {
  const [selectedExpId, setSelectedExpId] = useState<number>(1);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const { loadCircuit, resetBoard, setHighlightedTerminals, snapshot } = useTrainerStore();
  const exp = EXPERIMENTS.find((e) => e.id === selectedExpId) ?? EXPERIMENTS[0];
  const currentStep = exp.steps[stepIndex];

  useEffect(() => {
    setStepIndex(0);
  }, [selectedExpId]);

  useEffect(() => {
    setHighlightedTerminals(currentStep?.highlightTerminals ?? []);
    return () => setHighlightedTerminals([]);
  }, [currentStep, setHighlightedTerminals]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Guided DECO Experiments (1–7)</h1>
          <p className="text-sm text-slate-400">Follow step-by-step wiring highlights or load the reference circuit to test live logic.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXPERIMENTS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedExpId(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                item.id === selectedExpId ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Exp {item.id}: {item.shortTitle}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
            <h2 className="text-base font-bold text-emerald-400">{exp.title}</h2>
            <p className="text-xs text-slate-300"><strong className="text-white">Aim:</strong> {exp.aim}</p>
            <p className="text-xs text-slate-400">{exp.theory}</p>
            <div className="pt-2 space-y-1">
              {exp.booleanEquations.map((eq, i) => (
                <div key={i} className="text-xs font-mono bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-sky-300">{eq}</div>
              ))}
            </div>
            <div className="pt-2"><ReportGenerator experiment={exp} /></div>
          </div>

          <div className="rounded-xl bg-slate-900 border border-sky-500/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Step {stepIndex + 1} of {exp.steps.length}</span>
              <div className="flex gap-1.5">
                <button disabled={stepIndex === 0} onClick={() => setStepIndex((s) => Math.max(0, s - 1))} className="p-1 rounded bg-slate-800 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={stepIndex === exp.steps.length - 1} onClick={() => setStepIndex((s) => Math.min(exp.steps.length - 1, s + 1))} className="p-1 rounded bg-slate-800 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-white">{currentStep?.title}</h3>
            <p className="text-sm text-slate-300">{currentStep?.instruction}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => loadCircuit(exp.presetSockets, exp.presetWires)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white">
                <Play className="w-3.5 h-3.5" /> Load Reference Circuit
              </button>
              <button onClick={() => resetBoard()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
                <RotateCcw className="w-3.5 h-3.5" /> Clear Board
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Expected Truth Table</h3>
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-xs font-mono text-center border-collapse">
                <thead className="sticky top-0 bg-slate-800 text-slate-200">
                  <tr>
                    {exp.truthTableHeaders.inputs.map((h) => <th key={h} className="p-1.5 border border-slate-700">{h}</th>)}
                    {exp.truthTableHeaders.outputs.map((h) => <th key={h} className="p-1.5 border border-slate-700 text-emerald-300">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {exp.truthTable.map((row, idx) => (
                    <tr key={idx} className="odd:bg-slate-950/60">
                      {exp.truthTableHeaders.inputs.map((h) => <td key={h} className="p-1 border border-slate-800">{row.inputs[h]}</td>)}
                      {exp.truthTableHeaders.outputs.map((h) => <td key={h} className="p-1 border border-slate-800 text-emerald-400 font-bold">{row.outputs[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-3">
          <TrainerBoard />
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              {snapshot.issues.length === 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle2 className="w-4 h-4" /> Circuit electrically valid — Live simulation active</span>
              ) : (
                <div className="space-y-1">
                  {snapshot.issues.map((issue) => (
                    <div key={issue.id} className={`flex items-center gap-1.5 ${issue.severity === 'ERROR' ? 'text-red-400' : 'text-amber-400'}`}>
                      <Zap className="w-3.5 h-3.5 shrink-0" /><span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
