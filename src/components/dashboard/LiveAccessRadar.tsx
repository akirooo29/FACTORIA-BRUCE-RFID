import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Radio,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { AttendanceRecord } from '../../types';

export const LiveAccessRadar: React.FC = () => {
  const { attendanceLogs, setCurrentView } = useApp();

  // Filtrar marcaciones correspondientes a HOY
  const todayLogs = useMemo(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear());
    const localYMD = `${year}-${month}-${day}`;
    const localDMY = `${day}/${month}/${year}`;
    const isoYMD = today.toISOString().split('T')[0];

    // Filtrar marcaciones de hoy (considerando zona horaria local de planta)
    let filtered = attendanceLogs.filter((log) => {
      if (!log.timestamp && !log.dateFormatted) return false;
      const tsDate = log.timestamp ? log.timestamp.split('T')[0] : '';
      return (
        tsDate === localYMD ||
        tsDate === isoYMD ||
        log.dateFormatted === localDMY
      );
    });

    // Fallback para entornos donde las fechas sean fijas / simuladas
    if (filtered.length === 0 && attendanceLogs.length > 0) {
      const sorted = [...attendanceLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const latestDate = sorted[0]?.timestamp ? sorted[0].timestamp.split('T')[0] : null;
      if (latestDate) {
        filtered = attendanceLogs.filter(
          (l) => l.timestamp && l.timestamp.startsWith(latestDate)
        );
      }
    }

    // Ordenar de la más reciente a la más antigua y mostrar las últimas 7
    return [...filtered]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7);
  }, [attendanceLogs]);

  // Asignación de Badge Visual según el estado de puntualidad requerido
  const renderStatusBadge = (punctuality?: string) => {
    switch (punctuality) {
      case 'A_TIEMPO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            A tiempo
          </span>
        );
      case 'TARDANZA_DESCUENTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            Tardanza
          </span>
        );
      case 'PUERTA_CERRADA':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Puerta Cerrada
          </span>
        );
    }
  };

  const getStatusBorderColor = (punctuality?: string) => {
    switch (punctuality) {
      case 'A_TIEMPO':
        return 'border-emerald-500 bg-emerald-500';
      case 'TARDANZA_DESCUENTO':
        return 'border-amber-500 bg-amber-500';
      case 'PUERTA_CERRADA':
      default:
        return 'border-rose-500 bg-rose-500';
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header del Radar en Vivo */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="p-2 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Radar de Accesos en Vivo
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white font-mono">
                EN VIVO
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Línea de tiempo vertical de marcaciones RFID UHF registradas hoy (Últimas 7)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('attendance')}
          className="text-xs font-bold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Bitácora completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline Vertical */}
      {todayLogs.length === 0 ? (
        <div className="py-10 text-center space-y-2 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <Radio className="w-6 h-6 text-slate-400 mx-auto animate-pulse" />
          <p className="text-xs font-semibold text-slate-700">Radar RFID en línea • Frecuencia 902-928 MHz</p>
          <p className="text-[11px] text-slate-500">Esperando primeras marcaciones de personal para el día de hoy.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {todayLogs.map((record: AttendanceRecord, index: number) => {
            const isFirst = index === 0;
            const dotColor = getStatusBorderColor(record.punctuality);

            return (
              <div
                key={record.id}
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border transition-all duration-200 ${
                  isFirst
                    ? 'bg-slate-50/90 border-slate-300 shadow-xs ring-1 ring-slate-900/5'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/60'
                }`}
              >
                {/* Timeline Pin Node */}
                <span
                  className={`absolute -left-[1.85rem] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ring-slate-100 flex items-center justify-center ${dotColor}`}
                >
                  {isFirst && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </span>

                {/* Info del Colaborador */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={record.avatarUrl}
                      alt={record.workerName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded text-[8px] font-bold font-mono bg-slate-900 text-white">
                      {record.scanType === 'SALIDA' ? 'SAL' : 'ENT'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {record.workerName}
                      </h4>
                      {isFirst && (
                        <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Reciente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                      <span className="flex items-center gap-1 truncate">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{record.workerDepartment}</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {record.rfidTag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hora y Badge de Estado */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono font-extrabold text-slate-900 block flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {record.timeFormatted}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Torniquete 1
                    </span>
                  </div>

                  {renderStatusBadge(record.punctuality)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer del Radar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Antena RFID UHF Operativa
        </span>
        <span className="font-mono font-bold text-slate-700">
          {todayLogs.length} marcaciones en radar
        </span>
      </div>
    </div>
  );
};
