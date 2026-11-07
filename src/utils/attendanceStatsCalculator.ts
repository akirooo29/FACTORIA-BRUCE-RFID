import type {
  Worker,
  WorkerMonthlyStats,
  DailyAttendanceSummary,
  PaperSlipRecord,
  AttendanceRecord,
  AttendancePunctuality,
  ScanType,
  DepartmentIncidence,
} from '../types';

/**
 * Normaliza y mapea un registro crudo de la tabla Asistencias (SQL Server / ASP.NET Web API)
 * al modelo tipado AttendanceRecord utilizado en las bitácoras y monitores RFID del frontend.
 */
export const mapAsistenciaToAttendanceRecord = (
  item: any,
  workersList: Worker[]
): AttendanceRecord => {
  const idNum = item.id ?? item.Id ?? Math.floor(100 + Math.random() * 900);
  const id = `ATT-${idNum}`;

  // Vincular con el trabajador real si está en el padrón
  const worker = workersList.find((w) => {
    if (item.workerId !== undefined && w.id === Number(item.workerId)) return true;
    if (item.WorkerId !== undefined && w.id === Number(item.WorkerId)) return true;
    if (item.trabajadorId !== undefined && w.id === Number(item.trabajadorId)) return true;
    if (item.TrabajadorId !== undefined && w.id === Number(item.TrabajadorId)) return true;
    if (item.idTrabajador !== undefined && w.id === Number(item.idTrabajador)) return true;
    if (
      item.trabajador &&
      w.name.trim().toLowerCase() === String(item.trabajador).trim().toLowerCase()
    ) {
      return true;
    }
    if (
      item.rol &&
      (w.rfidTag.toLowerCase() === String(item.rol).toLowerCase() ||
        w.code.toLowerCase() === String(item.rol).toLowerCase() ||
        w.type.toLowerCase() === String(item.rol).toLowerCase())
    ) {
      return true;
    }
    return false;
  });

  // Extracción de fecha
  const rawDate = item.fecha || item.Fecha || item.timestamp || item.Timestamp || item.date || new Date().toISOString();
  const datePart = String(rawDate).split('T')[0];
  const dateSegments = datePart.split('-');
  const dateFormatted =
    dateSegments.length === 3
      ? `${dateSegments[2]}/${dateSegments[1]}/${dateSegments[0]}`
      : new Date().toLocaleDateString('es-PE');

  // Extracción de hora de ingreso
  let horaRaw =
    item.horaIngreso ||
    item.HoraIngreso ||
    item.hora ||
    item.Hora ||
    item.checkInTime ||
    item.CheckInTime ||
    '07:30:00';

  if (horaRaw.includes('T')) {
    horaRaw = horaRaw.split('T')[1];
  }
  const timeClean = horaRaw.split('.')[0].trim();
  const [hStr, mStr, sStr] = timeClean.split(':');
  const hours = parseInt(hStr || '7', 10);
  const minutes = parseInt(mStr || '30', 10);
  const seconds = parseInt(sStr || '0', 10);

  // Formato 12 horas (hh:mm:ss AM/PM)
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const timeFormatted = `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${period}`;

  // Reglas de puntualidad corporativas de Factoría Bruce
  const currentTotalMinutes = hours * 60 + minutes;
  const standardEntryMinutes = 7 * 60 + 30; // 07:30 AM = 450 min
  const toleranceLimitMinutes = 7 * 60 + 35; // 07:35 AM = 455 min

  let punctuality: AttendancePunctuality = 'A_TIEMPO';
  let delayMinutes = 0;

  if (currentTotalMinutes <= standardEntryMinutes) {
    punctuality = 'A_TIEMPO';
    delayMinutes = 0;
  } else if (currentTotalMinutes <= toleranceLimitMinutes) {
    punctuality = 'TARDANZA_DESCUENTO';
    delayMinutes = currentTotalMinutes - standardEntryMinutes;
  } else {
    punctuality = 'PUERTA_CERRADA';
    delayMinutes = currentTotalMinutes - standardEntryMinutes;
  }

  const scanType: ScanType = item.scanType || item.tipo || 'ENTRADA';

  return {
    id,
    workerId: worker ? worker.id : Number(item.workerId || item.trabajadorId || 1),
    workerName: worker ? worker.name : String(item.trabajador || 'Colaborador'),
    workerType: worker ? worker.type : 'TRABAJADOR_REGULAR',
    workerPosition: worker ? worker.position : String(item.rol || 'Operario de Planta'),
    workerDepartment: worker ? worker.department : 'Operaciones & Planta',
    contractorCompany: worker?.contractorCompany,
    avatarUrl:
      worker?.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rfidTag: worker ? worker.rfidTag : String(item.rol || 'RFID-TAG'),
    timestamp: `${datePart}T${timeClean}`,
    timeFormatted,
    dateFormatted,
    scanType,
    status: 'AUTORIZADO',
    punctuality,
    delayMinutes,
    terminalId: item.terminalId || 'TRM-01',
    terminalLocation: item.terminalLocation || 'Entrada Principal (Torniquete 1)',
    notes:
      item.observaciones ||
      item.notes ||
      (punctuality === 'A_TIEMPO'
        ? 'Ingreso puntual a tiempo (≤ 07:30:00 AM) - Base SQL Server'
        : punctuality === 'TARDANZA_DESCUENTO'
        ? `Tardanza con descuento (+${delayMinutes} min sobre 07:30 AM) - Base SQL Server`
        : `Ingreso tardío fuera de tolerancia (+${delayMinutes} min) - Base SQL Server`),
  };
};

/**
 * Calcula de manera determinista las estadísticas mensuales, asistencias, faltas,
 * tardanzas, deducciones y bitácora del calendario basándose exclusivamente en
 * los datos reales de SQL Server provenientes de http://localhost:5216/api/Asistencias.
 */
export const calculateWorkerMonthlyStatsFromSql = (
  workerId: number | string,
  workersList: Worker[],
  attendancesList: any[],
  paperSlipsList: PaperSlipRecord[] = [],
  monthYear?: string
): WorkerMonthlyStats => {
  const numId = typeof workerId === 'number' ? workerId : parseInt(String(workerId).replace(/\D/g, ''), 10) || 1;
  const worker = workersList.find((w) => w.id === numId) || workersList[0];

  // Determinar mes y año
  let targetYear = 2026;
  let targetMonthIndex = 9; // 9 = Octubre (0-indexed)

  if (monthYear) {
    const parts = monthYear.split('-');
    if (parts.length >= 2) {
      targetYear = parseInt(parts[0], 10) || 2026;
      targetMonthIndex = (parseInt(parts[1], 10) || 10) - 1;
    }
  } else {
    // Si no se especifica, detectar el mes de los registros de SQL Server
    const workerRecords = attendancesList.filter((att) => {
      if (att.workerId !== undefined && Number(att.workerId) === numId) return true;
      if (att.trabajadorId !== undefined && Number(att.trabajadorId) === numId) return true;
      if (worker && att.trabajador && String(att.trabajador).trim().toLowerCase() === worker.name.trim().toLowerCase()) return true;
      return false;
    });

    if (workerRecords.length > 0) {
      const firstFecha = workerRecords[0].fecha || workerRecords[0].timestamp || workerRecords[0].date;
      if (firstFecha) {
        const parts = String(firstFecha).split('T')[0].split('-');
        if (parts.length >= 2) {
          targetYear = parseInt(parts[0], 10) || 2026;
          targetMonthIndex = parseInt(parts[1], 10) - 1;
        }
      }
    }
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const monthDisplay = `${monthNames[targetMonthIndex]} ${targetYear}`;

  // Filtrar todas las asistencias del trabajador
  const workerAttendances = attendancesList.filter((att) => {
    if (att.workerId !== undefined && Number(att.workerId) === numId) return true;
    if (att.WorkerId !== undefined && Number(att.WorkerId) === numId) return true;
    if (att.trabajadorId !== undefined && Number(att.trabajadorId) === numId) return true;
    if (att.idTrabajador !== undefined && Number(att.idTrabajador) === numId) return true;
    if (worker && att.trabajador && String(att.trabajador).trim().toLowerCase() === worker.name.trim().toLowerCase()) {
      return true;
    }
    if (worker && att.rol && (
      String(att.rol).toLowerCase() === worker.rfidTag.toLowerCase() ||
      String(att.rol).toLowerCase() === worker.code.toLowerCase() ||
      String(att.rol).toLowerCase() === worker.type.toLowerCase()
    )) {
      return true;
    }
    return false;
  });

  const totalDaysInMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dailyLogs: DailyAttendanceSummary[] = [];

  let totalWorkdays = 0;
  let attendedDays = 0;
  let punctualDays = 0;
  let tardyDays = 0;
  let absentDays = 0;
  let justifiedDays = 0;
  let vacationDays = 0;
  let totalDelayMinutes = 0;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 1. Recuperar y normalizar la fecha de ingreso del trabajador (YYYY-MM-DD)
  const rawHireDate = worker?.fecha_ingreso || worker?.hireDate;
  let hireDateClean = '';

  if (rawHireDate) {
    const rawStr = String(rawHireDate).trim();
    if (rawStr.includes('T')) {
      hireDateClean = rawStr.split('T')[0];
    } else if (rawStr.includes(' ')) {
      hireDateClean = rawStr.split(' ')[0];
    } else {
      hireDateClean = rawStr;
    }
  }

  // Validación: Solo considerar válida si tiene formato de fecha (no vacía ni 0001-01-01)
  const hasValidHireDate = Boolean(hireDateClean && !hireDateClean.startsWith('0001') && hireDateClean.length >= 10);

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateObj = new Date(targetYear, targetMonthIndex, d);
    const dayOfWeek = dateObj.getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;

    const dateStr = `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = dayNames[dayOfWeek];

    // =========================================================================
    // VALIDACIÓN PRIORITARIA: PRE-INGRESO / NO VINCULADO
    // Si la fecha evaluada (dateStr) es ESTRICTAMENTE MENOR a la fecha de ingreso
    // del trabajador, ese día retorna un estado neutro ('PRE_INGRESO')
    // y NO suma a absentDays ni a totalWorkdays.
    // =========================================================================
    if (hasValidHireDate && dateStr < hireDateClean) {
      dailyLogs.push({
        date: dateStr,
        dayName,
        dayNumber: d,
        isWorkday: false,
        status: 'PRE_INGRESO',
        checkInTime: undefined,
        checkOutTime: undefined,
        delayMinutes: 0,
        notes: `Período no vinculado (Fecha de ingreso laboral: ${hireDateClean})`,
      });
      continue;
    }

    // =========================================================================
    // CASO 1: DOMINGOS (Descanso semanal obligatorio para todo el personal)
    // =========================================================================
    if (isSunday) {
      dailyLogs.push({
        date: dateStr,
        dayName,
        dayNumber: d,
        isWorkday: false,
        status: 'A_TIEMPO',
        delayMinutes: 0,
        notes: 'Domingo (Descanso Semanal)',
      });
      continue;
    }

    // =========================================================================
    // EVALUACIÓN TEMPORAL CON LA FECHA ACTUAL (todayStr en hora local)
    // =========================================================================
    const isFuture = dateStr > todayStr;
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    // =========================================================================
    // CORRECCIÓN 2: DÍAS FUTUROS (dateStr > todayStr)
    // Si el día evaluado en el bucle del mes es MAYOR al día de hoy, debe
    // ignorar cualquier mock data residual y retornar un estado neutro
    // (sin horas fantasma 16:30 ni penalidades, y sin computar como falta).
    // =========================================================================
    if (isFuture) {
      dailyLogs.push({
        date: dateStr,
        dayName,
        dayNumber: d,
        isWorkday: true,
        status: 'PENDIENTE',
        checkInTime: undefined,
        checkOutTime: undefined,
        delayMinutes: 0,
        notes: 'Jornada futura / pendiente de cumplimiento',
      });
      continue;
    }

    // =========================================================================
    // DÍAS PRESENTES O PASADOS (dateStr <= todayStr)
    // Buscar marcaciones reales del colaborador para esta fecha
    // =========================================================================
    const dayRecords = workerAttendances.filter((att) => {
      const rawF = att.fecha || att.Fecha || att.timestamp || att.Timestamp || att.date || '';
      return String(rawF).split('T')[0] === dateStr;
    });

    // Buscar si existe papeleta aprobada para este día
    const activeSlip = paperSlipsList.find((slip) => {
      if (slip.workerId !== numId && slip.workerDni !== worker?.dni) return false;
      if (slip.status !== 'APROBADO') return false;
      return slip.departureDate <= dateStr && slip.returnDate >= dateStr;
    });

    // -------------------------------------------------------------------------
    // A) Colaborador asistió y tiene marcaciones registradas
    // -------------------------------------------------------------------------
    if (dayRecords.length > 0) {
      totalWorkdays++;
      attendedDays++;

      // Extraer hora de ingreso más temprana del día
      let earliestMinutes = 24 * 60;
      let earliestTimeClean = '07:30:00';

      for (const rec of dayRecords) {
        let hRaw = rec.horaIngreso || rec.HoraIngreso || rec.hora || rec.Hora || rec.checkInTime || '07:30:00';
        if (hRaw.includes('T')) hRaw = hRaw.split('T')[1];
        const tClean = hRaw.split('.')[0].trim();
        const [hh, mm] = tClean.split(':');
        const totalM = (parseInt(hh || '7', 10) * 60) + parseInt(mm || '30', 10);
        if (totalM < earliestMinutes) {
          earliestMinutes = totalM;
          earliestTimeClean = tClean;
        }
      }

      const standardCheckIn = 7 * 60 + 30; // 07:30 AM (450 min)
      const toleranceCheckIn = 7 * 60 + 35; // 07:35 AM (455 min)

      let status: AttendancePunctuality = 'A_TIEMPO';
      let delay = 0;
      let notes = 'Ingreso puntual a tiempo (≤ 07:30 AM)';

      if (earliestMinutes <= standardCheckIn) {
        status = 'A_TIEMPO';
        delay = 0;
        punctualDays++;
      } else if (earliestMinutes <= toleranceCheckIn) {
        status = 'TARDANZA_DESCUENTO';
        delay = earliestMinutes - standardCheckIn;
        tardyDays++;
        totalDelayMinutes += delay;
        notes = `Tardanza en rango de tolerancia (+${delay} min sobre 07:30 AM).`;
      } else {
        status = 'PUERTA_CERRADA';
        delay = earliestMinutes - standardCheckIn;
        tardyDays++;
        totalDelayMinutes += delay;
        notes = `Ingreso fuera de tolerancia (+${delay} min). Registrado en SQL Server.`;
      }

      // Horario de salida estándar: Sábados 13:00, Lunes a Viernes 16:30
      const standardCheckOut = isSaturday ? '13:00:00' : '16:30:00';
      const lastRec = dayRecords[dayRecords.length - 1];
      const checkOutTime = dayRecords.length > 1
        ? (lastRec.horaSalida || lastRec.horaIngreso || standardCheckOut).split('.')[0]
        : (isToday ? undefined : standardCheckOut);

      dailyLogs.push({
        date: dateStr,
        dayName,
        dayNumber: d,
        isWorkday: true,
        status,
        checkInTime: earliestTimeClean,
        checkOutTime,
        delayMinutes: delay,
        notes,
      });
    }
    // -------------------------------------------------------------------------
    // B) Permiso justificado o vacaciones aprobadas
    // -------------------------------------------------------------------------
    else if (activeSlip) {
      totalWorkdays++;
      if (activeSlip.motive === 'VACACIONES') {
        vacationDays++;
        dailyLogs.push({
          date: dateStr,
          dayName,
          dayNumber: d,
          isWorkday: true,
          status: 'VACACIONES',
          slipMotive: 'VACACIONES',
          delayMinutes: 0,
          notes: `Vacaciones Aprobadas (Papeleta ${activeSlip.folioNumber})`,
        });
      } else {
        justifiedDays++;
        dailyLogs.push({
          date: dateStr,
          dayName,
          dayNumber: d,
          isWorkday: true,
          status: 'JUSTIFICADO',
          slipMotive: activeSlip.motive,
          delayMinutes: 0,
          notes: `Permiso Justificado: ${activeSlip.reason} (${activeSlip.folioNumber})`,
        });
      }
    }
    // -------------------------------------------------------------------------
    // C) CORRECCIÓN 1: DÍAS PASADOS SIN REGISTRO (FALTA REAL, NO DESCANSO)
    // Si dateStr < todayStr, NO es domingo y no hay marcaciones ni papeletas:
    // Retorna estrictamente como "FALTA" (Ausente).
    // -------------------------------------------------------------------------
    else if (isPast) {
      totalWorkdays++;
      absentDays++;
      dailyLogs.push({
        date: dateStr,
        dayName,
        dayNumber: d,
        isWorkday: true,
        status: 'FALTA',
        checkInTime: undefined,
        checkOutTime: undefined,
        delayMinutes: 0,
        notes: 'Inasistencia Injustificada (Sin registro en SQL Server)',
      });
    }
    // -------------------------------------------------------------------------
    // D) DÍA DE HOY (dateStr === todayStr) AÚN SIN MARCACIÓN REGISTRADA
    // -------------------------------------------------------------------------
    else {
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMin = currentHours * 60 + currentMinutes;
      const isPastEntryWindow = currentTotalMin > (7 * 60 + 35); // Pasadas las 07:35 AM

      if (isPastEntryWindow) {
        totalWorkdays++;
        absentDays++;
        dailyLogs.push({
          date: dateStr,
          dayName,
          dayNumber: d,
          isWorkday: true,
          status: 'FALTA',
          checkInTime: undefined,
          checkOutTime: undefined,
          delayMinutes: 0,
          notes: 'Inasistencia detectada hoy (Sin registro tras cierre de tolerancia 07:35 AM)',
        });
      } else {
        dailyLogs.push({
          date: dateStr,
          dayName,
          dayNumber: d,
          isWorkday: true,
          status: 'PENDIENTE',
          checkInTime: undefined,
          checkOutTime: undefined,
          delayMinutes: 0,
          notes: 'Jornada de hoy en curso (Esperando marcación en torniquete)',
        });
      }
    }
  }

  // Cálculo de Porcentaje de Efectividad
  const evaluatedElapsedWorkdays = Math.max(1, punctualDays + tardyDays + absentDays);
  const effectivePoints = (punctualDays * 1.0) + (tardyDays * 0.80);
  const effectivenessPercentage = Math.max(
    0,
    Math.min(100, Math.round((effectivePoints / evaluatedElapsedWorkdays) * 100))
  );

  // Auditoría Pura de Tiempos: Horas-Hombre Perdidas
  // 1. Minutos de tardanza convertidos a horas
  const lostHoursFromTardiness = Math.round((totalDelayMinutes / 60) * 10) / 10;
  // 2. Horas perdidas por inasistencia (Jornada estándar de planta: 8 horas)
  const lostHoursFromAbsence = absentDays * 8;
  // 3. Total Horas-Hombre perdidas
  const lostManHours = Math.round((lostHoursFromTardiness + lostHoursFromAbsence) * 10) / 10;

  const leavesCount = justifiedDays + vacationDays;
  const leavesPercentageOfMonth = Math.round((leavesCount / Math.max(1, totalWorkdays)) * 100 * 10) / 10;

  return {
    workerId: numId,
    month: monthDisplay,
    totalWorkdays,
    attendedDays,
    punctualDays,
    tardyDays,
    absentDays,
    justifiedDays,
    vacationDays,
    totalDelayMinutes,
    leavesCount,
    leavesPercentageOfMonth,
    effectivenessPercentage,
    lostHoursFromTardiness,
    lostHoursFromAbsence,
    lostManHours,
    dailyLogs,
  };
};

/**
 * Agrupa los colaboradores y sus estadísticas mensuales por departamento,
 * calculando mediante acumuladores (.reduce) los totales de asistencias, tardanzas,
 * faltas, minutos de retraso, tasa de puntualidad y Horas-Hombre perdidas.
 */
export const computeDepartmentBiData = (
  workers: Worker[],
  getWorkerStats: (workerId: number | string, monthYear?: string) => WorkerMonthlyStats,
  selectedPeriod?: string
): DepartmentIncidence[] => {
  if (!workers || workers.length === 0) {
    return [];
  }

  // Agrupamos colaboradores por su departamento real
  const deptMap = new Map<string, Worker[]>();

  workers.forEach((worker) => {
    const rawDept = worker.department?.trim();
    const dept = rawDept && rawDept.length > 0 ? rawDept : 'Operaciones & Planta';
    if (!deptMap.has(dept)) {
      deptMap.set(dept, []);
    }
    deptMap.get(dept)!.push(worker);
  });

  const result: DepartmentIncidence[] = [];

  deptMap.forEach((deptWorkers, deptName) => {
    const statsList = deptWorkers.map((w) => getWorkerStats(w.id, selectedPeriod));

    const totalWorkers = deptWorkers.length;
    const attendances = statsList.reduce((acc, s) => acc + s.attendedDays, 0);
    const tardiness = statsList.reduce((acc, s) => acc + s.tardyDays, 0);
    const absences = statsList.reduce((acc, s) => acc + s.absentDays, 0);
    const justified = statsList.reduce((acc, s) => acc + (s.justifiedDays + s.vacationDays), 0);
    const totalDelayMinutes = statsList.reduce((acc, s) => acc + s.totalDelayMinutes, 0);
    const lostManHours = statsList.reduce((acc, s) => acc + s.lostManHours, 0);

    const evaluated = attendances + absences;
    const punctualCount = statsList.reduce((acc, s) => acc + s.punctualDays, 0);
    const punctualityRate = evaluated > 0
      ? Math.round((punctualCount / evaluated) * 100 * 10) / 10
      : (totalWorkers > 0 ? 100 : 0);

    result.push({
      department: deptName,
      attendances,
      tardiness,
      absences,
      justified,
      totalWorkers,
      totalDelayMinutes,
      lostManHours: Math.round(lostManHours * 10) / 10,
      punctualityRate: Math.max(0, Math.min(100, punctualityRate)),
    });
  });

  return result;
};


