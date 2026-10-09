import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  FileSpreadsheet,
  Check,
  Search,
} from 'lucide-react';

export const PayrollDeductionsView: React.FC = () => {
  const { workers, getWorkerStats } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const list = workers.map((worker) => {
    const stats = getWorkerStats(worker.id);
    const salary = worker.baseSalary || 3500;
    const costPerMinute = (salary / 30) / (8 * 60);
    const dailyWage = salary / 30;

    const tardyDeduction = Math.round(stats.totalDelayMinutes * costPerMinute * 100) / 100;
    const absenceDeduction = Math.round(stats.absentDays * dailyWage * 100) / 100;
    const totalDeduction = Math.round((tardyDeduction + absenceDeduction) * 100) / 100;
    const netSalary = Math.max(0, Math.round((salary - totalDeduction) * 100) / 100);

    return {
      worker,
      salary,
      costPerMinute,
      dailyWage,
      tardyMinutes: stats.totalDelayMinutes,
      tardyDays: stats.tardyDays,
      absentDays: stats.absentDays,
      tardyDeduction,
      absenceDeduction,
      totalDeduction,
      netSalary,
    };
  });

  const filteredList = list.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.worker.name.toLowerCase().includes(q) ||
      item.worker.dni.includes(q) ||
      item.worker.department.toLowerCase().includes(q)
    );
  });

  const grandTotalDeductions = list.reduce((a, b) => a + b.totalDeduction, 0);
  const grandTotalTardyMinutes = list.reduce((a, b) => a + b.tardyMinutes, 0);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
              <Calculator className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Módulo de Cálculo de Descuentos Referenciales de Planilla
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Liquidación preliminar de tardanzas acumuladas (Sueldo / 8h / 60min) e inasistencias para Recursos Humanos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>{downloadSuccess ? '¡Planilla Exportada!' : 'Exportar Planilla (CSV)'}</span>
        </button>
      </div>

      {/* Tarjetas KPI de Descuento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Descuentos Totales Computados
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-2">
            S/. {grandTotalDeductions.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Mes evaluado: Septiembre / Octubre 2026
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Minutos Totales de Tardanza
          </span>
          <span className="text-2xl font-bold font-mono text-amber-700 block mt-2">
            {grandTotalTardyMinutes} min
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Valorizados al costo por minuto de cada colaborador
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Fórmula Legal Aplicada
          </span>
          <span className="text-sm font-bold font-mono text-slate-800 block mt-2">
            (Sueldo / 30) / (8h × 60m)
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Conforme a directiva de control de asistencia
          </span>
        </div>
      </div>

      {/* Buscador y Tabla */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nombre, DNI o área..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Colaborador</th>
                <th className="py-3 px-2">DNI</th>
                <th className="py-3 px-3 text-right">Sueldo Base</th>
                <th className="py-3 px-3 text-right">Costo / Min</th>
                <th className="py-3 px-2 text-center">Min. Tardanza</th>
                <th className="py-3 px-3 text-right">Desc. Tardanza</th>
                <th className="py-3 px-2 text-center">Días Falta</th>
                <th className="py-3 px-3 text-right">Desc. Faltas</th>
                <th className="py-3 px-3 text-right">Total Descuento</th>
                <th className="py-3 px-3 text-right">Neto Referencial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredList.map((item) => (
                <tr key={item.worker.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{item.worker.name}</div>
                    <div className="text-[10px] text-slate-400">{item.worker.department}</div>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-600">{item.worker.dni}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    S/. {item.salary.toLocaleString('es-PE')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    S/. {item.costPerMinute.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-700">
                    {item.tardyMinutes}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                    S/. {item.tardyDeduction.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-700">
                    {item.absentDays}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                    S/. {item.absenceDeduction.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                    - S/. {item.totalDeduction.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                    S/. {item.netSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
