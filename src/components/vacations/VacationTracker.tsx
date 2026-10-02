import React from 'react';
import { evaluateWorkerVacation } from '../../utils/vacationCalculator';
import { Calendar, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface VacationTrackerProps {
  hireDate?: string;
  vacationDaysAvailable?: number;
  workerName: string;
  workerType?: string;
  onRequestVacation?: () => void;
}

/**
 * Componente de Rastreo de Vacaciones - Regla Estricta de 365 Días
 * Si días trabajados < 365:
 *   - Muestra explícitamente "0 Días" y estado "No habilitado".
 * Si días trabajados >= 365:
 *   - Habilita los 30 días de ley del D.L. 713.
 */
export const VacationTracker: React.FC<VacationTrackerProps> = ({
  hireDate,
  vacationDaysAvailable,
  workerName,
  workerType = 'EMPLEADO_INTERNO',
  onRequestVacation,
}) => {
  const audit = evaluateWorkerVacation({
    type: workerType,
    fecha_ingreso: hireDate,
    hireDate,
    vacationDaysAvailable,
  });

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Control de Antigüedad & Habilitación Vacacional
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Colaborador: <strong className="text-slate-700 dark:text-slate-300">{workerName}</strong> | Fecha de Ingreso: <strong className="font-mono">{audit.fechaIngreso}</strong> ({audit.daysEmployed} días trabajados)
            </p>
          </div>
        </div>

        {/* Badge de Estado Legal */}
        {audit.isEligibleFor30Days ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Habilitado (≥ 365 días)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>No habilitado (Faltan {audit.daysRemainingUntilYear} días)</span>
          </span>
        )}
      </div>

      {/* Barra de Progreso hacia los 365 Días */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Progreso legal de cómputo para goce de vacaciones (Regla de los 365 días):
          </span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            {audit.progressPercentage}% ({Math.min(365, audit.daysEmployed)} / 365 días)
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              audit.isEligibleFor30Days
                ? 'bg-emerald-600 dark:bg-emerald-500'
                : 'bg-amber-500 dark:bg-amber-400'
            }`}
            style={{ width: `${audit.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Métricas en Grid Minimalista */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Tarjeta 1: Días de Ley */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
            Días de Vacaciones de Ley
          </span>
          <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
            {audit.isEligibleFor30Days ? '30 Días' : '0 Días (No habilitado)'}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">D.L. 713 Régimen Laboral</p>
        </div>

        {/* Tarjeta 2: Saldo Disponible */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
            Saldo Disponible para Goce
          </span>
          <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
            {audit.isEligibleFor30Days ? `${audit.vacationDaysAvailable} Días` : '0 Días'}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {audit.isEligibleFor30Days
              ? 'Habilitado para programación'
              : 'Requiere cumplir el año'}
          </p>
        </div>

        {/* Tarjeta 3: Acción o Estado */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Período Mínimo Legal
            </span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              7 Días (1 Semana)
            </span>
            <p className="text-[10px] text-slate-400">Fraccionamiento oficial</p>
          </div>

          {onRequestVacation && audit.isEligibleFor30Days && (
            <button
              type="button"
              onClick={onRequestVacation}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Programar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
