import type {
  Worker,
  AttendanceRecord,
  DailyAttendanceSummary,
  WorkerMonthlyStats,
  PaperSlipRecord,
  VacationProgress,
  VacationNotification,
  RequestItem,
} from '../types';

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'W-001',
    code: 'FBR-1001',
    name: 'Ing. Carlos Mendoza Silva',
    dni: '45892134',
    email: 'carlos.mendoza@factoriabruce.com',
    phone: '+51 984 512 301',
    type: 'EMPLEADO_INTERNO',
    department: 'Operaciones & Planta',
    position: 'Jefe de Operaciones Mecánicas',
    rfidTag: 'RFID-984210',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    baseSalary: 4800,
    hireDate: '2021-03-15',
    vacationDaysAvailable: 18,
  },
  {
    id: 'W-002',
    code: 'FBR-1002',
    name: 'Lic. Mariana Vega Ríos',
    dni: '47620193',
    email: 'mariana.vega@factoriabruce.com',
    phone: '+51 971 230 491',
    type: 'EMPLEADO_INTERNO',
    department: 'Recursos Humanos',
    position: 'Coordinadora de Talento y Bienestar',
    rfidTag: 'RFID-112340',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    baseSalary: 3800,
    hireDate: '2022-01-10',
    vacationDaysAvailable: 12,
  },
  {
    id: 'W-003',
    code: 'FBR-1003',
    name: 'Jorge Luis Huamán Prado',
    dni: '41209384',
    email: 'jorge.huaman@factoriabruce.com',
    phone: '+51 965 881 204',
    type: 'EMPLEADO_INTERNO',
    department: 'Mantenimiento & Torno',
    position: 'Técnico Especialista CNC',
    rfidTag: 'RFID-883192',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    baseSalary: 3200,
    hireDate: '2020-08-01',
    vacationDaysAvailable: 24,
  },
  {
    id: 'W-004',
    code: 'FBR-1004',
    name: 'Valeria Quispe Paredes',
    dni: '70291834',
    email: 'valeria.quispe@factoriabruce.com',
    phone: '+51 943 002 918',
    type: 'EMPLEADO_INTERNO',
    department: 'Control de Calidad',
    position: 'Supervisora QA/QC Metalúrgico',
    rfidTag: 'RFID-449120',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    baseSalary: 3600,
    // Hired 352 days ago (2025-10-01) - near 1-year threshold (96% progress towards 30 days)
    hireDate: '2025-10-01',
    vacationDaysAvailable: 0,
  },
  {
    id: 'W-005',
    code: 'FBR-1005',
    name: 'Ing. Renzo Chávez Meléndez',
    dni: '42819034',
    email: 'renzo.chavez@factoriabruce.com',
    phone: '+51 977 410 892',
    type: 'EMPLEADO_INTERNO',
    department: 'Operaciones & Planta',
    position: 'Ingeniero de Procesos y Soldadura',
    rfidTag: 'RFID-229104',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    baseSalary: 4200,
    // Hired 6 months ago (2026-03-15) - 50% progress towards 1-year vacation entitlement
    hireDate: '2026-03-15',
    vacationDaysAvailable: 0,
  },
  {
    id: 'W-006',
    code: 'CNT-2001',
    name: 'Roberto Benítez Alarcón',
    dni: '38910245',
    email: 'r.benitez@electromec-norte.pe',
    phone: '+51 955 410 293',
    type: 'CONTRATISTA',
    department: 'Mantenimiento Eléctrico',
    position: 'Técnico de Alta Tensión Externo',
    rfidTag: 'RFID-772109',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    baseSalary: 2900,
    contractorCompany: 'Electromecánica del Norte S.A.C.',
    contractExpiry: '2026-12-31',
    sctrStatus: 'VIGENTE',
    projectAssigned: 'Modernización de Subestación Eléctrica 2',
    supervisorName: 'Ing. Carlos Mendoza Silva',
  },
  {
    id: 'W-007',
    code: 'CNT-2002',
    name: 'Patricia Gómez Chumpitaz',
    dni: '48201948',
    email: 'pgomez@segurservicios.com',
    phone: '+51 988 321 009',
    type: 'CONTRATISTA',
    department: 'Seguridad y Medio Ambiente (HSE)',
    position: 'Auditora HSE Externa',
    rfidTag: 'RFID-665421',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    baseSalary: 3100,
    contractorCompany: 'SegurServicio Industrial Corp',
    contractExpiry: '2026-10-15',
    sctrStatus: 'VIGENTE',
    projectAssigned: 'Auditoría Anual Norma ISO 45001',
    supervisorName: 'Lic. Mariana Vega Ríos',
  },
  {
    id: 'W-008',
    code: 'CNT-2003',
    name: 'Diego Fernando Morales Torres',
    dni: '46718290',
    email: 'diego.morales@techlogix.pe',
    phone: '+51 941 772 884',
    type: 'CONTRATISTA',
    department: 'Tecnología & Redes',
    position: 'Ingeniero de Infraestructura IoT / RFID',
    rfidTag: 'RFID-338901',
    status: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    baseSalary: 3500,
    contractorCompany: 'TechLogix Soluciones Digitales',
    contractExpiry: '2026-11-30',
    sctrStatus: 'VIGENTE',
    projectAssigned: 'Despliegue de Antenas RFID UHF en Puertas 1-4',
    supervisorName: 'Ing. Carlos Mendoza Silva',
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-901',
    workerId: 'W-001',
    workerName: 'Ing. Carlos Mendoza Silva',
    workerType: 'EMPLEADO_INTERNO',
    workerPosition: 'Jefe de Operaciones Mecánicas',
    workerDepartment: 'Operaciones & Planta',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rfidTag: 'RFID-984210',
    timestamp: '2026-09-18T07:22:15',
    timeFormatted: '07:22:15 AM',
    dateFormatted: '18/09/2026',
    scanType: 'ENTRADA',
    status: 'AUTORIZADO',
    punctuality: 'A_TIEMPO',
    delayMinutes: 0,
    terminalId: 'TRM-01',
    terminalLocation: 'Puerta Principal - Torniquete A',
    notes: 'Ingreso puntual a tiempo (≤ 07:30:00 AM)',
  },
  {
    id: 'ATT-902',
    workerId: 'W-002',
    workerName: 'Lic. Mariana Vega Ríos',
    workerType: 'EMPLEADO_INTERNO',
    workerPosition: 'Coordinadora de Talento y Bienestar',
    workerDepartment: 'Recursos Humanos',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    rfidTag: 'RFID-112340',
    timestamp: '2026-09-18T07:28:04',
    timeFormatted: '07:28:04 AM',
    dateFormatted: '18/09/2026',
    scanType: 'ENTRADA',
    status: 'AUTORIZADO',
    punctuality: 'A_TIEMPO',
    delayMinutes: 0,
    terminalId: 'TRM-01',
    terminalLocation: 'Puerta Principal - Torniquete A',
    notes: 'Ingreso puntual a tiempo (≤ 07:30:00 AM)',
  },
  {
    id: 'ATT-903',
    workerId: 'W-003',
    workerName: 'Jorge Luis Huamán Prado',
    workerType: 'EMPLEADO_INTERNO',
    workerPosition: 'Técnico Especialista CNC',
    workerDepartment: 'Mantenimiento & Torno',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rfidTag: 'RFID-883192',
    timestamp: '2026-09-18T07:33:20',
    timeFormatted: '07:33:20 AM',
    dateFormatted: '18/09/2026',
    scanType: 'ENTRADA',
    status: 'AUTORIZADO',
    punctuality: 'TARDANZA_DESCUENTO',
    delayMinutes: 3,
    terminalId: 'TRM-01',
    terminalLocation: 'Puerta Principal - Torniquete A',
    notes: 'Tardanza con descuento (07:33:20 AM - 3 min sobre 7:30). Sujeto a descuento [Sueldo/8h/60min].',
  },
  {
    id: 'ATT-904',
    workerId: 'W-005',
    workerName: 'Ing. Renzo Chávez Meléndez',
    workerType: 'EMPLEADO_INTERNO',
    workerPosition: 'Ingeniero de Procesos y Soldadura',
    workerDepartment: 'Operaciones & Planta',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rfidTag: 'RFID-229104',
    timestamp: '2026-09-18T07:46:10',
    timeFormatted: '07:46:10 AM',
    dateFormatted: '18/09/2026',
    scanType: 'ENTRADA',
    status: 'AUTORIZADO',
    punctuality: 'PUERTA_CERRADA',
    delayMinutes: 16,
    terminalId: 'TRM-01',
    terminalLocation: 'Puerta Principal - Torniquete A',
    notes: 'Puerta Cerrada (> 07:35 AM). Ingreso excepcional autorizado con papeleta oficial.',
    toleranceAuthorizationDoc: 'PAP-2026-0043',
    authorizedBy: 'JEFE_PLANTA',
  },
  {
    id: 'ATT-905',
    workerId: 'W-006',
    workerName: 'Roberto Benítez Alarcón',
    workerType: 'CONTRATISTA',
    workerPosition: 'Técnico de Alta Tensión Externo',
    workerDepartment: 'Mantenimiento Eléctrico',
    contractorCompany: 'Electromecánica del Norte S.A.C.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    rfidTag: 'RFID-772109',
    timestamp: '2026-09-18T07:34:55',
    timeFormatted: '07:34:55 AM',
    dateFormatted: '18/09/2026',
    scanType: 'ENTRADA',
    status: 'AUTORIZADO',
    punctuality: 'TARDANZA_DESCUENTO',
    delayMinutes: 4,
    terminalId: 'TRM-02',
    terminalLocation: 'Acceso Vehicular & Contratistas',
    notes: 'Tardanza en rango de tolerancia (07:34:55 AM).',
  }
];

export const INITIAL_PAPER_SLIPS: PaperSlipRecord[] = [
  {
    id: 'SLIP-001',
    folioNumber: 'PAP-2026-0038',
    workerId: 'W-001',
    workerName: 'Ing. Carlos Mendoza Silva',
    workerPosition: 'Jefe de Operaciones Mecánicas',
    workerDni: '45892134',
    workerType: 'EMPLEADO_INTERNO',
    motive: 'VACACIONES',
    reason: 'Primer tramo de vacaciones anuales de rol oficial 2026.',
    departureDate: '2026-10-05',
    departureTime: '07:30',
    returnDate: '2026-10-12',
    returnTime: '17:00',
    totalHoursRequested: 56,
    totalDaysRequested: 7,
    status: 'APROBADO',
    submittedDate: '2026-09-10',
  },
  {
    id: 'SLIP-002',
    folioNumber: 'PAP-2026-0039',
    workerId: 'W-004',
    workerName: 'Valeria Quispe Paredes',
    workerPosition: 'Supervisora QA/QC Metalúrgico',
    workerDni: '70291834',
    workerType: 'EMPLEADO_INTERNO',
    motive: 'PERMISO_PERSONAL',
    reason: 'Trámite personal notarial impostergable en el centro cívico.',
    departureDate: '2026-09-12',
    departureTime: '09:00',
    returnDate: '2026-09-12',
    returnTime: '13:00',
    totalHoursRequested: 4,
    totalDaysRequested: 0.5,
    personalCompensationType: 'COMPENSAR_HORAS',
    status: 'APROBADO',
    submittedDate: '2026-09-11',
  },
  {
    id: 'SLIP-003',
    folioNumber: 'PAP-2026-0040',
    workerId: 'W-003',
    workerName: 'Jorge Luis Huamán Prado',
    workerPosition: 'Técnico Especialista CNC',
    workerDni: '41209384',
    workerType: 'EMPLEADO_INTERNO',
    motive: 'DESCANSO_MEDICO',
    reason: 'Certificado de incapacidad temporal ESSALUD por lumbalgia.',
    departureDate: '2026-09-04',
    departureTime: '07:30',
    returnDate: '2026-09-04',
    returnTime: '17:00',
    totalHoursRequested: 8,
    totalDaysRequested: 1,
    status: 'APROBADO',
    submittedDate: '2026-09-04',
  },
  {
    id: 'SLIP-004',
    folioNumber: 'PAP-2026-0043',
    workerId: 'W-005',
    workerName: 'Ing. Renzo Chávez Meléndez',
    workerPosition: 'Ingeniero de Procesos y Soldadura',
    workerDni: '42819034',
    workerType: 'EMPLEADO_INTERNO',
    motive: 'INGRESO_FUERA_TOLERANCIA',
    reason: 'Cierre de puerta por ingreso 07:46 AM debido a contingencia técnica en traslado.',
    departureDate: '2026-09-18',
    departureTime: '07:46',
    returnDate: '2026-09-18',
    returnTime: '17:00',
    totalHoursRequested: 8,
    totalDaysRequested: 1,
    approvalAuthority: 'JEFE_PLANTA',
    status: 'APROBADO',
    submittedDate: '2026-09-18',
  }
];

export const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'REQ-101',
    workerId: 'W-001',
    workerName: 'Ing. Carlos Mendoza Silva',
    workerType: 'EMPLEADO_INTERNO',
    type: 'VACACIONES',
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    daysCount: 7,
    reason: 'Primer tramo de vacaciones anuales de rol oficial 2026.',
    status: 'APROBADO',
    submittedDate: '2026-09-10',
  },
  {
    id: 'REQ-102',
    workerId: 'W-004',
    workerName: 'Valeria Quispe Paredes',
    workerType: 'EMPLEADO_INTERNO',
    type: 'PERMISO',
    startDate: '2026-09-12',
    endDate: '2026-09-12',
    daysCount: 1,
    reason: 'Trámite personal notarial impostergable en el centro cívico.',
    status: 'APROBADO',
    submittedDate: '2026-09-11',
  },
  {
    id: 'REQ-103',
    workerId: 'W-003',
    workerName: 'Jorge Luis Huamán Prado',
    workerType: 'EMPLEADO_INTERNO',
    type: 'DESCANSO_MEDICO',
    startDate: '2026-09-04',
    endDate: '2026-09-04',
    daysCount: 1,
    reason: 'Certificado de incapacidad temporal ESSALUD por lumbalgia.',
    status: 'APROBADO',
    submittedDate: '2026-09-04',
  }
];

export const INITIAL_VACATION_NOTIFICATIONS: VacationNotification[] = [
  {
    id: 'NOTIF-001',
    workerId: 'W-004',
    workerName: 'Valeria Quispe Paredes',
    workerPosition: 'Supervisora QA/QC Metalúrgico',
    type: 'UPCOMING_30_DAYS',
    message: 'Cumplirá 1 año de contrato el 01/10/2026 (a 13 días). Habilitación legal de 30 días de vacaciones.',
    date: '2026-09-18',
    read: false,
  },
  {
    id: 'NOTIF-002',
    workerId: 'W-003',
    workerName: 'Jorge Luis Huamán Prado',
    workerPosition: 'Técnico Especialista CNC',
    type: 'ELIGIBLE_NOW',
    message: 'Colaborador con más de 1 año cumplido. Cuenta con 24 días de vacaciones disponibles para programar.',
    date: '2026-09-15',
    read: false,
  },
  {
    id: 'NOTIF-003',
    workerId: 'W-001',
    workerName: 'Ing. Carlos Mendoza Silva',
    workerPosition: 'Jefe de Operaciones Mecánicas',
    type: 'ELIGIBLE_NOW',
    message: 'Recordatorio RRHH: Solicitud de vacaciones de 7 días aprobada a iniciar el 05/10/2026.',
    date: '2026-09-11',
    read: true,
  }
];

// Helper to compute vacation entitlement progress based on hire date
export const calculateVacationProgress = (hireDateStr?: string, daysAvailable = 30): VacationProgress => {
  const hireDate = hireDateStr ? new Date(hireDateStr) : new Date(2025, 9, 1);
  const now = new Date(2026, 8, 18); // 18 Sept 2026
  
  const diffTime = Math.max(0, now.getTime() - hireDate.getTime());
  const daysEmployed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRequiredForYear = 365;

  const isEligibleFor30Days = daysEmployed >= daysRequiredForYear;
  const progressPercentage = Math.min(100, Math.round((daysEmployed / daysRequiredForYear) * 100));
  const daysRemainingUntilYear = Math.max(0, daysRequiredForYear - daysEmployed);

  return {
    hireDate: hireDateStr || '2025-10-01',
    currentDate: '2026-09-18',
    daysEmployed,
    daysRequiredForYear,
    progressPercentage,
    isEligibleFor30Days,
    daysRemainingUntilYear,
    vacationDaysAvailable: isEligibleFor30Days ? daysAvailable : 0,
  };
};

// Generador de estadísticas mensuales para Septiembre 2026 con reglas operativas exactas:
// - ≤ 07:30:00: A_TIEMPO
// - 07:30:01 a 07:35:00: TARDANZA_DESCUENTO (ingreso permitido, computable con [Sueldo/8h/60min])
// - > 07:35:00: PUERTA_CERRADA (Falta por defecto; requiere autorización exclusiva de Jefe de Planta o Gerente General)
// - JUSTIFICADO: Días de permiso o descanso no restan el % de efectividad
export const generateMonthlyStats = (workerId: string, workersList: Worker[]): WorkerMonthlyStats => {
  const worker = workersList.find((w) => w.id === workerId) || workersList[0];
  const baseSalary = worker.baseSalary || 3500;
  
  const seed = workerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dailyLogs: DailyAttendanceSummary[] = [];

  const totalDaysInMonth = 30;
  const currentDayOfMonth = 18;

  let totalWorkdays = 0;
  let attendedDays = 0;
  let punctualDays = 0;
  let tardyDays = 0;
  let absentDays = 0;
  let justifiedDays = 0;
  let totalDelayMinutes = 0;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateObj = new Date(2026, 8, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isWorkday = !isWeekend;

    const dateStr = `2026-09-${d.toString().padStart(2, '0')}`;
    const dayName = dayNames[dayOfWeek];

    if (!isWorkday) {
      dailyLogs.push({
        date: dateStr,
        dayName,
        dayNumber: d,
        isWorkday: false,
        status: 'A_TIEMPO',
        delayMinutes: 0,
        notes: 'Fin de semana (No laborable)',
      });
      continue;
    }

    totalWorkdays++;

    if (d > currentDayOfMonth) {
      dailyLogs.push({
        date: dateStr,
        dayName,
        dayNumber: d,
        isWorkday: true,
        status: 'A_TIEMPO',
        delayMinutes: 0,
        notes: 'Jornada programada proyectada',
      });
      continue;
    }

    const pseudoRandom = Math.sin(seed * d) * 10000;
    const randVal = Math.abs(pseudoRandom - Math.floor(pseudoRandom));

    let status: DailyAttendanceSummary['status'] = 'A_TIEMPO';
    let checkInTime: string | undefined = '07:24:10';
    let checkOutTime: string | undefined = '17:02:15';
    let delayMinutes = 0;
    let notes = 'Ingreso a tiempo (≤ 07:30:00 AM)';
    let slipMotive: DailyAttendanceSummary['slipMotive'];
    let authorizedBy: DailyAttendanceSummary['authorizedBy'];
    let authorizationDocId: string | undefined;

    // Worker specific realistic scenarios
    if (workerId === 'W-001') {
      // Ing. Carlos Mendoza
      if (d === 18) {
        checkInTime = '07:22:15';
        status = 'A_TIEMPO';
        notes = 'Ingreso puntual a tiempo (≤ 07:30 AM)';
      } else if (d === 8) {
        // Tardanza con descuento (7:30 - 7:35)
        status = 'TARDANZA_DESCUENTO';
        checkInTime = '07:33:45';
        delayMinutes = 3;
        notes = 'Tardanza en rango de tolerancia (+3 min). Descuento [Sueldo/8h/60min]';
      } else if (d === 14) {
        // Justificado con comisión de servicio
        status = 'JUSTIFICADO';
        checkInTime = undefined;
        checkOutTime = undefined;
        slipMotive = 'COMISION_SERVICIO';
        notes = 'Comisión de Servicio oficial: Inspección en maestranza Trujillo';
      } else {
        const mins = 15 + Math.floor(randVal * 14); // 07:15 to 07:29
        checkInTime = `07:${mins.toString().padStart(2, '0')}:12`;
        status = 'A_TIEMPO';
      }
    } else if (workerId === 'W-002') {
      // Lic. Mariana Vega - High Punctuality
      if (d === 11) {
        status = 'JUSTIFICADO';
        checkInTime = undefined;
        checkOutTime = undefined;
        slipMotive = 'CAPACITACION';
        notes = 'Capacitación Oficializada: Auditoría Laboral SUNAFIL';
      } else {
        const mins = 12 + Math.floor(randVal * 16);
        checkInTime = `07:${mins.toString().padStart(2, '0')}:05`;
        status = 'A_TIEMPO';
      }
    } else if (workerId === 'W-003') {
      // Jorge Huamán - CNC specialist: 1 justified leave, 1 tolerance tardy, 1 normal
      if (d === 4) {
        status = 'JUSTIFICADO';
        checkInTime = undefined;
        checkOutTime = undefined;
        slipMotive = 'DESCANSO_MEDICO';
        notes = 'Descanso Médico ESSALUD por lumbalgia (PAP-2026-0040)';
      } else if (d === 18) {
        status = 'TARDANZA_DESCUENTO';
        checkInTime = '07:33:20';
        delayMinutes = 3;
        notes = 'Tardanza computable (+3 min). Descuento en planilla.';
      } else if (d === 10) {
        status = 'TARDANZA_DESCUENTO';
        checkInTime = '07:34:50';
        delayMinutes = 4;
        notes = 'Tardanza computable (+4 min sobre 07:30 AM).';
      } else {
        checkInTime = '07:26:30';
        status = 'A_TIEMPO';
      }
    } else if (workerId === 'W-004') {
      // Valeria Quispe: 1 personal permit with hours compensation
      if (d === 12) {
        status = 'JUSTIFICADO';
        checkInTime = '13:00:00';
        checkOutTime = '17:05:00';
        slipMotive = 'PERMISO_PERSONAL';
        notes = 'Permiso Personal Sin Contraprestación (4 hrs). Marcado: Pendiente de compensar (PAP-2026-0039)';
      } else if (d === 15) {
        status = 'TARDANZA_DESCUENTO';
        checkInTime = '07:32:10';
        delayMinutes = 2;
        notes = 'Tardanza con descuento (+2 min).';
      } else {
        checkInTime = '07:21:40';
        status = 'A_TIEMPO';
      }
    } else if (workerId === 'W-005') {
      // Renzo Chávez: 1 past 7:35 AM with Plant Manager authorization, 1 unexcused absence
      if (d === 18) {
        status = 'PUERTA_CERRADA';
        checkInTime = '07:46:10';
        delayMinutes = 16;
        authorizedBy = 'JEFE_PLANTA';
        authorizationDocId = 'PAP-2026-0043';
        notes = 'Puerta Cerrada (> 07:35 AM). Ingreso excepcional autorizado por Jefe de Planta (Ing. Carlos Mendoza)';
      } else if (d === 7) {
        status = 'FALTA';
        checkInTime = undefined;
        checkOutTime = undefined;
        notes = 'Falta Injustificada (Sin registro RFID ni papeleta de tolerancia)';
      } else {
        checkInTime = '07:27:00';
        status = 'A_TIEMPO';
      }
    } else {
      // Generic variation
      if (randVal < 0.10) {
        status = 'FALTA';
        checkInTime = undefined;
        checkOutTime = undefined;
        notes = 'Falta injustificada (Sin registro en torniquete)';
      } else if (randVal < 0.22) {
        status = 'TARDANZA_DESCUENTO';
        delayMinutes = 2 + Math.floor(randVal * 3); // 2 to 4 min delay (7:32 - 7:34)
        checkInTime = `07:${(30 + delayMinutes).toString().padStart(2, '0')}:20`;
        notes = `Tardanza con descuento (+${delayMinutes} min sobre 7:30 AM)`;
      } else if (randVal < 0.32) {
        status = 'JUSTIFICADO';
        checkInTime = undefined;
        checkOutTime = undefined;
        slipMotive = 'ATENCION_MEDICA';
        notes = 'Permiso justificado por Atención Médica ESSALUD';
      } else {
        status = 'A_TIEMPO';
        const mins = 14 + Math.floor(randVal * 15);
        checkInTime = `07:${mins.toString().padStart(2, '0')}:00`;
      }
    }

    if (status === 'A_TIEMPO') {
      attendedDays++;
      punctualDays++;
    } else if (status === 'TARDANZA_DESCUENTO') {
      attendedDays++;
      tardyDays++;
      totalDelayMinutes += delayMinutes;
    } else if (status === 'PUERTA_CERRADA') {
      if (authorizedBy) {
        attendedDays++;
        tardyDays++;
        totalDelayMinutes += delayMinutes;
      } else {
        absentDays++;
      }
    } else if (status === 'FALTA') {
      absentDays++;
    } else if (status === 'JUSTIFICADO') {
      justifiedDays++;
    }

    dailyLogs.push({
      date: dateStr,
      dayName,
      dayNumber: d,
      isWorkday: true,
      status,
      checkInTime,
      checkOutTime,
      delayMinutes,
      notes,
      slipMotive,
      authorizedBy,
      authorizationDocId,
    });
  }

  // REGLA CLAVE REQUERIMIENTO 5:
  // "Si el trabajador tiene permiso o descanso, esos días no se contabilizan para bajar su % de Efectividad."
  // Días evaluables netos = días transcurridos menos días justificados (permisos/descansos)
  const evaluatedElapsedWorkdays = Math.max(1, punctualDays + tardyDays + absentDays);
  
  // Puntuales = 100%, Tardanzas con descuento = 80% (penalización menor por tardanza leve), Faltas = 0%
  const effectivePoints = (punctualDays * 1.0) + (tardyDays * 0.80);
  const effectivenessPercentage = Math.max(0, Math.min(100, Math.round((effectivePoints / evaluatedElapsedWorkdays) * 100)));

  // Cálculo de Deducciones Salariales con Reglas Requerimiento 3:
  // 1. Tardanzas: [Sueldo / 8h / 60min] * Minutos de tardanza
  //    (Sueldo base mensual / 30 días / 8 horas / 60 minutos) = costo por minuto
  const costPerMinute = (baseSalary / 30) / (8 * 60);
  const tardyDeduction = Math.round(totalDelayMinutes * costPerMinute * 100) / 100;

  // 2. Faltas: [Sueldo / 30] por cada día de falta
  const dailyRate = baseSalary / 30;
  const absenceDeduction = Math.round(absentDays * dailyRate * 100) / 100;

  const salaryDeduction = Math.round(tardyDeduction + absenceDeduction);
  const calculatedSalary = Math.max(0, Math.round(baseSalary - salaryDeduction));

  const leavesCount = justifiedDays;
  const leavesPercentageOfMonth = Math.round((leavesCount / Math.max(1, totalWorkdays)) * 100 * 10) / 10;

  return {
    workerId,
    month: 'Septiembre 2026',
    totalWorkdays: 22,
    attendedDays,
    punctualDays,
    tardyDays,
    absentDays,
    justifiedDays,
    totalDelayMinutes,
    leavesCount,
    leavesPercentageOfMonth,
    effectivenessPercentage,
    baseSalary,
    calculatedSalary,
    salaryDeduction,
    tardyDeduction,
    absenceDeduction,
    dailyLogs,
  };
};
