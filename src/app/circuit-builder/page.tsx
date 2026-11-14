'use client';

import React, { useEffect, useState } from 'react';
import { TrainerBoard } from '@/components/trainer/TrainerBoard';
import { useTrainerStore } from '@/store/useTrainerStore';
import { IC_REGISTRY } from '@/lib/ic/registry';
import { Cpu, Download, Redo2, Save, Search, Trash2, Undo2, Upload } from 'lucide-react';

const CHALLENGES = [
  '2-Input AND Gate (IC 7408)',
  'Half Adder (7486 + 7408)',
  'Full Adder (7486 + 7408 + 7432)',
  '4:1 MUX (74153)',
  '4-Bit Binary-to-Gray (7486)',
  '4-Bit Parallel Adder (7483)',
  'MOD-10 Decade Counter (7490)',
];

export default function CircuitBuilderPage() {
  const {
    sockets, wires, undoStack, redoStack, insertIC, undo, redo, clearWires, resetBoard,
    saveCurrentCircuit, savedCircuits, loadCircuit, deleteSavedCircuit, hydrateSavedCircuits,
  } = useTrainerStore();

  const [selectedSocket, setSelectedSocket] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [circuitName, setCircuitName] = useState('');

  useEffect(() => {
    resetBoard();
    hydrateSavedCircuits();
  }, [resetBoard, hydrateSavedCircuits]);

  const filteredICs = Object.values(IC_REGISTRY).filter(
    (ic) => ic.id.toLowerCase().includes(search.toLowerCase()) || ic.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportJSON = () => {
    const payload = JSON.stringify({ name: circuitName || 'LogicLab-Circuit', sockets: sockets.map(({ socketIndex, icId }) => ({ socketIndex, icId })), wires }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(circuitName || 'logiclab-circuit').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.sockets) && Array.isArray(parsed.wires)) {
          loadCircuit(parsed.sockets, parsed.wires);
          setCircuitName(parsed.name ?? '');
        }
      } catch {
        alert('Invalid LogicLab JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Circuit Building Mode</h1>
          <p className="text-xs text-slate-400">Select a socket, insert ICs, click any two metallic terminals to wire, and click a wire to remove it.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={undo} disabled={undoStack.length === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-xs disabled:opacity-40"><Undo2 className="w-3.5 h-3.5" /> Undo</button>
          <button onClick={redo} disabled={redoStack.length === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-xs disabled:opacity-40"><Redo2 className="w-3.5 h-3.5" /> Redo</button>
          <button onClick={clearWires} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs">Clear Wires</button>
          <button onClick={resetBoard} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs text-red-200"><Trash2 className="w-3.5 h-3.5" /> Reset All</button>
          <button onClick={handleExportJSON} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-xs"><Download className="w-3.5 h-3.5" /> Export JSON</button>
          <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 space-y-4">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-1.5 text-emerald-400"><Cpu className="w-4 h-4" /> IC Drawer (Socket {selectedSocket + 1})</h2>
              <button onClick={() => insertIC(selectedSocket, null)} className="text-xs text-red-400 hover:underline">Remove IC</button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search 7400, 7483, 7490..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs" />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {filteredICs.map((ic) => (
                <button key={ic.id} onClick={() => insertIC(selectedSocket, ic.id)} className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-sky-400">IC {ic.id}</span>
                    <span className="text-[10px] text-slate-400">{ic.pinCount}-pin</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{ic.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase text-slate-400">Save / Load Workspace</h3>
            <div className="flex gap-2">
              <input value={circuitName} onChange={(e) => setCircuitName(e.target.value)} placeholder="Circuit name..." className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs" />
              <button onClick={() => { saveCurrentCircuit(circuitName); setCircuitName(''); }} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
            {savedCircuits.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                {savedCircuits.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                    <button onClick={() => loadCircuit(c.sockets, c.wires)} className="truncate text-sky-300 hover:underline text-left flex-1">{c.name}</button>
                    <button onClick={() => deleteSavedCircuit(c.id)} className="text-slate-500 hover:text-red-400 ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase text-amber-400">Build-It-Yourself Challenges</h3>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {CHALLENGES.map((ch) => <li key={ch}>{ch}</li>)}
            </ul>
          </div>
        </div>
        <div className="xl:col-span-9"><TrainerBoard onSelectSocket={(idx) => setSelectedSocket(idx)} /></div>
      </div>
    </div>
  );
}
