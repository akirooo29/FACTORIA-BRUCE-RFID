import React, { useState } from 'react';
import type { DailyAttendanceSummary, AttendancePunctuality } from '../../types';
import { Badge } from '../common/Badge';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface AttendanceCalendarProps {
  dailyLogs: DailyAttendanceSummary[];
  monthName: string; // e.g. "Septiembre 2026"
  workerName: string;
  baseSalary: number;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  dailyLogs,
  monthName,
  workerName,
  baseSalary,
}) => {
  const [selectedDayLog, setSelectedDayLog] = useState<DailyAttendanceSummary | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(8); // 8 = September (0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const weekDayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Days in month calculation for the grid
  // For Sept 2026: 30 days, 1st was Tuesday (index 1 in Monday-first calendar)
  // Let's compute offset dynamically based on currentMonthIndex and currentYear
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  // In JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Converting to Monday-based (0 = Mon, ..., 6 = Sun):
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  // Visual Indicator helper for day cards
  const getDayIndicator = (log?: DailyAttendanceSummary) => {
    if (!log) return null;
    if (!log.isWorkday) {
      return (
        <span className="text-[9px] text-zinc-400 font-medium tracking-tight">
          No lab.
        </span>
      );
    }

    switch (log.status) {
      case 'A_TIEMPO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Normal
          </span>
        );
      case 'TARDANZA_DESCUENTO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-400 dark:border-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            +{log.delayMinutes}m tard.
          </span>
        );
      case 'PUERTA_CERRADA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-1.5 py-0.5 rounded shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            P. Cerrada
          </span>
        );
      case 'FALTA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Falta
          </span>
        );
      case 'JUSTIFICADO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
            Permiso
          </span>
        );
      default:
        return null;
    }
  };

  const getBorderColorByStatus = (status?: AttendancePunctuality, isWorkday?: boolean) => {
    if (!isWorkday) return 'border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40';
    switch (status) {
      case 'A_TIEMPO':
        return 'border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white bg-white dark:bg-zinc-900';
      case 'TARDANZA_DESCUENTO':
        return 'border-zinc-400 dark:border-zinc-600 hover:border-black dark:hover:border-white bg-zinc-50 dark:bg-zinc-900';
      case 'PUERTA_CERRADA':
        return 'border-zinc-900 dark:border-zinc-100 hover:ring-1 hover:ring-zinc-500 bg-zinc-100 dark:bg-zinc-800';
      case 'FALTA':
        return 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 bg-zinc-100 dark:bg-zinc-900';
      case 'JUSTIFICADO':
        return 'border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white bg-zinc-50 dark:bg-zinc-900';
      default:
        return 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900';
    }
  };

  // Minute deduction calculation: [Sueldo / 8h / 60min]
  const costPerMinute = (baseSalary / 30) / (8 * 60);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
      {/* Calendar Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            Calendario Mensual Interactivo de Asistencia
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Inspección día a día con indicadores de Asistencia Normal, Tardanzas, Faltas y Permisos.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 shadow-inner">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all active:scale-95"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 text-xs font-bold text-zinc-900 dark:text-zinc-100 min-w-[130px] text-center font-mono tracking-wide">
            {monthNames[currentMonthIndex]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all active:scale-95"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Bar (Reglas Visuales Claras) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300">
        <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px] mr-1">
          Leyenda:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>A tiempo (≤ 07:30)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Tardanza con descuento (07:30 - 07:35)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Puerta Cerrada / Falta (&gt; 07:35)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
          <span>Permiso / Descanso (No reduce efectividad)</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
          {weekDayHeaders.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty offset padding for days before the 1st */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-24 sm:h-28 rounded-2xl bg-zinc-50/20 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900/40 opacity-30"
            />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            // Match with dailyLogs if in current demo month (September 2026)
            const log = currentMonthIndex === 8 && currentYear === 2026
              ? dailyLogs.find((l) => l.dayNumber === dayNum)
              : undefined;

            const isWeekend = (startDayOffset + i) % 7 === 5 || (startDayOffset + i) % 7 === 6;
            const isWorkday = log ? log.isWorkday : !isWeekend;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  if (log) setSelectedDayLog(log);
                }}
                className={`group relative h-24 sm:h-28 p-2 rounded-2xl border transition-all duration-150 flex flex-col justify-between cursor-pointer select-none ${getBorderColorByStatus(
                  log?.status,
                  isWorkday
                )} ${
                  log?.isWorkday ? 'hover:scale-[1.02] hover:shadow-md' : 'opacity-60'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                      dayNum === 18 && currentMonthIndex === 8 && currentYear === 2026
                        ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {log?.checkInTime && (
                    <span className="font-mono text-[9px] text-zinc-500 font-semibold hidden sm:inline">
                      {log.checkInTime.slice(0, 5)}
                    </span>
                  )}
                </div>

                {/* Day Center / Status Badge */}
                <div className="my-1">
                  {getDayIndicator(log)}
                </div>

                {/* Day Footer / Note snippet */}
                <div className="text-[10px] text-zinc-400 truncate">
                  {log?.slipMotive ? (
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {log.slipMotive.replace('_', ' ')}
                    </span>
                  ) : log?.checkOutTime ? (
                    <span className="font-mono text-zinc-400">Sal: {log.checkOutTime.slice(0, 5)}</span>
                  ) : (
                    <span>--</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAY DETAIL INSPECTOR MODAL */}
      {selectedDayLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    Ficha de Jornada: {selectedDayLog.dayName} {selectedDayLog.dayNumber} de {monthName}
                  </h4>
                  <p className="text-xs text-zinc-500">{workerName} • Registro de Entrada y Salida</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayLog(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4 text-xs">
              {/* Status Header Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Estado de la Marcación:</span>
                <Badge value={selectedDayLog.status} size="md" />
              </div>

              {/* Attendance Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Hora de Entrada Registrada:</span>
                  <span className="font-mono text-sm font-black text-zinc-900 dark:text-white">
                    {selectedDayLog.checkInTime ? `${selectedDayLog.checkInTime} AM` : 'Sin Marcación'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Hora de Salida Registrada:</span>
                  <span className="font-mono text-sm font-black text-zinc-900 dark:text-white">
                    {selectedDayLog.checkOutTime ? `${selectedDayLog.checkOutTime} PM` : 'Sin Registro'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Minutos de Tardanza Computable:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {selectedDayLog.delayMinutes > 0 ? `+${selectedDayLog.delayMinutes} minutos` : '0 min (Puntual)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Impacto en Liquidación:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {selectedDayLog.delayMinutes > 0
                      ? `- S/ ${(selectedDayLog.delayMinutes * costPerMinute).toFixed(2)}`
                      : selectedDayLog.status === 'FALTA'
                      ? `- S/ ${(baseSalary / 30).toFixed(2)} (Falta)`
                      : 'Sin descuento'}
                  </span>
                </div>
              </div>

              {/* Authorization if Past 07:35 AM */}
              {selectedDayLog.authorizedBy && (
                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Autorización de Ingreso Fuera de Tolerancia</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    Aprobado formalmente por: <strong>{selectedDayLog.authorizedBy === 'JEFE_PLANTA' ? 'Jefe de Planta (Ing. Carlos Mendoza)' : 'Gerencia General'}</strong>
                  </p>
                  {selectedDayLog.authorizationDocId && (
                    <span className="inline-block text-[10px] font-mono bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                      Doc. Ref: {selectedDayLog.authorizationDocId}
                    </span>
                  )}
                </div>
              )}

              {/* Justification & Notes */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Observación de Recursos Humanos:
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {selectedDayLog.notes || 'Jornada laboral ordinaria cumplida conforme a turno.'}
                </p>
              </div>

              {/* Rule Note */}
              {selectedDayLog.status === 'JUSTIFICADO' && (
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-white shrink-0" />
                  <span>
                    <strong>Protección Salarial:</strong> Por contar con papeleta o descanso médico justificado, este día <strong>no reduce el % de efectividad mensual</strong> del trabajador.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedDayLog(null)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs rounded-xl transition-all"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
