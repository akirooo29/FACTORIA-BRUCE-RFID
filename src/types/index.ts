export type WorkerType = 'EMPLEADO_INTERNO' | 'CONTRATISTA';

export type WorkerStatus = 'ACTIVO' | 'INACTIVO' | 'EN_OBSERVACION' | 'BLOQUEADO';

export type ScanType = 'ENTRADA' | 'SALIDA';

export type ScanStatus = 'AUTORIZADO' | 'DENEGADO' | 'FUERA_DE_TURNO' | 'NO_REGISTRADO';

// Attendance rules:
// - A_TIEMPO: ≤ 07:30:00 AM
// - TARDANZA_DESCUENTO: 07:30:01 AM a 07:35:00 AM (Permite ingreso, se descuenta en base a [Sueldo / 8h / 60min])
// - PUERTA_CERRADA: > 07:35:00 AM (Falta por defecto; ingreso requiere Autorización de Ingreso Fuera de Tolerancia por Jefe de Planta o Gerente General)
// - JUSTIFICADO: Día con permiso, comisión, descanso médico o vacación (no reduce efectividad)
export type AttendancePunctuality =
  | 'A_TIEMPO'
  | 'TARDANZA_DESCUENTO'
  | 'PUERTA_CERRADA'
  | 'FALTA'
  | 'JUSTIFICADO';

export type ThemeMode = 'light' | 'dark';

// 10 Motivos normativos exactos de Papeletas Oficiales
export type PaperSlipMotive =
  | 'DESCANSO_MEDICO'
  | 'ATENCION_MEDICA'
  | 'PERMISO_PERSONAL'
  | 'COMISION_SERVICIO'
  | 'ONOMASTICO'
  | 'VACACIONES'
  | 'CAPACITACION'
  | 'OMISION_MARCADO'
  | 'INGRESO_FUERA_TOLERANCIA'
  | 'COMPENSACION_HORAS';

export interface Worker {
  id: string;
  code: string;
  name: string;
  dni: string;
  email: string;
  phone: string;
  type: WorkerType;
  department: string;
  position: string;
  rfidTag: string;
  status: WorkerStatus;
  avatarUrl: string;
  baseSalary?: number;
  // Specific fields for internal employees
  hireDate?: string;
  vacationDaysAvailable?: number;
  // Specific fields for contractors
  contractorCompany?: string;
  contractExpiry?: string;
  sctrStatus?: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';
  projectAssigned?: string;
  supervisorName?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerType: WorkerType;
  workerPosition: string;
  workerDepartment: string;
  contractorCompany?: string;
  avatarUrl: string;
  rfidTag: string;
  timestamp: string; // ISO format
  timeFormatted: string;
  dateFormatted: string;
  scanType: ScanType;
  status: ScanStatus;
  punctuality?: AttendancePunctuality;
  delayMinutes?: number;
  terminalId: string;
  terminalLocation: string;
  notes?: string;
  // Authorization when entry is past 07:35 AM
  toleranceAuthorizationDoc?: string;
  authorizedBy?: 'JEFE_PLANTA' | 'GERENTE_GENERAL';
}

export interface DailyAttendanceSummary {
  date: string; // YYYY-MM-DD
  dayName: string;
  dayNumber: number;
  isWorkday: boolean;
  status: AttendancePunctuality;
  checkInTime?: string;
  checkOutTime?: string;
  delayMinutes: number;
  notes?: string;
  slipMotive?: PaperSlipMotive;
  authorizedBy?: 'JEFE_PLANTA' | 'GERENTE_GENERAL';
  authorizationDocId?: string;
}

export interface WorkerMonthlyStats {
  workerId: string;
  month: string; // e.g. "Septiembre 2026"
  totalWorkdays: number;
  attendedDays: number;
  punctualDays: number; // ≤ 07:30:00
  tardyDays: number; // 07:30:01 a 07:35:00
  absentDays: number; // Injustificadas o > 07:35 sin autorización
  justifiedDays: number; // Permisos, descansos, comisiones (no reducen efectividad)
  totalDelayMinutes: number;
  leavesCount: number; // Cantidad de permisos tomados
  leavesPercentageOfMonth: number; // % del mes que representan los permisos
  effectivenessPercentage: number;
  baseSalary: number;
  calculatedSalary: number;
  salaryDeduction: number;
  tardyDeduction: number;
  absenceDeduction: number;
  dailyLogs: DailyAttendanceSummary[];
}

export interface PaperSlipRecord {
  id: string;
  folioNumber: string; // Correlativo físico ej: PAP-2026-0042
  workerId: string;
  workerName: string;
  workerPosition: string;
  workerDni: string;
  workerType: WorkerType;
  motive: PaperSlipMotive;
  reason: string; // Justificación / texto libre
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  totalHoursRequested: number;
  totalDaysRequested: number;
  // Special handling for "Permiso Personal Sin Contraprestación"
  personalCompensationType?: 'DESCUENTO_PLANILLA' | 'COMPENSAR_HORAS';
  // Special handling for "Autorización de Ingreso Fuera de Tolerancia"
  approvalAuthority?: 'JEFE_PLANTA' | 'GERENTE_GENERAL';
  status: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  submittedDate: string;
  documentUrl?: string;
}

export interface VacationProgress {
  hireDate: string;
  currentDate: string;
  daysEmployed: number;
  daysRequiredForYear: number; // 365
  progressPercentage: number;
  isEligibleFor30Days: boolean;
  daysRemainingUntilYear: number;
  vacationDaysAvailable: number;
}

export interface VacationNotification {
  id: string;
  workerId: string;
  workerName: string;
  workerPosition: string;
  type: 'ELIGIBLE_NOW' | 'UPCOMING_30_DAYS';
  message: string;
  date: string;
  read: boolean;
}

export interface RequestItem {
  id: string;
  workerId: string;
  workerName: string;
  workerType: WorkerType;
  type: 'VACACIONES' | 'PERMISO' | 'DESCANSO_MEDICO';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  submittedDate: string;
  documentUrl?: string;
}
