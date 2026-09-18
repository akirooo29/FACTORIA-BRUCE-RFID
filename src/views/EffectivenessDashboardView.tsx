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
  User,
  Printer,
  ChevronDown,
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
  const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState<boolean>(false);
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('ALL');

  // Modal State for Digital Paper Slip
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);
  const [slipInitialMotive, setSlipInitialMotive] = useState<PaperSlipMotive>('PERMISO_PERSONAL');

  const activeWorker = workers.find((w: Worker) => w.id === selectedWorkerForStats) || workers[0];
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Worker Quick Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <Gauge className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Dashboard de Efectividad Individual
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Control biométrico mensual de puntualidad (≤ 07:30 AM), tolerancia, faltas y liquidación salarial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Action button to create official slip */}
          <button
            type="button"
            onClick={() => {
              setSlipInitialMotive('PERMISO_PERSONAL');
              setIsSlipModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Emitir Papeleta</span>
          </button>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Periodo:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-zinc-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026-09" className="bg-white dark:bg-zinc-900">Septiembre 2026</option>
              <option value="2026-08" className="bg-white dark:bg-zinc-900">Agosto 2026</option>
              <option value="2026-07" className="bg-white dark:bg-zinc-900">Julio 2026</option>
            </select>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Ficha</span>
          </button>
        </div>
      </div>

      {/* WORKER SELECTOR BAR & QUICK SWITCHER */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-500" />
            Seleccionar Colaborador para Análisis:
          </span>

          {/* Searchable Dropdown Button */}
          <div className="relative w-full sm:w-80">
            <button
              type="button"
              onClick={() => setIsWorkerDropdownOpen(!isWorkerDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-left"
            >
              <span className="font-bold text-zinc-900 dark:text-white truncate">
                {activeWorker.name} ({activeWorker.code})
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
            </button>

            {isWorkerDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-fadeIn">
                <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar colaborador..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredWorkersList.map((w: Worker) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setSelectedWorkerForStats(w.id);
                        setIsWorkerDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                        w.id === activeWorker.id ? 'bg-zinc-100 dark:bg-zinc-800 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={w.avatarUrl}
                          alt={w.name}
                          className="w-7 h-7 rounded-md object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-900 dark:text-white truncate">{w.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{w.position}</p>
                        </div>
                      </div>
                      <Badge value={w.type} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Avatar Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {workers.map((w: Worker) => {
            const isSelected = w.id === activeWorker.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWorkerForStats(w.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
                  isSelected
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                <img
                  src={w.avatarUrl}
                  alt={w.name}
                  className="w-6 h-6 rounded-md object-cover border border-zinc-300 dark:border-zinc-700"
                />
                <span className="text-xs font-semibold truncate max-w-[120px]">{w.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WORKER IDENTITY CARD & OPERATIONAL RULES BANNER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={activeWorker.avatarUrl}
            alt={activeWorker.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-300 dark:border-zinc-700 shadow-sm shrink-0"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">
                {activeWorker.name}
              </h2>
              <Badge value={activeWorker.type} size="sm" />
              <Badge value={activeWorker.status} size="sm" />
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              {activeWorker.position} • <span className="font-semibold">{activeWorker.department}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
              <span>DNI: <strong className="text-zinc-800 dark:text-zinc-200">{activeWorker.dni}</strong></span>
              <span>•</span>
              <span>Cod: <strong className="text-zinc-800 dark:text-zinc-200">{activeWorker.code}</strong></span>
              <span>•</span>
              <span>Tag RFID: <strong className="text-zinc-800 dark:text-zinc-200">{activeWorker.rfidTag}</strong></span>
            </div>
          </div>
        </div>

        {/* Business Rules Summary Banner */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 max-w-md space-y-1">
          <span className="font-bold text-zinc-900 dark:text-white block uppercase tracking-wider text-[10px]">
            Reglas de Asistencia y Tolerancia:
          </span>
          <p className="text-[11px] leading-snug">
            • <strong>A tiempo:</strong> Marcación hasta las <strong>07:30:00 AM</strong>.<br />
            • <strong>Tardanza con descuento:</strong> De <strong>07:30:01 AM a 07:35:00 AM</strong>.<br />
            • <strong>Puerta Cerrada:</strong> Pasadas las <strong>07:35 AM</strong> (Falta por defecto; ingreso extraordinario requiere autorización exclusiva de Jefe de Planta o Gerente General).
          </p>
        </div>
      </div>

      {/* VACATION 1-YEAR PROGRESS TRACKER */}
      {activeWorker.type === 'EMPLEADO_INTERNO' && (
        <VacationTracker
          hireDate={activeWorker.hireDate}
          vacationDaysAvailable={activeWorker.vacationDaysAvailable}
          workerName={activeWorker.name}
          onRequestVacation={handleOpenVacationModal}
        />
      )}

      {/* TOP 4 EFFECTIVENESS KPIS */}
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

      {/* CENTER GRID: CIRCULAR DONUT GAUGE (LEFT) + INTERACTIVE CALENDAR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Prominent Circular Effectiveness Gauge (5 Cols) */}
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

        {/* Right: Interactive Monthly Calendar (7 Cols) */}
        <div className="lg:col-span-7">
          <AttendanceCalendar
            dailyLogs={stats.dailyLogs}
            monthName={stats.month}
            workerName={activeWorker.name}
            baseSalary={stats.baseSalary}
          />
        </div>
      </div>

      {/* DAILY ATTENDANCE BREAKDOWN TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              Bitácora Detallada Día a Día ({stats.month})
            </h3>
            <p className="text-xs text-zinc-500">
              Detalle cronológico de registros de entrada, tolerancia y afectación en liquidación salarial.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveFilterStatus('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilterStatus === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Todos ({stats.dailyLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('WORKDAYS')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilterStatus === 'WORKDAYS'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Laborables ({stats.dailyLogs.filter((l) => l.isWorkday).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('TARDANZA_DESCUENTO')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilterStatus === 'TARDANZA_DESCUENTO'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Tardanzas ({stats.tardyDays})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('PUERTA_CERRADA')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilterStatus === 'PUERTA_CERRADA'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Puerta Cerrada
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('JUSTIFICADO')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilterStatus === 'JUSTIFICADO'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Permisos ({stats.justifiedDays})
            </button>
          </div>
        </div>

        {/* Daily Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">Día & Fecha</th>
                <th className="py-3 px-3">Hora de Ingreso</th>
                <th className="py-3 px-3">Tolerancia / Tardanza</th>
                <th className="py-3 px-3">Hora de Salida</th>
                <th className="py-3 px-3">Estado Computado</th>
                <th className="py-3 px-3">Observación RRHH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredDailyLogs.map((log: DailyAttendanceSummary) => {
                return (
                  <tr
                    key={log.date}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !log.isWorkday ? 'opacity-50 bg-zinc-50/50 dark:bg-zinc-950/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono font-bold flex items-center justify-center text-zinc-900 dark:text-zinc-100 text-[11px]">
                          {log.dayNumber}
                        </span>
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white block">
                            {log.dayName} {log.dayNumber}
                          </span>
                          <span className="text-[10px] text-zinc-500">{log.date}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {log.checkInTime ? (
                        <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                          {log.checkInTime} AM
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">--:--:--</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {log.status === 'TARDANZA_DESCUENTO' ? (
                        <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">
                          +{log.delayMinutes} min sobre 07:30
                        </span>
                      ) : log.status === 'A_TIEMPO' && log.checkInTime ? (
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                          A tiempo (≤ 07:30)
                        </span>
                      ) : log.status === 'PUERTA_CERRADA' ? (
                        <span className="text-zinc-900 dark:text-white font-mono font-bold">
                          &gt; 07:35 AM ({log.delayMinutes} min)
                        </span>
                      ) : (
                        <span className="text-zinc-400">--</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {log.checkOutTime ? (
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">
                          {log.checkOutTime} PM
                        </span>
                      ) : (
                        <span className="text-zinc-400">--</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {log.isWorkday ? (
                        <Badge value={log.status} size="sm" />
                      ) : (
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          No Laborable
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                      {log.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAPER SLIP MODAL */}
      <PaperSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        workers={workers}
        initialWorkerId={activeWorker.id}
        initialMotive={slipInitialMotive}
        onSubmitSlip={(newSlip) => {
          addPaperSlip(newSlip);
        }}
      />
    </div>
  );
};
