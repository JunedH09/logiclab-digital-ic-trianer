'use client';

import React from 'react';
import { ExperimentDefinition } from '@/lib/experiments/data';
import { Download, Printer } from 'lucide-react';

export const ReportGenerator: React.FC<{ experiment: ExperimentDefinition }> = ({ experiment }) => {
  const exportCSV = () => {
    const headers = [
      ...experiment.truthTableHeaders.inputs,
      ...experiment.truthTableHeaders.outputs,
    ];
    const rows = experiment.truthTable.map((r) => [
      ...experiment.truthTableHeaders.inputs.map((h) => r.inputs[h]),
      ...experiment.truthTableHeaders.outputs.map((h) => r.outputs[h]),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LogicLab_Exp${experiment.id}_Observations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white"
      >
        <Printer className="w-3.5 h-3.5" /> Print / Save PDF Report
      </button>
      <button
        onClick={exportCSV}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
      >
        <Download className="w-3.5 h-3.5" /> Export Truth Table CSV
      </button>
    </div>
  );
};
