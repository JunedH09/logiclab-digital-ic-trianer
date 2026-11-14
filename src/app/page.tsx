'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EXPERIMENTS } from '@/lib/experiments/data';
import { IC_REGISTRY } from '@/lib/ic/registry';
import { BookOpen, Cpu, GraduationCap, HelpCircle, Wrench } from 'lucide-react';

export default function DashboardPage() {
  const [savedCount, setSavedCount] = useState(0);
  const [examCount, setExamCount] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('logiclab_saved_circuits_v1') || '[]');
      const exams = JSON.parse(localStorage.getItem('logiclab_exam_history_v1') || '[]');
      setSavedCount(saved.length);
      setExamCount(exams.length);
    } catch {}
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 lg:p-8">
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
          DECO Virtual Laboratory • HI-TECH DIT9006
        </span>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white mt-2">
          LogicLab Digital Electronics Trainer
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mt-2">
          Build real TTL circuits on an interactive 6-socket Digital IC Trainer Kit, verify all seven DECO
          practical experiments, troubleshoot faults, and attempt timed practical examinations.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'DECO Experiments', value: EXPERIMENTS.length },
            { label: 'Datasheet ICs', value: Object.keys(IC_REGISTRY).length },
            { label: 'Saved Circuits', value: savedCount },
            { label: 'Exams Attempted', value: examCount },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Primary Learning Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/experiments" className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 p-6 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">Guided Experiments</h3>
            <p className="text-xs text-slate-400">Step-by-step instructions, pin highlights, truth tables, and live simulation for Experiments 1–7.</p>
          </Link>
          <Link href="/circuit-builder" className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 p-6 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center"><Wrench className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-400">Circuit Building Mode</h3>
            <p className="text-xs text-slate-400">Clean 6-socket workspace with searchable IC drawer, patch-cord wiring, undo/redo, and JSON export.</p>
          </Link>
          <Link href="/examination" className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 p-6 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400">Examination Mode</h3>
            <p className="text-xs text-slate-400">Timed practical tasks and troubleshooting fault exams with automated partial-mark evaluation.</p>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/ic-library" className="flex items-center gap-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 transition">
          <Cpu className="w-8 h-8 text-sky-400 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-white">IC Library &amp; Pinout Viewer</h3>
            <p className="text-xs text-slate-400">Inspect 14-pin &amp; 16-pin DIP diagrams, VCC/GND locations, and logic functions for all 11 ICs.</p>
          </div>
        </Link>
        <Link href="/viva" className="flex items-center gap-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 transition">
          <HelpCircle className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-white">Viva &amp; Quiz Practice</h3>
            <p className="text-xs text-slate-400">Test conceptual mastery of MUX, Gray code, 7483 adders, flip-flops, and 7490 counters.</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
