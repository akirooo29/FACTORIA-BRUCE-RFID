import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  FileSpreadsheet,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const EconomicImpactView: React.FC = () => {
  const { workers, getWorkerStats } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Computar datos de Horas-Hombre por colaborador
  const workerImpactData = workers.map((worker) => {
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
  }).sort((a, b) => b.totalLostHours - a.totalLostHours);

  const totalCompanyTardyMinutes = workerImpactData.reduce((acc, curr) => acc + curr.tardyMinutes, 0);
  const totalCompanyAbsences = workerImpactData.reduce((acc, curr) => acc + curr.absentDays, 0);
  const totalCompanyLostHours = Math.round(
    workerImpactData.reduce((acc, curr) => acc + curr.totalLostHours, 0) * 10
  ) / 10;

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
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>⏱️</span>
              <span>Auditoría de Horas-Hombre Perdidas</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Monitoreo analítico del tiempo no laborado por tardanzas computadas e inasistencias para Gerencia General.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>{downloadSuccess ? '¡Exportado!' : 'Exportar Auditoría'}</span>
        </button>
      </div>

      {/* Tarjeta de Fórmula Corporativa */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-900">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Directiva de Productividad y Jornada Laboral (Normativa Interna)
          </span>
          <span className="text-[11px] font-mono bg-white px-2.5 py-0.5 rounded border border-slate-200">
            ⏱️ Fórmula: (Minutos Tardanza / 60) + (Faltas × 8h) = Horas-Hombre Perdidas
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Cada minuto de retraso sobre las 07:30:00 AM (hasta el límite de tolerancia de las 07:35:00 AM) se acumula como tiempo no laborado. Todo ingreso posterior a las 07:35:00 AM constituye puerta cerrada y se computa como 8 horas de falta laboral completa a menos que cuente con papeleta oficial autorizada.
        </p>
      </div>

      {/* Grid de Resumen de Productividad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Horas-Hombre Perdidas
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-2 flex items-center gap-1">
            <span>⏱️</span>
            <span>{totalCompanyLostHours.toFixed(1)} hrs</span>
          </span>
          <span className="text-[11px] text-rose-600 font-semibold block mt-1">
            Impacto acumulado en el período
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Minutos Totales de Tardanza
          </span>
          <span className="text-2xl font-bold font-mono text-amber-700 block mt-2">
            {totalCompanyTardyMinutes} min
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Equivalente a {(totalCompanyTardyMinutes / 60).toFixed(1)} hrs laborales
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Jornadas de Ausencia Sin Registro
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 block mt-2">
            {totalCompanyAbsences} jornadas
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Equivalente a {totalCompanyAbsences * 8} hrs no laboradas
          </span>
        </div>
      </div>

      {/* Tabla Desglosada por Colaborador */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Desglose de Horas Perdidas por Colaborador
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Ordenado por mayor tiempo no laborado
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-3">Cargo / Área</th>
                <th className="py-3 px-3 text-center">Minutos Tardanza</th>
                <th className="py-3 px-3 text-right">Horas Tardanza</th>
                <th className="py-3 px-3 text-center">Jornadas Falta</th>
                <th className="py-3 px-3 text-right">Horas Falta</th>
                <th className="py-3 px-3 text-center">Efectividad</th>
                <th className="py-3 px-4 text-right">⏱️ Total Horas Perdidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {workerImpactData.map((item) => (
                <tr key={item.worker.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.worker.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">DNI: {item.worker.dni}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div>{item.worker.position}</div>
                    <div className="text-[10px] text-slate-400">{item.worker.department}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                    {item.tardyMinutes} min
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {item.lostHoursFromTardiness.toFixed(1)} hrs
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                    {item.absentDays}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {item.lostHoursFromAbsence} hrs
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.effectiveness >= 90
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.effectiveness >= 75
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {item.effectiveness}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
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
