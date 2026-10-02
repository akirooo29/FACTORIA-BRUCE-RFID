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
  monthName: string;
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
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(8); // 8 = Septiembre
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

  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  const getDayIndicator = (log?: DailyAttendanceSummary) => {
    if (!log) return null;
    if (!log.isWorkday) {
      return (
        <span className="text-[10px] text-slate-400 font-medium">
          No lab.
        </span>
      );
    }

    switch (log.status) {
      case 'A_TIEMPO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Normal
          </span>
        );
      case 'TARDANZA_DESCUENTO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            +{log.delayMinutes}m
          </span>
        );
      case 'PUERTA_CERRADA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            P. Cerrada
          </span>
        );
      case 'FALTA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Falta
          </span>
        );
      case 'JUSTIFICADO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
            Permiso
          </span>
        );
      default:
        return null;
    }
  };

  const getBorderColorByStatus = (status?: AttendancePunctuality, isWorkday?: boolean) => {
    if (!isWorkday) return 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50';
    switch (status) {
      case 'A_TIEMPO':
        return 'border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-200 bg-white dark:bg-slate-900';
      case 'TARDANZA_DESCUENTO':
        return 'border-amber-300 dark:border-amber-800 hover:border-amber-500 bg-amber-50/20 dark:bg-slate-900';
      case 'PUERTA_CERRADA':
        return 'border-rose-300 dark:border-rose-800 hover:border-rose-500 bg-rose-50/20 dark:bg-slate-900';
      case 'FALTA':
        return 'border-slate-300 dark:border-slate-700 hover:border-slate-500 bg-slate-100 dark:bg-slate-900';
      case 'JUSTIFICADO':
        return 'border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-100 bg-slate-50 dark:bg-slate-900';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
    }
  };

  const costPerMinute = (baseSalary / 30) / (8 * 60);

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
      {/* Calendar Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Calendario Mensual de Asistencia
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspección día a día con indicadores de Asistencia Normal, Tardanzas, Faltas y Permisos.
          </p>
        </div>

        {/* Controles de Navegación de Mes */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs font-semibold text-slate-900 dark:text-slate-100 min-w-[120px] text-center font-mono">
            {monthNames[currentMonthIndex]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Leyenda */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mr-1">
          Leyenda:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>A tiempo (≤ 07:30)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Tardanza (07:30 - 07:35)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          <span>Puerta Cerrada / Falta (&gt; 07:35)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Permiso (No penalizado)</span>
        </div>
      </div>

      {/* Grid del Calendario */}
      <div>
        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
          {weekDayHeaders.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Celdas de los días */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-24 sm:h-26 rounded-lg bg-slate-50/30 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-900 opacity-40"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
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
                className={`group relative h-24 sm:h-26 p-2 rounded-lg border transition-colors flex flex-col justify-between cursor-pointer select-none ${getBorderColorByStatus(
                  log?.status,
                  isWorkday
                )} ${
                  log?.isWorkday ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/80' : 'opacity-60'
                }`}
              >
                {/* Cabecera del día */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold w-5 h-5 flex items-center justify-center rounded ${
                      dayNum === 18 && currentMonthIndex === 8 && currentYear === 2026
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {log?.checkInTime && (
                    <span className="font-mono text-[9px] text-slate-500 font-medium hidden sm:inline">
                      {log.checkInTime.slice(0, 5)}
                    </span>
                  )}
                </div>

                {/* Badge central */}
                <div className="my-1">
                  {getDayIndicator(log)}
                </div>

                {/* Pie del día */}
                <div className="text-[10px] text-slate-400 truncate">
                  {log?.slipMotive ? (
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {log.slipMotive.replace('_', ' ')}
                    </span>
                  ) : log?.checkOutTime ? (
                    <span className="font-mono text-slate-400">Sal: {log.checkOutTime.slice(0, 5)}</span>
                  ) : (
                    <span>--</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Inspección del Día */}
      {selectedDayLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Ficha de Jornada: {selectedDayLog.dayName} {selectedDayLog.dayNumber} de {monthName}
                  </h4>
                  <p className="text-xs text-slate-500">{workerName} • Registro de Entrada y Salida</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayLog(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Estado de la Marcación:</span>
                <Badge value={selectedDayLog.status} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Hora de Entrada:</span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {selectedDayLog.checkInTime ? `${selectedDayLog.checkInTime} AM` : 'Sin Marcación'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Hora de Salida:</span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {selectedDayLog.checkOutTime ? `${selectedDayLog.checkOutTime} PM` : 'Sin Registro'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Minutos Tardanza:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedDayLog.delayMinutes > 0 ? `+${selectedDayLog.delayMinutes} minutos` : '0 min (Puntual)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Impacto en Liquidación:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedDayLog.delayMinutes > 0
                      ? `- S/ ${(selectedDayLog.delayMinutes * costPerMinute).toFixed(2)}`
                      : selectedDayLog.status === 'FALTA'
                      ? `- S/ ${(baseSalary / 30).toFixed(2)} (Falta)`
                      : 'Sin descuento'}
                  </span>
                </div>
              </div>

              {selectedDayLog.authorizedBy && (
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Autorización de Ingreso Fuera de Tolerancia</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Aprobado formalmente por: <strong>{selectedDayLog.authorizedBy === 'JEFE_PLANTA' ? 'Jefe de Planta (Ing. Carlos Mendoza)' : 'Gerencia General'}</strong>
                  </p>
                  {selectedDayLog.authorizationDocId && (
                    <span className="inline-block text-[10px] font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      Doc. Ref: {selectedDayLog.authorizationDocId}
                    </span>
                  )}
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Observación de Recursos Humanos:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedDayLog.notes || 'Jornada laboral ordinaria cumplida conforme a turno.'}
                </p>
              </div>

              {selectedDayLog.status === 'JUSTIFICADO' && (
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />
                  <span>
                    <strong>Protección Salarial:</strong> Con papeleta o descanso médico justificado, este día <strong>no reduce el % de efectividad</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDayLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
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
