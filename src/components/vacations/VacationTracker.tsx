import React from 'react';
import { calculateVacationProgress } from '../../data/mockData';
import { Palmtree, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface VacationTrackerProps {
  hireDate?: string;
  vacationDaysAvailable?: number;
  workerName: string;
  onRequestVacation?: () => void;
}

export const VacationTracker: React.FC<VacationTrackerProps> = ({
  hireDate,
  vacationDaysAvailable,
  workerName,
  onRequestVacation,
}) => {
  const progress = calculateVacationProgress(hireDate, vacationDaysAvailable);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
            <Palmtree className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Gestión de Antigüedad & Habilitación Vacacional
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Colaborador: <strong>{workerName}</strong> | Ingreso: <strong>{progress.hireDate}</strong> ({progress.daysEmployed} días acumulados)
            </p>
          </div>
        </div>

        {progress.isEligibleFor30Days ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Apto: 30 Días Habilitados</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Faltan {progress.daysRemainingUntilYear} días para 1 año</span>
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-600 dark:text-zinc-400 font-medium">
            Progreso para cumplir 1 año de contrato (365 días):
          </span>
          <span className="font-mono font-bold text-zinc-900 dark:text-white">
            {progress.progressPercentage}% ({progress.daysEmployed} / 365 días)
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
          <div
            className="h-full bg-black dark:bg-white rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Detail Footer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
            Días de Vacaciones de Ley
          </span>
          <span className="font-mono text-lg font-black text-zinc-900 dark:text-white">
            {progress.isEligibleFor30Days ? '30 Días' : 'En proceso'}
          </span>
          <p className="text-[10px] text-zinc-400 mt-0.5">D.L. 713 Régimen Laboral</p>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
            Saldo Disponible para Goce
          </span>
          <span className="font-mono text-lg font-black text-zinc-900 dark:text-white">
            {progress.vacationDaysAvailable} Días
          </span>
          <p className="text-[10px] text-zinc-400 mt-0.5">Fraccionable (Mínimo 7 días)</p>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
              Período Mínimo Legal
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white">
              1 Semana (7 Días)
            </span>
            <p className="text-[10px] text-zinc-400">Restricción en solicitud</p>
          </div>

          {onRequestVacation && progress.isEligibleFor30Days && (
            <button
              type="button"
              onClick={onRequestVacation}
              className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0"
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
