import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';

interface EffectivenessKPIsProps {
  attendedDays: number;
  totalWorkdays: number;
  absentDays: number;
  totalDelayMinutes: number;
  tardyDays: number;
  leavesCount: number;
  leavesPercentageOfMonth: number;
  baseSalary: number;
}

export const EffectivenessKPIs: React.FC<EffectivenessKPIsProps> = ({
  attendedDays,
  totalWorkdays,
  absentDays,
  totalDelayMinutes,
  tardyDays,
  leavesCount,
  leavesPercentageOfMonth,
  baseSalary,
}) => {
  // Deduction calculation: [Sueldo / 8h / 60min]
  const costPerMinute = (baseSalary / 30) / (8 * 60);
  const totalTardyDeduction = (totalDelayMinutes * costPerMinute).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Días Asistidos */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Días Asistidos
          </span>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {attendedDays}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {totalWorkdays} laborales
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Presencia física en planta</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {Math.round((attendedDays / Math.max(1, totalWorkdays)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Faltas */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Faltas Registradas
          </span>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {absentDays}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {absentDays === 1 ? 'jornada' : 'jornadas'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Descuento inasistencia</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              - S/ {((absentDays * baseSalary) / 30).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Minutos Totales Acumulados de Tardanza */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Minutos de Tardanza
          </span>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {totalDelayMinutes}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              min ({tardyDays} {tardyDays === 1 ? 'día' : 'días'})
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span title="Cálculo exacto: [Sueldo / 8h / 60min]">Descuento computable:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              - S/ {totalTardyDeduction}
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Cantidad de Permisos Tomados (% del mes) */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Permisos / Descansos
          </span>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {leavesCount}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {leavesPercentageOfMonth}% del mes
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Impacto en Efectividad:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              Protegido (0% penalidad)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
