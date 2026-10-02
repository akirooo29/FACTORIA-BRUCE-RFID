import React from 'react';
import { DollarSign, ShieldCheck } from 'lucide-react';

interface EffectivenessGaugeProps {
  effectivenessPercentage: number;
  baseSalary: number;
  salaryDeduction: number;
  tardyDeduction: number;
  absenceDeduction: number;
  calculatedSalary: number;
  punctualDays: number;
  tardyDays: number;
  absentDays: number;
  justifiedDays: number;
  totalDelayMinutes: number;
}

export const EffectivenessGauge: React.FC<EffectivenessGaugeProps> = ({
  effectivenessPercentage,
  baseSalary,
  salaryDeduction,
  tardyDeduction,
  absenceDeduction,
  calculatedSalary,
  punctualDays,
  tardyDays,
  absentDays,
  justifiedDays,
  totalDelayMinutes,
}) => {
  // SVG Radial Circle Calculation
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (effectivenessPercentage / 100) * circumference;

  const getLevelInfo = (pct: number) => {
    if (pct >= 95) {
      return {
        label: 'Sobresaliente (100% Puntuación)',
        description: 'Cumplimiento óptimo de horario y asistencia de turno.',
        badge: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
      };
    }
    if (pct >= 85) {
      return {
        label: 'Aceptable (Deducción Leve)',
        description: 'Tardanzas aisladas dentro de margen tolerable.',
        badge: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
      };
    }
    if (pct >= 70) {
      return {
        label: 'Regular (Afectación Salarial)',
        description: 'Tardanzas acumuladas y necesidad de regularización.',
        badge: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900',
      };
    }
    return {
      label: 'Crítico (En Observación RRHH)',
      description: 'Faltas no autorizadas o ingresos fuera de tolerancia.',
      badge: 'bg-rose-700 text-white dark:bg-rose-900 dark:text-rose-100',
    };
  };

  const level = getLevelInfo(effectivenessPercentage);

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gráfico de Rendimiento
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Porcentaje de Efectividad Mensual
            </h4>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${level.badge}`}>
            {level.label.split(' ')[0]}
          </span>
        </div>

        {/* Circular Donut Gauge SVG */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 transform -rotate-90">
              {/* Background Inactive Track */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              {/* Active Progress Arc */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-slate-900 dark:text-slate-100 transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>

            {/* Inner Percentage Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                {effectivenessPercentage}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Efectividad
              </span>
            </div>
          </div>

          <div className="text-center mt-3 space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {level.label}
            </p>
            <p className="text-xs text-slate-500 max-w-xs">
              {level.description}
            </p>
          </div>
        </div>

        {/* Breakdown Tags */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">A tiempo</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{punctualDays} d</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Tardanzas</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{tardyDays} d</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Permisos (Neutral)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{justifiedDays} d</span>
          </div>
        </div>

        {/* Notice of Protected Permits */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-white shrink-0 mt-0.5" />
          <span>
            <strong>Regla Operativa Aplicada:</strong> Los <strong>{justifiedDays} días de permiso o descanso</strong> no se contabilizan negativamente para proteger el índice de efectividad del colaborador.
          </span>
        </div>
      </div>

      {/* Salary Settlement Calculation Box */}
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <DollarSign className="w-4 h-4" />
            <span>Liquidación Salarial Mensual</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold">
            Fórmula Legal
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Sueldo Base Registrado:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            S/ {baseSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            Descuento Tardanzas ({totalDelayMinutes} min):
            <span className="text-[10px] text-slate-400" title="[Sueldo / 8h / 60min]">[S/8h/60m]</span>
          </span>
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
            - S/ {tardyDeduction.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Descuento Inasistencias ({absentDays} días):</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
            - S/ {absenceDeduction.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {salaryDeduction > 0 && (
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
            <span>Total Deducciones:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
              - S/ {salaryDeduction.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white">Remuneración Computable:</span>
          <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
            S/ {calculatedSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
