import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceVsAbsenceChart } from '../components/bi/AttendanceVsAbsenceChart';
import { PunctualityDonutChart } from '../components/bi/PunctualityDonutChart';
import { EconomicDeductionKpiCard } from '../components/bi/EconomicDeductionKpiCard';
import { MonthlyAbsenteeismChart } from '../components/bi/MonthlyAbsenteeismChart';
import { AreaIncidencesChart } from '../components/bi/AreaIncidencesChart';
import { DEPARTMENT_BI_DATA } from '../data/mockData';
import {
  TrendingDown,
  Users,
  Shield,
  FileSpreadsheet,
  Check,
  Calendar,
} from 'lucide-react';

export const ExecutiveBiDashboardView: React.FC = () => {
  const { workers, setAdminRole } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');

  const totalWorkers = workers.length;
  const regularCount = workers.filter((w) => w.type === 'TRABAJADOR_REGULAR' || w.type === 'EMPLEADO_INTERNO').length;
  const contractorCount = workers.filter((w) => w.type === 'CONTRATISTA').length;
  const practicanteCount = workers.filter((w) => w.type === 'PRACTICANTE').length;

  const handleExportBiReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Welcome Banner Gerencial de Alto Nivel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Gerencia General • Business Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tablero Analítico Ejecutivo & Control de Asistencia RFID
            </h1>

            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Consolidado estratégico de puntualidad, ausentismo departamental, costos por minuto de tardanza e impacto financiero en Factoría Bruce S.A.
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
        {/* KPI 1: Tarjeta Requerida de Cálculo Referencial de Descuentos */}
        <div className="lg:col-span-2">
          <EconomicDeductionKpiCard workers={workers} />
        </div>

        {/* KPI 2: Aforo y Padrón Total */}
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
            <span className="text-slate-500">Credenciales RFID:</span>
            <span className="font-bold text-emerald-700">100% Vinculadas</span>
          </div>
        </div>

        {/* KPI 3: Tasa de Ausentismo */}
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
              <span className="text-3xl font-extrabold text-rose-600 font-mono">2.1%</span>
              <span className="text-xs text-slate-500 font-medium">Mes en curso</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              8 jornadas no justificadas detectadas en torniquetes.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Umbral máximo meta:</span>
            <span className="font-mono font-bold text-slate-700">&lt; 3.0%</span>
          </div>
        </div>
      </div>

      {/* Fila Principal de Gráficos BI: Barras Comparativas + Donut de Puntualidad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AttendanceVsAbsenceChart data={DEPARTMENT_BI_DATA} />
        </div>

        <div className="lg:col-span-1">
          <PunctualityDonutChart />
        </div>
      </div>

      {/* Fila Secundaria de Gráficos BI: Ausentismo Mensual + Áreas con Más Incidencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MonthlyAbsenteeismChart />
        <AreaIncidencesChart />
      </div>

      {/* Matriz de Desempeño Operativo e Impacto Económico por Área */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matriz Analítica Departamental de Incidencias & Descuentos
            </h3>
            <p className="text-xs text-slate-500">
              Desglose gerencial de puntualidad, minutos perdidos e impacto económico estimado por área de la planta.
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
                <th className="py-3 px-4 text-right">Impacto Financiero (S/.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {DEPARTMENT_BI_DATA.map((dept, index) => (
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
                    S/. {dept.economicDeductionImpact.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
              <tr>
                <td className="py-3 px-4 text-slate-900">Consolidado Total Planta</td>
                <td className="py-3 px-3 text-center font-mono">{DEPARTMENT_BI_DATA.reduce((a, b) => a + b.totalWorkers, 0)}</td>
                <td className="py-3 px-3 text-center font-mono">{DEPARTMENT_BI_DATA.reduce((a, b) => a + b.attendances, 0)}</td>
                <td className="py-3 px-3 text-center font-mono text-amber-700">{DEPARTMENT_BI_DATA.reduce((a, b) => a + b.tardiness, 0)}</td>
                <td className="py-3 px-3 text-center font-mono text-rose-700">{DEPARTMENT_BI_DATA.reduce((a, b) => a + b.absences, 0)}</td>
                <td className="py-3 px-3 text-right font-mono">{DEPARTMENT_BI_DATA.reduce((a, b) => a + b.totalDelayMinutes, 0)} min</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800">89.8% prom.</td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  S/. {DEPARTMENT_BI_DATA.reduce((a, b) => a + b.economicDeductionImpact, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
