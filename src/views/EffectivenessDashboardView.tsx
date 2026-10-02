import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { AttendanceCalendar } from '../components/effectiveness/AttendanceCalendar';
import { EffectivenessKPIs } from '../components/effectiveness/EffectivenessKPIs';
import { EffectivenessGauge } from '../components/effectiveness/EffectivenessGauge';
import { VacationTracker } from '../components/vacations/VacationTracker';
import { PaperSlipModal } from '../components/requests/PaperSlipModal';
import type { Worker, DailyAttendanceSummary, PaperSlipMotive } from '../types';
import {
  Gauge,
  Calendar,
  Clock,
  Search,
  Plus,
} from 'lucide-react';

export const EffectivenessDashboardView: React.FC = () => {
  const {
    workers,
    getWorkerStats,
    selectedWorkerForStats,
    setSelectedWorkerForStats,
    addPaperSlip,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('ALL');

  // Modal State for Digital Paper Slip
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);
  const [slipInitialMotive, setSlipInitialMotive] = useState<PaperSlipMotive>('PERMISO_PERSONAL');

  const activeWorker = workers.find((w: Worker) => Number(w.id) === Number(selectedWorkerForStats)) || workers[0];
  const stats = getWorkerStats(activeWorker.id);

  const filteredWorkersList = workers.filter((w: Worker) => {
    const q = searchTerm.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.dni.includes(q) ||
      w.position.toLowerCase().includes(q) ||
      w.department.toLowerCase().includes(q)
    );
  });

  const filteredDailyLogs = stats.dailyLogs.filter((log: DailyAttendanceSummary) => {
    if (activeFilterStatus === 'ALL') return true;
    if (activeFilterStatus === 'WORKDAYS') return log.isWorkday;
    return log.status === activeFilterStatus;
  });

  const handleOpenVacationModal = () => {
    setSlipInitialMotive('VACACIONES');
    setIsSlipModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Corporativo & Selector Rápido */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <Gauge className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dashboard de Efectividad Individual
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de puntualidad (≤ 07:30 AM), tolerancia, faltas y liquidación salarial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSlipInitialMotive('PERMISO_PERSONAL');
              setIsSlipModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Emitir Papeleta</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-600 dark:text-slate-400">Mes:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="2026-09" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Septiembre 2026</option>
              <option value="2026-08" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Agosto 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selector Horizontal de Colaboradores */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Seleccionar Colaborador para Evaluación
          </span>
          <div className="relative w-48">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar colaboradores..."
              className="w-full pl-6 pr-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-[11px] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filteredWorkersList.map((w) => {
            const isSelected = Number(w.id) === Number(activeWorker.id);
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWorkerForStats(w.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border shrink-0 transition-colors cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <img
                  src={w.avatarUrl}
                  alt={w.name}
                  className="w-5 h-5 rounded-md object-cover border border-slate-300 dark:border-slate-700"
                />
                <span className="truncate max-w-[130px]">{w.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ficha de Identidad & Directiva de Tolerancia */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={activeWorker.avatarUrl}
            alt={activeWorker.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {activeWorker.name}
              </h2>
              <Badge value={activeWorker.type} size="sm" />
              <Badge value={activeWorker.status} size="sm" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {activeWorker.position} • <span className="font-semibold">{activeWorker.department}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono pt-0.5">
              <span>ID: <strong className="text-slate-800 dark:text-slate-200">#{activeWorker.id}</strong></span>
              <span>•</span>
              <span>DNI: <strong className="text-slate-800 dark:text-slate-200">{activeWorker.dni}</strong></span>
              <span>•</span>
              <span>Tag RFID: <strong className="text-slate-800 dark:text-slate-200">{activeWorker.rfidTag}</strong></span>
            </div>
          </div>
        </div>

        {/* Resumen de directiva */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 max-w-sm space-y-1">
          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
            Directiva Operativa:
          </span>
          <p className="text-[11px] leading-tight">
            • <strong>A tiempo:</strong> Marcación ≤ <strong>07:30:00 AM</strong>.<br />
            • <strong>Tardanza:</strong> 07:30:01 a 07:35:00 AM (Descuento computable).<br />
            • <strong>Puerta cerrada:</strong> &gt; 07:35 AM (Falta; requiere autorización de Planta).
          </p>
        </div>
      </div>

      {/* RASTREADOR DE VACACIONES CON REGLA ESTRICTA DE 365 DÍAS */}
      {activeWorker.type === 'EMPLEADO_INTERNO' && (
        <VacationTracker
          hireDate={activeWorker.fecha_ingreso || activeWorker.hireDate}
          vacationDaysAvailable={activeWorker.vacationDaysAvailable}
          workerName={activeWorker.name}
          workerType={activeWorker.type}
          onRequestVacation={handleOpenVacationModal}
        />
      )}

      {/* TOP 4 KPIS */}
      <EffectivenessKPIs
        attendedDays={stats.attendedDays}
        totalWorkdays={stats.totalWorkdays}
        absentDays={stats.absentDays}
        totalDelayMinutes={stats.totalDelayMinutes}
        tardyDays={stats.tardyDays}
        leavesCount={stats.leavesCount}
        leavesPercentageOfMonth={stats.leavesPercentageOfMonth}
        baseSalary={stats.baseSalary}
      />

      {/* GRID: GAUGE & CALENDARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <EffectivenessGauge
            effectivenessPercentage={stats.effectivenessPercentage}
            baseSalary={stats.baseSalary}
            salaryDeduction={stats.salaryDeduction}
            tardyDeduction={stats.tardyDeduction}
            absenceDeduction={stats.absenceDeduction}
            calculatedSalary={stats.calculatedSalary}
            punctualDays={stats.punctualDays}
            tardyDays={stats.tardyDays}
            absentDays={stats.absentDays}
            justifiedDays={stats.justifiedDays}
            totalDelayMinutes={stats.totalDelayMinutes}
          />
        </div>

        <div className="lg:col-span-7">
          <AttendanceCalendar
            dailyLogs={stats.dailyLogs}
            monthName={stats.month}
            workerName={activeWorker.name}
            baseSalary={stats.baseSalary}
          />
        </div>
      </div>

      {/* TABLA DÍA A DÍA */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Bitácora Detallada Día a Día ({stats.month})
            </h3>
            <p className="text-xs text-slate-500">
              Registros de entrada, tolerancia y afectación salarial.
            </p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilterStatus === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({stats.dailyLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('WORKDAYS')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilterStatus === 'WORKDAYS'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Laborables
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('TARDANZA_DESCUENTO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilterStatus === 'TARDANZA_DESCUENTO'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tardanzas ({stats.tardyDays})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('PUERTA_CERRADA')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilterStatus === 'PUERTA_CERRADA'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Puerta Cerrada
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('JUSTIFICADO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilterStatus === 'JUSTIFICADO'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Permisos ({stats.justifiedDays})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Día & Fecha</th>
                <th className="py-2.5 px-3">Hora Ingreso</th>
                <th className="py-2.5 px-3">Tolerancia / Tardanza</th>
                <th className="py-2.5 px-3">Hora Salida</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredDailyLogs.map((log: DailyAttendanceSummary) => {
                return (
                  <tr
                    key={log.date}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      !log.isWorkday ? 'opacity-50 bg-slate-50/50 dark:bg-slate-950/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold flex items-center justify-center text-slate-800 dark:text-slate-200 text-[10px]">
                          {log.dayNumber}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {log.dayName} {log.dayNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.date}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      {log.checkInTime ? `${log.checkInTime} AM` : '--:--:--'}
                    </td>

                    <td className="py-2.5 px-3">
                      {log.status === 'TARDANZA_DESCUENTO' ? (
                        <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">
                          +{log.delayMinutes} min sobre 7:30
                        </span>
                      ) : log.status === 'A_TIEMPO' && log.checkInTime ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          A tiempo (≤ 7:30)
                        </span>
                      ) : log.status === 'PUERTA_CERRADA' ? (
                        <span className="text-red-700 dark:text-red-400 font-mono font-semibold">
                          &gt; 07:35 AM ({log.delayMinutes} min)
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      {log.checkOutTime ? `${log.checkOutTime} PM` : '--'}
                    </td>

                    <td className="py-2.5 px-3">
                      {log.isWorkday ? (
                        <Badge value={log.status} size="sm" />
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          No Laborable
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                      {log.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Papeleta Oficial */}
      {isSlipModalOpen && (
        <PaperSlipModal
          isOpen={isSlipModalOpen}
          onClose={() => setIsSlipModalOpen(false)}
          workers={workers.filter((w) => w.type === 'EMPLEADO_INTERNO')}
          initialWorkerId={activeWorker.id}
          initialMotive={slipInitialMotive}
          onSubmitSlip={(newSlip) => addPaperSlip(newSlip)}
        />
      )}
    </div>
  );
};
