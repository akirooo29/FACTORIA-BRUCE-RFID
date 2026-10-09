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
  Palmtree,
  FileHeart,
  FileText,
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
          Descanso
        </span>
      );
    }

    // 1. Vacaciones (Diferenciación visual estricta y sobria)
    if (log.status === 'VACACIONES' || log.slipMotive === 'VACACIONES') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          <Palmtree className="w-2.5 h-2.5 text-blue-600" />
          Vacaciones
        </span>
      );
    }

    // 2. Descanso Médico
    if (log.slipMotive === 'DESCANSO_MEDICO') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
          <FileHeart className="w-2.5 h-2.5 text-purple-600" />
          D. Médico
        </span>
      );
    }

    // 3. Permisos Generales / Justificados
    if (log.status === 'JUSTIFICADO') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
          <FileText className="w-2.5 h-2.5 text-slate-500" />
          Permiso
        </span>
      );
    }

    // 4. Estados regulares de asistencia
    switch (log.status) {
      case 'A_TIEMPO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Puntual
          </span>
        );
      case 'TARDANZA_DESCUENTO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            +{log.delayMinutes}m
          </span>
        );
      case 'PUERTA_CERRADA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            P. Cerrada
          </span>
        );
      case 'FALTA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Falta
          </span>
        );
      default:
        return null;
    }
  };

  const getBorderColorByStatus = (status?: AttendancePunctuality, isWorkday?: boolean, slipMotive?: string) => {
    if (!isWorkday) return 'border-dashed border-slate-200 bg-slate-50/50';
    if (status === 'VACACIONES' || slipMotive === 'VACACIONES') {
      return 'border-blue-300 hover:border-blue-500 bg-blue-50/30';
    }
    if (slipMotive === 'DESCANSO_MEDICO') {
      return 'border-purple-300 hover:border-purple-500 bg-purple-50/20';
    }
    switch (status) {
      case 'A_TIEMPO':
        return 'border-slate-300 hover:border-slate-900 bg-white';
      case 'TARDANZA_DESCUENTO':
        return 'border-amber-300 hover:border-amber-500 bg-amber-50/20';
      case 'PUERTA_CERRADA':
        return 'border-rose-300 hover:border-rose-500 bg-rose-50/20';
      case 'FALTA':
        return 'border-slate-300 hover:border-slate-500 bg-slate-100';
      case 'JUSTIFICADO':
        return 'border-slate-300 hover:border-slate-900 bg-slate-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const costPerMinute = (baseSalary / 30) / (8 * 60);

  return (
    <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-sm">
      {/* Calendar Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Calendario Mensual de Asistencia & Licencias
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Horarios de salida oficiales: Lunes a Viernes 16:30 hrs • Sábados 13:00 hrs.
          </p>
        </div>

        {/* Controles de Navegación de Mes */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-300">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs font-semibold text-slate-900 min-w-[120px] text-center font-mono">
            {monthNames[currentMonthIndex]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Leyenda Corporativa Diferenciada */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mr-0.5">
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
          <span>Falta / Puerta Cerrada</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-blue-800">
          <Palmtree className="w-3.5 h-3.5 text-blue-600" />
          <span>Vacaciones (Legal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Permisos</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-purple-800">
          <FileHeart className="w-3.5 h-3.5 text-purple-600" />
          <span>D. Médico</span>
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
              className="h-24 sm:h-26 rounded-lg bg-slate-50/30 border border-slate-100 opacity-40"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const log = currentMonthIndex === 8 && currentYear === 2026
              ? dailyLogs.find((l) => l.dayNumber === dayNum)
              : undefined;

            const isSunday = (startDayOffset + i) % 7 === 6;
            const isSaturday = (startDayOffset + i) % 7 === 5;
            const isWorkday = log ? log.isWorkday : !isSunday;

            const isVacation = log?.status === 'VACACIONES' || log?.slipMotive === 'VACACIONES';

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  if (log) setSelectedDayLog(log);
                }}
                className={`group relative h-24 sm:h-26 p-2 rounded-lg border transition-colors flex flex-col justify-between cursor-pointer select-none ${getBorderColorByStatus(
                  log?.status,
                  isWorkday,
                  log?.slipMotive
                )} ${
                  log?.isWorkday ? 'hover:bg-slate-50/80' : 'opacity-60'
                }`}
              >
                {/* Cabecera del día */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold w-5 h-5 flex items-center justify-center rounded ${
                      dayNum === 18 && currentMonthIndex === 8 && currentYear === 2026
                        ? 'bg-slate-900 text-white font-bold'
                        : isVacation
                        ? 'bg-blue-100 text-blue-900 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {log?.checkInTime ? (
                    <span className="font-mono text-[9px] text-slate-500 font-medium hidden sm:inline">
                      {log.checkInTime.slice(0, 5)}
                    </span>
                  ) : isSaturday ? (
                    <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">Sáb.</span>
                  ) : null}
                </div>

                {/* Badge central */}
                <div className="my-1">
                  {getDayIndicator(log)}
                </div>

                {/* Pie del día con horarios reales */}
                <div className="text-[10px] text-slate-500 truncate">
                  {isVacation ? (
                    <span className="font-semibold text-blue-700">
                      Vacaciones
                    </span>
                  ) : log?.slipMotive ? (
                    <span className="font-medium text-slate-700">
                      {log.slipMotive.replace('_', ' ')}
                    </span>
                  ) : log?.checkOutTime ? (
                    <span className="font-mono text-slate-500">Sal: {log.checkOutTime.slice(0, 5)}</span>
                  ) : !isWorkday ? (
                    <span className="text-slate-400 font-mono">--:--</span>
                  ) : (
                    <span className="text-slate-400 font-mono">{isSaturday ? '13:00' : '16:30'}</span>
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
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 text-slate-900 shadow-xl overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-900 border border-slate-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Ficha de Jornada: {selectedDayLog.dayName} {selectedDayLog.dayNumber} de {monthName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {workerName} • {selectedDayLog.dayName === 'Sáb' ? 'Horario Sábado (Salida: 13:00 hrs)' : 'Horario Lunes a Viernes (Salida: 16:30 hrs)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayLog(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700">Estado de la Marcación:</span>
                <Badge value={selectedDayLog.status} size="md" />
              </div>

              {/* Banner de Vacaciones */}
              {(selectedDayLog.status === 'VACACIONES' || selectedDayLog.slipMotive === 'VACACIONES') && (
                <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <Palmtree className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="block font-semibold mb-0.5">Período Vacacional Legal Aprobado:</strong>
                    Jornada cubierta conforme al rol de descanso anual oficial (30 días). Este día mantiene el 100% de remuneración y <strong>no reduce la efectividad mensual</strong>.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Hora de Entrada:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedDayLog.checkInTime ? `${selectedDayLog.checkInTime} AM` : 'Sin Marcación'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Hora de Salida Registrada:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedDayLog.checkOutTime ? `${selectedDayLog.checkOutTime} PM` : 'Sin Registro'}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    {selectedDayLog.dayName === 'Sáb' ? 'Salida oficial: 13:00 hrs' : 'Salida oficial: 16:30 hrs'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Minutos Tardanza:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedDayLog.delayMinutes > 0 ? `+${selectedDayLog.delayMinutes} minutos` : '0 min (Puntual)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Impacto en Liquidación:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedDayLog.delayMinutes > 0
                      ? `- S/ ${(selectedDayLog.delayMinutes * costPerMinute).toFixed(2)}`
                      : selectedDayLog.status === 'FALTA'
                      ? `- S/ ${(baseSalary / 30).toFixed(2)} (Falta)`
                      : 'Sin descuento'}
                  </span>
                </div>
              </div>

              {selectedDayLog.authorizedBy && (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Autorización de Ingreso Fuera de Tolerancia</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Aprobado formalmente por: <strong>{selectedDayLog.authorizedBy === 'JEFE_PLANTA' ? 'Jefe de Planta (Ing. Carlos Mendoza)' : 'Gerencia General'}</strong>
                  </p>
                  {selectedDayLog.authorizationDocId && (
                    <span className="inline-block text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      Doc. Ref: {selectedDayLog.authorizationDocId}
                    </span>
                  )}
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Observación de Recursos Humanos:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedDayLog.notes || 'Jornada laboral ordinaria cumplida conforme a turno.'}
                </p>
              </div>

              {selectedDayLog.status === 'JUSTIFICADO' && (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>
                    <strong>Protección Salarial:</strong> Con papeleta o descanso médico justificado, este día <strong>no reduce el % de efectividad</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedDayLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
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
