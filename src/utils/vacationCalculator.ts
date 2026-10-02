import type { VacationProgress } from '../types';

/**
 * REGLA ESTRICTA DE VACACIONES (365 DÍAS DE LEY):
 * - Los trabajadores en planilla deben tener al menos 365 días continuos de labor para habilitar vacaciones (30 días).
 * - Si tienen menos de 365 días:
 *     vacationDaysAvailable = 0
 *     statusLabel = "No habilitado"
 *     isEligible = false
 * - Si tienen 365 días o más:
 *     vacationDaysAvailable = 30 (o saldo restante disponible)
 *     statusLabel = "Habilitado"
 *     isEligible = true
 * - Personal contratista tercerizado: No aplica ("No aplica - Contratista").
 */

// Fecha de referencia del sistema (Septiembre 2026 en el contexto de la empresa)
export const SYSTEM_CURRENT_DATE_STR = '2026-09-30';
export const SYSTEM_CURRENT_DATE = new Date(2026, 8, 30); // 30 Sept 2026

/**
 * Calcula los días calendario trabajados desde la fecha de ingreso hasta la fecha de referencia.
 */
export function calculateWorkedDays(
  fechaIngresoStr?: string,
  referenceDate: Date = SYSTEM_CURRENT_DATE
): number {
  if (!fechaIngresoStr) return 0;
  
  // Limpiar y parsear formato YYYY-MM-DD
  const parts = fechaIngresoStr.split('-');
  if (parts.length !== 3) {
    const parsed = new Date(fechaIngresoStr);
    if (isNaN(parsed.getTime())) return 0;
    const diff = referenceDate.getTime() - parsed.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const hireDate = new Date(year, month, day);

  const diffMs = referenceDate.getTime() - hireDate.getTime();
  if (diffMs <= 0) return 0;

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export interface VacationAudit {
  fechaIngreso: string;
  daysEmployed: number;
  daysRequired: number; // 365
  daysRemainingUntilYear: number;
  progressPercentage: number;
  isEligibleFor30Days: boolean;
  vacationDaysAvailable: number; // 0 o 30
  statusLabel: 'Habilitado' | 'No habilitado' | 'No aplica';
  badgeColorClass: string;
  displaySummary: string;
}

/**
 * Función centralizada que evalúa las vacaciones de un colaborador cumpliendo estrictamente la regla de 365 días.
 */
export function evaluateWorkerVacation(
  worker: {
    type?: string;
    fecha_ingreso?: string;
    hireDate?: string;
    vacationDaysAvailable?: number;
  },
  referenceDate: Date = SYSTEM_CURRENT_DATE
): VacationAudit {
  const hireDateStr = worker.fecha_ingreso || worker.hireDate || SYSTEM_CURRENT_DATE_STR;

  // 1. Personal Contratista
  if (worker.type === 'CONTRATISTA') {
    const daysEmployed = calculateWorkedDays(hireDateStr, referenceDate);
    return {
      fechaIngreso: hireDateStr,
      daysEmployed,
      daysRequired: 365,
      daysRemainingUntilYear: 0,
      progressPercentage: 0,
      isEligibleFor30Days: false,
      vacationDaysAvailable: 0,
      statusLabel: 'No aplica',
      badgeColorClass: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      displaySummary: 'No aplica (Contratista)',
    };
  }

  // 2. Personal en Planilla Interna
  const daysEmployed = calculateWorkedDays(hireDateStr, referenceDate);
  const daysRequired = 365;
  const isEligible = daysEmployed >= daysRequired;
  const daysRemaining = Math.max(0, daysRequired - daysEmployed);
  const progressPercentage = Math.min(100, Math.floor((daysEmployed / daysRequired) * 100));

  if (!isEligible) {
    // REGLA ESTRICTA: < 365 días -> Explícitamente 0 días y "No habilitado"
    return {
      fechaIngreso: hireDateStr,
      daysEmployed,
      daysRequired,
      daysRemainingUntilYear: daysRemaining,
      progressPercentage,
      isEligibleFor30Days: false,
      vacationDaysAvailable: 0, // Cero estricto
      statusLabel: 'No habilitado',
      badgeColorClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      displaySummary: `0 días (No habilitado - Faltan ${daysRemaining} días)`,
    };
  }

  // Supera o iguala el año (>= 365 días)
  const daysAvailable =
    worker.vacationDaysAvailable !== undefined && worker.vacationDaysAvailable > 0
      ? worker.vacationDaysAvailable
      : 30;

  return {
    fechaIngreso: hireDateStr,
    daysEmployed,
    daysRequired,
    daysRemainingUntilYear: 0,
    progressPercentage: 100,
    isEligibleFor30Days: true,
    vacationDaysAvailable: daysAvailable,
    statusLabel: 'Habilitado',
    badgeColorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    displaySummary: `${daysAvailable} días disponibles (Habilitado)`,
  };
}

/**
 * Adapter para VacationProgress (componentes de progreso visual)
 */
export function getVacationProgressFromWorker(
  worker: {
    type?: string;
    fecha_ingreso?: string;
    hireDate?: string;
    vacationDaysAvailable?: number;
  },
  referenceDate: Date = SYSTEM_CURRENT_DATE
): VacationProgress {
  const audit = evaluateWorkerVacation(worker, referenceDate);
  return {
    hireDate: audit.fechaIngreso,
    currentDate: SYSTEM_CURRENT_DATE_STR,
    daysEmployed: audit.daysEmployed,
    daysRequiredForYear: audit.daysRequired,
    progressPercentage: audit.progressPercentage,
    isEligibleFor30Days: audit.isEligibleFor30Days,
    daysRemainingUntilYear: audit.daysRemainingUntilYear,
    vacationDaysAvailable: audit.vacationDaysAvailable,
    statusLabel: audit.statusLabel,
  };
}
