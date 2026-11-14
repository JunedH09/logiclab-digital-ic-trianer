'use client';

import React, { useState } from 'react';
import { IC_REGISTRY } from '@/lib/ic/registry';
import { Cpu, Search } from 'lucide-react';

export default function ICLibraryPage() {
  const allICs = Object.values(IC_REGISTRY);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(allICs[0].id);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);

  const filtered = allICs.filter(
    (ic) => ic.id.toLowerCase().includes(search.toLowerCase()) || ic.name.toLowerCase().includes(search.toLowerCase())
  );

  const ic = IC_REGISTRY[selectedId] ?? allICs[0];
  const half = ic.pinCount / 2;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Cpu className="w-6 h-6 text-sky-400" /> IC Library &amp; Datasheet Pinout Viewer</h1>
          <p className="text-xs text-slate-400">Hover over any pin to inspect its function, direction, and power assignment.</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter IC (e.g. 7483, 7490)..." className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-2 max-h-[540px] overflow-y-auto">
          {filtered.map((item) => (
            <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full text-left p-3 rounded-xl border transition ${item.id === ic.id ? 'bg-sky-950/40 border-sky-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-400">IC {item.id}</span>
                <span className="text-xs text-slate-400">{item.pinCount}-pin DIP</span>
              </div>
              <div className="text-xs text-slate-200 mt-0.5">{item.name}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">SN74LS{ic.id.slice(2)} ({ic.id}) — {ic.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{ic.description}</p>
            <div className="flex gap-4 mt-2 text-xs font-mono">
              <span className="text-red-400">VCC: Pin {ic.vccPin}</span>
              <span className="text-sky-400">GND: Pin {ic.gndPin}</span>
              <span className="text-slate-400">Package: {ic.pinCount}-Pin DIP</span>
            </div>
          </div>

          <svg viewBox="0 0 640 240" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800">
            <rect x={60} y={70} width={520} height={100} rx={8} fill="#1e293b" stroke="#64748b" strokeWidth={2} />
            <path d="M 60 105 A 15 15 0 0 1 60 135" fill="#475569" />
            <text x={320} y={126} textAnchor="middle" fill="#f8fafc" fontSize={22} fontFamily="monospace" fontWeight="bold">IC {ic.id}</text>
            {ic.pins.map((p) => {
              const isBottom = p.pin <= half;
              const col = isBottom ? p.pin - 1 : ic.pinCount - p.pin;
              const x = 95 + col * (450 / (half - 1));
              const isHovered = hoveredPin === p.pin;
              const fill = p.direction === 'VCC' ? '#ef4444' : p.direction === 'GND' ? '#3b82f6' : p.direction === 'OUTPUT' ? '#22c55e' : '#94a3b8';
              return (
                <g key={p.pin} onMouseEnter={() => setHoveredPin(p.pin)} onMouseLeave={() => setHoveredPin(null)} className="cursor-pointer">
                  <rect x={x - 10} y={isBottom ? 170 : 52} width={20} height={18} rx={3} fill={isHovered ? '#facc15' : fill} />
                  <text x={x} y={isBottom ? 208 : 40} textAnchor="middle" fill={isHovered ? '#facc15' : '#e2e8f0'} fontSize={11} fontFamily="monospace">{p.pin}:{p.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
