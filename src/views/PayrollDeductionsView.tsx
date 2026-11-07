import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
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
    const lostHoursFromTardiness = Math.round((stats.totalDelayMinutes / 60) * 10) / 10;
    const lostHoursFromAbsence = stats.absentDays * 8;
    const totalLostHours = Math.round((lostHoursFromTardiness + lostHoursFromAbsence) * 10) / 10;

    return {
      worker,
      tardyMinutes: stats.totalDelayMinutes,
      tardyDays: stats.tardyDays,
      absentDays: stats.absentDays,
      lostHoursFromTardiness,
      lostHoursFromAbsence,
      totalLostHours,
      effectiveness: stats.effectivenessPercentage,
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

  const grandTotalLostHours = Math.round(
    list.reduce((a, b) => a + b.totalLostHours, 0) * 10
  ) / 10;
  const grandTotalTardyMinutes = list.reduce((a, b) => a + b.tardyMinutes, 0);
  const grandTotalAbsenceDays = list.reduce((a, b) => a + b.absentDays, 0);

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
            <span className="p-2 rounded-lg bg-slate-900 text-white shadow-xs">
              <Clock className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>⏱️</span>
              <span>Auditoría Operativa de Tiempos Perdidos</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Control de minutos no laborados por tardanzas e inasistencias para auditoría interna.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>{downloadSuccess ? '¡Reporte Exportado!' : 'Exportar Auditoría (CSV)'}</span>
        </button>
      </div>

      {/* Tarjetas KPI de Horas Perdidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Horas-Hombre Perdidas
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-2 flex items-center gap-1">
            <span>⏱️</span>
            <span>{grandTotalLostHours.toFixed(1)} hrs</span>
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Período evaluado: Octubre 2026
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Tardanzas Acumuladas
          </span>
          <span className="text-2xl font-bold font-mono text-amber-700 block mt-2">
            {grandTotalTardyMinutes} min
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            ~{(grandTotalTardyMinutes / 60).toFixed(1)} horas de jornada laboral
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Ausencias Sin Registro
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 block mt-2">
            {grandTotalAbsenceDays} jornadas
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            ~{grandTotalAbsenceDays * 8} horas no laboradas
          </span>
        </div>
      </div>

      {/* Buscador y Tabla */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar colaborador..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <span className="text-xs text-slate-500">
            {filteredList.length} registros auditados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Colaborador</th>
                <th className="py-2.5 px-3">Área / Puesto</th>
                <th className="py-2.5 px-3 text-center">Minutos Tardanza</th>
                <th className="py-2.5 px-3 text-right">Horas Tardanza</th>
                <th className="py-2.5 px-3 text-center">Jornadas Falta</th>
                <th className="py-2.5 px-3 text-right">Horas Falta</th>
                <th className="py-2.5 px-3 text-center">Efectividad</th>
                <th className="py-2.5 px-3 text-right">⏱️ Total Horas Perdidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.map((item) => (
                <tr key={item.worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{item.worker.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">DNI: {item.worker.dni}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-800 block">{item.worker.position}</span>
                    <span className="text-[10px] text-slate-400">{item.worker.department}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                    {item.tardyMinutes} min
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {item.lostHoursFromTardiness.toFixed(1)} hrs
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">
                    {item.absentDays}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {item.lostHoursFromAbsence} hrs
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.effectiveness >= 90
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {item.effectiveness}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                    ⏱️ {item.totalLostHours.toFixed(1)} hrs
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
