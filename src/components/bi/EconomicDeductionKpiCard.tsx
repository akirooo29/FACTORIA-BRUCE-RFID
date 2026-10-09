import { DollarSign, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import type { Worker } from '../../types';

interface EconomicDeductionKpiCardProps {
  workers: Worker[];
  accumulatedMinutes?: number;
  unjustifiedAbsenceDays?: number;
}

export const EconomicDeductionKpiCard: React.FC<EconomicDeductionKpiCardProps> = ({
  workers,
  accumulatedMinutes = 818,
  unjustifiedAbsenceDays = 8,
}) => {
  // Calculamos el costo referencial real ponderado
  // Fórmula requerida: (Sueldo / 8h / 60min = costo por minuto)
  const workersWithSalary = workers.filter((w) => Boolean(w.baseSalary));
  const avgSalary = workersWithSalary.length > 0
    ? workersWithSalary.reduce((acc, w) => acc + (w.baseSalary || 0), 0) / workersWithSalary.length
    : 3400;

  // Costo por minuto promedio de la empresa: (avgSalary / 30 días) / (8 horas * 60 minutos)
  const avgCostPerMinute = (avgSalary / 30) / (8 * 60);
  const tardinessDeduction = Math.round(accumulatedMinutes * avgCostPerMinute * 100) / 100;
  
  // Costo por día de ausencia: (avgSalary / 30 días)
  const avgDailyWage = avgSalary / 30;
  const absenceDeduction = Math.round(unjustifiedAbsenceDays * avgDailyWage * 100) / 100;

  const totalDeductionImpact = tardinessDeduction + absenceDeduction;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Indicador de Fondo Sutil */}
      <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-slate-50 rounded-full pointer-events-none -z-0"></div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Business Intelligence • Impacto Financiero
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Cálculo Referencial de Descuentos
              </h3>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
            Acumulado Octubre 2026
          </span>
        </div>

        {/* Cifra Principal */}
        <div className="pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              S/. {totalDeductionImpact.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-rose-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Retención computable
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Impacto económico de tardanzas computadas e inasistencias en el mes en curso.
          </p>
        </div>

        {/* Desglose de Factores */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5">
            <span className="text-[10px] text-slate-500 block flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-amber-600" />
              Tardanzas ({accumulatedMinutes} min):
            </span>
            <span className="font-mono font-bold text-slate-900 block text-sm">
              S/. {tardinessDeduction.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">
              ~S/. {avgCostPerMinute.toFixed(3)} / min prom.
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5">
            <span className="text-[10px] text-slate-500 block flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              Ausencias ({unjustifiedAbsenceDays} jornadas):
            </span>
            <span className="font-mono font-bold text-slate-900 block text-sm">
              S/. {absenceDeduction.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">
              ~S/. {avgDailyWage.toFixed(2)} / día prom.
            </span>
          </div>
        </div>

        {/* Fórmula Normativa */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Fórmula: Sueldo / 8h / 60min</span>
          <span className="font-bold text-slate-700">{workersWithSalary.length} sueldos auditados</span>
        </div>
      </div>
    </div>
  );
};
