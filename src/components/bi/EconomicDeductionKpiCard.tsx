import React from 'react';
import { Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import type { Worker } from '../../types';

interface EconomicDeductionKpiCardProps {
  workers?: Worker[];
  accumulatedMinutes?: number;
  unjustifiedAbsenceDays?: number;
  totalImpact?: number;
  tardinessCost?: number;
  absenceCost?: number;
  totalLostHours?: number;
  tardinessHours?: number;
  absenceHours?: number;
  periodLabel?: string;
}

export const EconomicDeductionKpiCard: React.FC<EconomicDeductionKpiCardProps> = ({
  accumulatedMinutes = 0,
  unjustifiedAbsenceDays = 0,
  totalLostHours,
  tardinessHours,
  absenceHours,
  periodLabel = 'Acumulado Período',
}) => {
  // Equivalencia en horas:
  // Tardanzas: minutos / 60
  // Faltas: días de falta * 8 horas
  const calculatedTardyHours = tardinessHours !== undefined
    ? tardinessHours
    : Math.round((accumulatedMinutes / 60) * 10) / 10;

  const calculatedAbsenceHours = absenceHours !== undefined
    ? absenceHours
    : unjustifiedAbsenceDays * 8;

  const totalManHoursLost = totalLostHours !== undefined
    ? totalLostHours
    : Math.round((calculatedTardyHours + calculatedAbsenceHours) * 10) / 10;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Indicador de Fondo Sutil */}
      <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-slate-50 rounded-full pointer-events-none -z-0"></div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Business Intelligence • Productividad de Planta
              </span>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>⏱️</span>
                <span>Horas-Hombre Perdidas</span>
              </h3>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
            {periodLabel}
          </span>
        </div>

        {/* Cifra Principal */}
        <div className="pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight flex items-center gap-1.5">
              <span>⏱️</span>
              <span>{totalManHoursLost.toFixed(1)} hrs</span>
            </span>
            <span className="text-xs font-semibold text-rose-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Tiempo no laborado
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Impacto acumulado en productividad por tardanzas computadas y jornadas no laboradas por faltas.
          </p>
        </div>

        {/* Desglose de Factores */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 space-y-0.5">
            <span className="text-[10px] text-amber-900 block flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-amber-700" />
              Tardanzas ({accumulatedMinutes} min):
            </span>
            <span className="font-mono font-bold text-amber-950 block text-sm">
              ⏱️ {calculatedTardyHours.toFixed(1)} hrs
            </span>
            <span className="text-[9px] text-amber-700/80 block font-mono">
              Equivalente en jornada laboral
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200/80 space-y-0.5">
            <span className="text-[10px] text-rose-900 block flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3 text-rose-700" />
              Ausencias ({unjustifiedAbsenceDays} jornadas):
            </span>
            <span className="font-mono font-bold text-rose-950 block text-sm">
              ⏱️ {calculatedAbsenceHours.toFixed(1)} hrs
            </span>
            <span className="text-[9px] text-rose-700/80 block font-mono">
              Calculado a 8 hrs por jornada
            </span>
          </div>
        </div>

        {/* Fórmula de Productividad */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>⏱️ Fórmula: (Minutos Tardanza / 60) + (Faltas × 8 hrs)</span>
          <span className="font-bold text-slate-700">Auditoría 100% Productividad</span>
        </div>
      </div>
    </div>
  );
};
