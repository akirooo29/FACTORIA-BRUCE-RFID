import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  Calculator,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

export const EconomicImpactView: React.FC = () => {
  const { workers, getWorkerStats } = useApp();
  const [showSalaries, setShowSalaries] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Computar datos por colaborador
  const workerImpactData = workers.map((worker) => {
    const stats = getWorkerStats(worker.id);
    const salary = worker.baseSalary || 3500;
    // Fórmula: Sueldo / 8h / 60min
    const costPerMinute = (salary / 30) / (8 * 60);
    const costPerHour = (salary / 30) / 8;
    const dailyWage = salary / 30;

    const tardyCost = Math.round(stats.totalDelayMinutes * costPerMinute * 100) / 100;
    const absenceCost = Math.round(stats.absentDays * dailyWage * 100) / 100;
    const totalImpact = Math.round((tardyCost + absenceCost) * 100) / 100;

    return {
      worker,
      salary,
      costPerMinute,
      costPerHour,
      dailyWage,
      tardyMinutes: stats.totalDelayMinutes,
      tardyDays: stats.tardyDays,
      absentDays: stats.absentDays,
      tardyCost,
      absenceCost,
      totalImpact,
      effectiveness: stats.effectivenessPercentage,
    };
  }).sort((a, b) => b.totalImpact - a.totalImpact);

  const totalCompanyImpact = workerImpactData.reduce((acc, curr) => acc + curr.totalImpact, 0);
  const totalCompanyTardyMinutes = workerImpactData.reduce((acc, curr) => acc + curr.tardyMinutes, 0);
  const totalCompanyAbsences = workerImpactData.reduce((acc, curr) => acc + curr.absentDays, 0);

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
              <DollarSign className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Impacto Económico Referencial de Tardanzas & Ausentismo
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Monitoreo analítico del costo monetario de las horas de jornada no laboradas para Gerencia General.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSalaries(!showSalaries)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              showSalaries ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {showSalaries ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSalaries ? 'Ocultar Sueldos Base' : 'Ver Sueldos Base'}</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span>{downloadSuccess ? '¡Exportado!' : 'Exportar Auditoría'}</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Fórmula Corporativa */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-900">
          <span className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-slate-700" />
            Directiva de Liquidación de Tardanzas (Normativa Interna)
          </span>
          <span className="text-[11px] font-mono bg-white px-2.5 py-0.5 rounded border border-slate-200">
            Fórmula: Sueldo / 8h / 60min = Costo por minuto
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Cada minuto de retraso sobre las 07:30:00 AM (hasta el límite de tolerancia de las 07:35:00 AM) se valoriza multiplicando los minutos computados por el cociente salarial de la jornada de 8 horas. Todo ingreso posterior a las 07:35:00 AM constituye puerta cerrada y genera falta salarial a menos que cuente con papeleta oficial autorizada.
        </p>
      </div>

      {/* Grid de Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Impacto Económico Total del Mes
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-2">
            S/. {totalCompanyImpact.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-rose-600 font-semibold block mt-1">
            Descuento computable acumulado
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
            Equivalente a {(totalCompanyTardyMinutes / 60).toFixed(1)} horas hombre
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Jornadas de Ausencia Sin Registro
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 block mt-2">
            {totalCompanyAbsences} días
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Puerta cerrada o inasistencia no justificada
          </span>
        </div>
      </div>

      {/* Tabla Desglosada por Colaborador */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Desglose Financiero por Colaborador
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Ordenado por mayor impacto económico
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-3">Cargo / Área</th>
                {showSalaries && <th className="py-3 px-3 text-right">Sueldo Base</th>}
                <th className="py-3 px-3 text-right">Costo / Minuto</th>
                <th className="py-3 px-3 text-center">Minutos Tardanza</th>
                <th className="py-3 px-3 text-right">Desc. Tardanza</th>
                <th className="py-3 px-3 text-center">Días Falta</th>
                <th className="py-3 px-3 text-right">Desc. Faltas</th>
                <th className="py-3 px-4 text-right">Impacto Total (S/.)</th>
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
                  {showSalaries && (
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      S/. {item.salary.toLocaleString('es-PE')}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    S/. {item.costPerMinute.toFixed(3)}/min
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                    {item.tardyMinutes} min
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">
                    S/. {item.tardyCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                    {item.absentDays}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">
                    S/. {item.absenceCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                    S/. {item.totalImpact.toFixed(2)}
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
