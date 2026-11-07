import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  RefreshCw,
  Activity,
  X,
} from 'lucide-react';

interface FatigueScore {
  trabajadorId: number;
  nombre: string;
  minutosTardanza: number;
  horasExtra: number;
  riesgoFatiga: number;
}

export const EffectivenessDashboardView: React.FC = () => {
  const {
    workers,
    getWorkerStats,
    selectedWorkerForStats,
    setSelectedWorkerForStats,
    fetchWorkerAttendances,
    addPaperSlip,
    isLoadingAttendances,
    isLoadingWorkers,
    attendancesError,
    reloadAttendances,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('ALL');

  // Cálculo derivado de año y mes para sincronización global con el calendario
  const [yearStr, monthStr] = selectedMonth.split('-');
  const currentYear = parseInt(yearStr, 10) || 2026;
  const currentMonthIndex = (parseInt(monthStr, 10) || 10) - 1;

  const handleMonthChange = (year: number, monthIndex: number) => {
    const formattedMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    setSelectedMonth(formattedMonth);
  };

  // Modal State for Digital Paper Slip
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);
  const [slipInitialMotive, setSlipInitialMotive] = useState<PaperSlipMotive>('PERMISO_PERSONAL');

  // Estados para Diagnóstico IA (ML.NET - Vista Micro)
  const [showAiPanel, setShowAiPanel] = useState<boolean>(false);
  const [aiScore, setAiScore] = useState<FatigueScore | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const activeWorker = workers.find((w: Worker) => Number(w.id) === Number(selectedWorkerForStats)) || workers[0];
  const stats = activeWorker ? getWorkerStats(activeWorker.id, selectedMonth) : null;

  // Sincronización inmediata en el primer renderizado para evitar el "estado fantasma" de Faltas
  useEffect(() => {
    if (activeWorker?.id) {
      fetchWorkerAttendances(activeWorker.id);
    }
  }, [activeWorker?.id, fetchWorkerAttendances]);

  // Lógica de Petición para el Diagnóstico IA del colaborador seleccionado
  const handleOpenAiDiagnostic = async () => {
    setShowAiPanel(true);
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('http://localhost:5216/api/ai/fatigue-scores');
      if (!response.ok) {
        throw new Error('Error al conectar con el motor de ML.NET');
      }
      const data: FatigueScore[] = await response.json();
      const matched = data.find(
        (item) => Number(item.trabajadorId) === Number(activeWorker?.id)
      );
      setAiScore(matched || null);
    } catch (err: any) {
      setAiError(err.message || 'Error al obtener diagnóstico de IA');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredWorkersList = workers.filter((w: Worker) => {
    const q = searchTerm.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.dni.includes(q) ||
      w.position.toLowerCase().includes(q) ||
      w.department.toLowerCase().includes(q)
    );
  });

  const filteredDailyLogs = stats ? stats.dailyLogs.filter((log: DailyAttendanceSummary) => {
    if (activeFilterStatus === 'ALL') return true;
    if (activeFilterStatus === 'WORKDAYS') return log.isWorkday;
    if (activeFilterStatus === 'VACACIONES') return log.status === 'VACACIONES' || log.slipMotive === 'VACACIONES';
    return log.status === activeFilterStatus;
  }) : [];

  const handleOpenVacationModal = () => {
    setSlipInitialMotive('VACACIONES');
    setIsSlipModalOpen(true);
  };

  if (isLoadingAttendances || isLoadingWorkers) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-700 text-sm font-semibold">Cargando registros de asistencia desde SQL Server...</p>
        <span className="text-slate-400 text-xs font-mono">GET http://localhost:5216/api/Asistencias</span>
      </div>
    );
  }

  if (!activeWorker || !stats) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No se encontraron colaboradores registrados para evaluar.</p>
      </div>
    );
  }

  const isRegular = activeWorker.type === 'TRABAJADOR_REGULAR' || activeWorker.type === 'EMPLEADO_INTERNO';

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Alerta de Error de Conexión si falló el fetch de Asistencias */}
      {attendancesError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Aviso de conexión SQL Server (Asistencias):</strong> {attendancesError}</span>
          </div>
          <button
            type="button"
            onClick={() => reloadAttendances()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar Conexión</span>
          </button>
        </div>
      )}
      {/* Header Corporativo & Selector Rápido */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
              <Gauge className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard de Efectividad Individual
            </h1>
          </div>
          <p className="text-xs text-slate-500">
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Emitir Papeleta</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Mes:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026-11">Noviembre 2026</option>
              <option value="2026-10">Octubre 2026 (SQL Server)</option>
              <option value="2026-09">Septiembre 2026</option>
              <option value="2026-08">Agosto 2026</option>
              {!['2026-11', '2026-10', '2026-09', '2026-08'].includes(selectedMonth) && (
                <option value={selectedMonth}>{stats.month || selectedMonth}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Selector Horizontal de Colaboradores */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Seleccionar Colaborador para Evaluación
          </span>
          <div className="relative w-48">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar colaboradores..."
              className="w-full pl-6 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] focus:outline-none focus:border-slate-900"
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
                    ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <img
                  src={w.avatarUrl}
                  alt={w.name}
                  className="w-5 h-5 rounded-md object-cover border border-slate-300"
                />
                <span className="truncate max-w-[130px]">{w.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ficha de Identidad & Directiva de Tolerancia */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={activeWorker.avatarUrl}
            alt={activeWorker.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {activeWorker.name}
              </h2>
              <Badge value={activeWorker.type} size="sm" />
              <Badge value={activeWorker.status} size="sm" />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {activeWorker.position} • <span className="font-semibold">{activeWorker.department}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono pt-0.5">
              <span>ID: <strong className="text-slate-800">#{activeWorker.id}</strong></span>
              <span>•</span>
              <span>DNI: <strong className="text-slate-800">{activeWorker.dni}</strong></span>
              <span>•</span>
              <span>Tag RFID: <strong className="text-slate-800">{activeWorker.rfidTag}</strong></span>
              <button
                type="button"
                onClick={handleOpenAiDiagnostic}
                className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-sans font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Diagnóstico IA de fatiga con ML.NET"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Diagnóstico IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de directiva */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-sm space-y-1">
          <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
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
      {isRegular && (
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
      />

      {/* GRID: GAUGE & CALENDARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <EffectivenessGauge
            effectivenessPercentage={stats.effectivenessPercentage}
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
            currentYear={currentYear}
            currentMonthIndex={currentMonthIndex}
            onMonthChange={handleMonthChange}
          />
        </div>
      </div>

      {/* TABLA DÍA A DÍA */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Bitácora Detallada Día a Día ({stats.month})
            </h3>
            <p className="text-xs text-slate-500">
              Registros de entrada, tolerancia y tiempo computable.
            </p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeFilterStatus === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({stats.dailyLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('WORKDAYS')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeFilterStatus === 'WORKDAYS'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laborables
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('TARDANZA_DESCUENTO')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeFilterStatus === 'TARDANZA_DESCUENTO'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tardanzas ({stats.tardyDays})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('PUERTA_CERRADA')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeFilterStatus === 'PUERTA_CERRADA'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Puerta Cerrada
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('JUSTIFICADO')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeFilterStatus === 'JUSTIFICADO'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Permisos ({stats.justifiedDays})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterStatus('VACACIONES')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeFilterStatus === 'VACACIONES'
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-700 hover:text-blue-900'
              }`}
            >
              Vacaciones ({stats.vacationDays})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Día & Fecha</th>
                <th className="py-2.5 px-3">Hora Ingreso</th>
                <th className="py-2.5 px-3">Tolerancia / Tardanza</th>
                <th className="py-2.5 px-3">Hora Salida Oficial</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDailyLogs.map((log: DailyAttendanceSummary) => {
                return (
                  <tr
                    key={log.date}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !log.isWorkday ? 'opacity-50 bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-100 font-mono font-bold flex items-center justify-center text-slate-800 text-[10px]">
                          {log.dayNumber}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">
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
                        <span className="font-mono text-slate-900 font-bold">
                          +{log.delayMinutes} min sobre 7:30
                        </span>
                      ) : log.status === 'A_TIEMPO' && log.checkInTime ? (
                        <span className="text-emerald-700 font-semibold">
                          A tiempo (≤ 7:30)
                        </span>
                      ) : log.status === 'PUERTA_CERRADA' ? (
                        <span className="text-red-700 font-mono font-bold">
                          &gt; 07:35 AM ({log.delayMinutes} min)
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      {log.checkOutTime ? (
                        <span>
                          {log.checkOutTime} PM
                          <span className="text-[10px] text-slate-400 font-sans ml-1">
                            ({log.dayName === 'Sáb' ? 'Sáb 13:00' : 'L-V 16:30'})
                          </span>
                        </span>
                      ) : log.status === 'VACACIONES' ? (
                        <span className="text-blue-700 font-semibold text-[11px]">
                          Vacaciones
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      {log.isWorkday ? (
                        <Badge value={log.status} size="sm" />
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
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
          workers={workers}
          initialWorkerId={activeWorker.id}
          initialMotive={slipInitialMotive}
          onSubmitSlip={(newSlip) => addPaperSlip(newSlip)}
        />
      )}

      {/* Modal / Panel Superpuesto de Diagnóstico IA (ML.NET) */}
      {showAiPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowAiPanel(false)}
        >
          <div
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Diagnóstico IA • Riesgo de Fatiga
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeWorker.name} • <span className="font-mono">#{activeWorker.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiPanel(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Dinámico */}
            {isAiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-600 font-semibold animate-pulse">
                  Consultando predicciones de ML.NET...
                </p>
              </div>
            ) : aiError ? (
              <div className="py-8 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">No se pudo obtener el diagnóstico</p>
                <p className="text-xs text-red-600">{aiError}</p>
                <button
                  type="button"
                  onClick={handleOpenAiDiagnostic}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            ) : aiScore ? (
              <div className="py-5 space-y-5">
                {/* Porcentaje de Riesgo de Fatiga en tamaño grande */}
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nivel de Riesgo de Fatiga
                  </span>
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-5xl font-black tracking-tight ${
                        aiScore.riesgoFatiga >= 80
                          ? 'text-red-600'
                          : aiScore.riesgoFatiga >= 40
                          ? 'text-amber-500'
                          : 'text-emerald-600'
                      }`}
                    >
                      {Math.round(aiScore.riesgoFatiga)}%
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      aiScore.riesgoFatiga >= 80
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : aiScore.riesgoFatiga >= 40
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {aiScore.riesgoFatiga >= 80
                      ? 'Riesgo Crítico de Fatiga (≥ 80%)'
                      : aiScore.riesgoFatiga >= 40
                      ? 'Riesgo Moderado (40% - 79%)'
                      : 'Riesgo Bajo / Óptimo (< 40%)'}
                  </span>
                </div>

                {/* Barra de progreso (< 40% Verde, 40-79% Amarillo, >= 80% Rojo) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Intensidad de Fatiga</span>
                    <span>{aiScore.riesgoFatiga}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        aiScore.riesgoFatiga >= 80
                          ? 'bg-red-500'
                          : aiScore.riesgoFatiga >= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(Math.max(aiScore.riesgoFatiga, 5), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Desglose descriptivo de factores determinantes */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Desglose de Factores Determinantes
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-xs text-slate-500 block">Minutos de Tardanza</span>
                      <span className="text-lg font-bold text-slate-800">
                        {aiScore.minutosTardanza}{' '}
                        <span className="text-xs font-normal text-slate-500">min</span>
                      </span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-xs text-slate-500 block">Horas Extra</span>
                      <span className="text-lg font-bold text-slate-800">
                        {aiScore.horasExtra}{' '}
                        <span className="text-xs font-normal text-slate-500">hrs</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {aiScore.riesgoFatiga >= 80
                      ? 'La sobrecarga horaria y las demoras acumuladas indican probabilidad crítica de fatiga. Se sugiere coordinar pausas activas o compensación de turno.'
                      : aiScore.riesgoFatiga >= 40
                      ? 'Factores de sobretiempo moderados. Mantener supervisión preventiva en turnos de alta exigencia.'
                      : 'Patrón de asistencia regular y descanso equilibrado según el modelo predictivo de ML.NET.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No se encontraron registros de inferencia de IA para este colaborador.
              </div>
            )}

            {/* Pie del modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">Motor: ML.NET FastTree</span>
              <button
                type="button"
                onClick={() => setShowAiPanel(false)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
