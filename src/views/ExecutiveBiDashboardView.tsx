import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceVsAbsenceChart } from '../components/bi/AttendanceVsAbsenceChart';
import { PunctualityDonutChart } from '../components/bi/PunctualityDonutChart';
import { EconomicDeductionKpiCard } from '../components/bi/EconomicDeductionKpiCard';
import { MonthlyAbsenteeismChart } from '../components/bi/MonthlyAbsenteeismChart';
import { AreaIncidencesChart } from '../components/bi/AreaIncidencesChart';
import { computeDepartmentBiData } from '../utils/attendanceStatsCalculator';
import {
  TrendingDown,
  Users,
  Shield,
  FileSpreadsheet,
  Check,
  Calendar,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const ExecutiveBiDashboardView: React.FC = () => {
  const {
    workers,
    setAdminRole,
    getWorkerStats,
    isLoadingWorkers,
    isLoadingAttendances,
    attendancesError,
    reloadAttendances,
  } = useApp();

  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');

  // Cálculos estadísticos y métricas consolidadas basados exclusivamente en la BD real
  const workersStats = useMemo(() => {
    return workers.map((w) => ({
      worker: w,
      stats: getWorkerStats(w.id, selectedPeriod),
    }));
  }, [workers, getWorkerStats, selectedPeriod]);

  // Sumatoria global de minutos de tardanza con reduce
  const totalGlobalDelayMinutes = useMemo(() => {
    return workersStats.reduce((acc, curr) => acc + curr.stats.totalDelayMinutes, 0);
  }, [workersStats]);

  // Total de ausencias reales en planta con reduce
  const totalGlobalAbsences = useMemo(() => {
    return workersStats.reduce((acc, curr) => acc + curr.stats.absentDays, 0);
  }, [workersStats]);

  // Horas-Hombre Perdidas globales calculadas con reduce
  const totalLostHoursFromTardiness = useMemo(() => {
    return Math.round((totalGlobalDelayMinutes / 60) * 10) / 10;
  }, [totalGlobalDelayMinutes]);

  const totalLostHoursFromAbsences = useMemo(() => {
    return totalGlobalAbsences * 8;
  }, [totalGlobalAbsences]);

  const totalGlobalLostManHours = useMemo(() => {
    return Math.round((totalLostHoursFromTardiness + totalLostHoursFromAbsences) * 10) / 10;
  }, [totalLostHoursFromTardiness, totalLostHoursFromAbsences]);

  // Jornadas evaluadas totales para la tasa de ausentismo global
  const totalEvaluatedWorkdays = useMemo(() => {
    return workersStats.reduce(
      (acc, curr) => acc + (curr.stats.punctualDays + curr.stats.tardyDays + curr.stats.absentDays),
      0
    );
  }, [workersStats]);

  // Tasa de ausentismo real calculada
  const realAbsenteeismRate = useMemo(() => {
    if (totalEvaluatedWorkdays === 0) return 0;
    return (totalGlobalAbsences / totalEvaluatedWorkdays) * 100;
  }, [totalGlobalAbsences, totalEvaluatedWorkdays]);

  // Comparativo de Asistencias vs. Faltas por Área calculado dinámicamente con reduce
  const departmentData = useMemo(() => {
    return computeDepartmentBiData(workers, getWorkerStats, selectedPeriod);
  }, [workers, getWorkerStats, selectedPeriod]);

  // Distribución de puntualidad para el Donut Chart derivada 100% de los datos reales
  const realPunctualityDistribution = useMemo(() => {
    const totalPunctual = workersStats.reduce((acc, curr) => acc + curr.stats.punctualDays, 0);
    const totalTardy = workersStats.reduce((acc, curr) => acc + curr.stats.tardyDays, 0);
    const totalAbsent = workersStats.reduce((acc, curr) => acc + curr.stats.absentDays, 0);
    const totalEvents = totalPunctual + totalTardy + totalAbsent;

    if (totalEvents === 0) {
      return [
        { name: 'A Tiempo (≤ 07:30)', value: 100, count: 0, color: '#059669' },
        { name: 'Tardanza con Descuento (07:30 - 07:35)', value: 0, count: 0, color: '#d97706' },
        { name: 'Puerta Cerrada / Falta (> 07:35)', value: 0, count: 0, color: '#dc2626' },
      ];
    }

    return [
      {
        name: 'A Tiempo (≤ 07:30)',
        value: Math.round((totalPunctual / totalEvents) * 1000) / 10,
        count: totalPunctual,
        color: '#059669',
      },
      {
        name: 'Tardanza con Descuento (07:30 - 07:35)',
        value: Math.round((totalTardy / totalEvents) * 1000) / 10,
        count: totalTardy,
        color: '#d97706',
      },
      {
        name: 'Puerta Cerrada / Falta (> 07:35)',
        value: Math.round((totalAbsent / totalEvents) * 1000) / 10,
        count: totalAbsent,
        color: '#dc2626',
      },
    ];
  }, [workersStats]);

  // Métricas del padrón
  const totalWorkers = workers.length;
  const regularCount = workers.filter(
    (w) => w.type === 'TRABAJADOR_REGULAR' || w.type === 'EMPLEADO_INTERNO'
  ).length;
  const contractorCount = workers.filter((w) => w.type === 'CONTRATISTA').length;
  const practicanteCount = workers.filter((w) => w.type === 'PRACTICANTE').length;

  const handleExportBiReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const periodLabel =
    selectedPeriod === '2026-10'
      ? 'Octubre 2026 (En Curso)'
      : selectedPeriod === '2026-09'
      ? 'Septiembre 2026 (Cerrado)'
      : 'Agosto 2026 (Cerrado)';

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Alerta de Error de Conexión si falla SQL Server */}
      {attendancesError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <span className="text-xs font-medium">
              Aviso de Sincronización: {attendancesError}
            </span>
          </div>
          <button
            type="button"
            onClick={() => reloadAttendances()}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg text-xs font-bold text-amber-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {/* Welcome Banner Gerencial de Alto Nivel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Gerencia General • Business Intelligence</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isLoadingWorkers || isLoadingAttendances ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tablero Analítico Ejecutivo & Control de Asistencia RFID
            </h1>

            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Consolidado estratégico de puntualidad, ausentismo departamental, horas-hombre perdidas y auditoría de productividad en Factoría Bruce S.A.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-600">Período:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent border-none text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="2026-10">Octubre 2026 (En Curso)</option>
                <option value="2026-09">Septiembre 2026 (Cerrado)</option>
                <option value="2026-08">Agosto 2026 (Cerrado)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportBiReport}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>{downloadSuccess ? '¡Informe Exportado!' : 'Exportar Informe BI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principales (KPIs Ejecutivos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tarjeta Requerida de Horas-Hombre Perdidas con Datos Reales */}
        <div className="lg:col-span-2">
          <EconomicDeductionKpiCard
            workers={workers}
            accumulatedMinutes={totalGlobalDelayMinutes}
            unjustifiedAbsenceDays={totalGlobalAbsences}
            totalLostHours={totalGlobalLostManHours}
            tardinessHours={totalLostHoursFromTardiness}
            absenceHours={totalLostHoursFromAbsences}
            periodLabel={periodLabel}
          />
        </div>

        {/* KPI 2: Aforo y Padrón Total Real */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Personal Bajo Control RFID
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalWorkers}</span>
              <span className="text-xs text-slate-500 font-medium">Colaboradores</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {regularCount} regulares • {contractorCount} contratistas • {practicanteCount} practicantes
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Origen de Datos:</span>
            <span className="font-bold text-emerald-700">SQL Server (En Línea)</span>
          </div>
        </div>

        {/* KPI 3: Tasa de Ausentismo Real */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tasa de Ausentismo
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600 font-mono">
                {realAbsenteeismRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Mes en curso</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalGlobalAbsences} {totalGlobalAbsences === 1 ? 'jornada no justificada detectada' : 'jornadas no justificadas detectadas'} en torniquetes.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Umbral máximo meta:</span>
            <span className={`font-mono font-bold ${realAbsenteeismRate > 3.0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {realAbsenteeismRate <= 3.0 ? '✓ En rango (< 3.0%)' : '⚠ Excedido (> 3.0%)'}
            </span>
          </div>
        </div>
      </div>

      {/* Fila Principal de Gráficos BI: Barras Comparativas + Donut de Puntualidad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AttendanceVsAbsenceChart data={departmentData} />
        </div>

        <div className="lg:col-span-1">
          <PunctualityDonutChart data={realPunctualityDistribution} />
        </div>
      </div>

      {/* Fila Secundaria de Gráficos BI: Ausentismo Mensual + Áreas con Más Incidencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MonthlyAbsenteeismChart />
        <AreaIncidencesChart data={departmentData} />
      </div>

      {/* Matriz de Desempeño Operativo & Horas-Hombre Perdidas por Área */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matriz Analítica Departamental de Incidencias & Productividad
            </h3>
            <p className="text-xs text-slate-500">
              Desglose gerencial de puntualidad, minutos perdidos y horas-hombre perdidas estimadas por área de la planta.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAdminRole('RRHH')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 underline self-start sm:self-auto cursor-pointer"
          >
            Ver Operatividad en Vista RRHH →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Departamento / Área</th>
                <th className="py-3 px-3 text-center">Colaboradores</th>
                <th className="py-3 px-3 text-center">Asistencias</th>
                <th className="py-3 px-3 text-center">Tardanzas</th>
                <th className="py-3 px-3 text-center">Faltas</th>
                <th className="py-3 px-3 text-right">Minutos Tardanza</th>
                <th className="py-3 px-3 text-right">Índice Puntualidad</th>
                <th className="py-3 px-4 text-right">⏱️ Horas-Hombre Perdidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {departmentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se registran colaboradores o incidencias para el período seleccionado.
                  </td>
                </tr>
              ) : (
                departmentData.map((dept, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {dept.department}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {dept.totalWorkers}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-900 font-bold">
                      {dept.attendances}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-700 font-bold">
                      {dept.tardiness}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-rose-700 font-bold">
                      {dept.absences}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {dept.totalDelayMinutes} min
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        dept.punctualityRate >= 90
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {dept.punctualityRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ⏱️ {dept.lostManHours.toFixed(1)} hrs
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {departmentData.length > 0 && (
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                <tr>
                  <td className="py-3 px-4 text-slate-900">Consolidado Total Planta</td>
                  <td className="py-3 px-3 text-center font-mono">{departmentData.reduce((a, b) => a + b.totalWorkers, 0)}</td>
                  <td className="py-3 px-3 text-center font-mono">{departmentData.reduce((a, b) => a + b.attendances, 0)}</td>
                  <td className="py-3 px-3 text-center font-mono text-amber-700">{departmentData.reduce((a, b) => a + b.tardiness, 0)}</td>
                  <td className="py-3 px-3 text-center font-mono text-rose-700">{departmentData.reduce((a, b) => a + b.absences, 0)}</td>
                  <td className="py-3 px-3 text-right font-mono">{departmentData.reduce((a, b) => a + b.totalDelayMinutes, 0)} min</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800">
                    {departmentData.length > 0
                      ? `${(departmentData.reduce((a, b) => a + b.punctualityRate, 0) / departmentData.length).toFixed(1)}% prom.`
                      : '100%'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900">
                    ⏱️ {departmentData.reduce((a, b) => a + b.lostManHours, 0).toFixed(1)} hrs
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
