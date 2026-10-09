import React from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import type { AttendanceRecord, Worker } from '../types';
import {
  Users,
  Clock,
  Radio,
  HardHat,
  UserCheck,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Layers,
  Gauge,
  BarChart3,
  Calculator,
  CalendarDays,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    workers,
    attendanceLogs,
    setCurrentView,
    setAdminRole,
  } = useApp();

  const regularCount = workers.filter((w: Worker) => w.type === 'TRABAJADOR_REGULAR' || w.type === 'EMPLEADO_INTERNO').length;
  const contractorCount = workers.filter((w: Worker) => w.type === 'CONTRATISTA').length;
  const practicanteCount = workers.filter((w: Worker) => w.type === 'PRACTICANTE').length;
  const totalScansToday = attendanceLogs.length;
  const activeInsidePlant = Math.max(3, attendanceLogs.filter((a: AttendanceRecord) => a.scanType === 'ENTRADA').length);

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Welcome Banner Corporativo Operativo */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Operaciones de Recursos Humanos • Planta Trujillo</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Panel Operativo <span className="text-slate-500 font-normal">FactoriaBruceRFID</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              Supervisión de aforo en planta, bitácora de lectores RFID en tiempo real, gestión de horarios y regularización de papeletas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentView('attendance')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Control de Asistencia RFID</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminRole('GERENCIA')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Ir a Business Intelligence (Gerencia)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid Minimalista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Personal en Planta */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Personal en Planta
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{activeInsidePlant}</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Aforo activo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Con pase validado en torniquete</p>
          </div>
        </div>

        {/* KPI 2: Marcaciones RFID Hoy */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Marcaciones Hoy
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalScansToday}</span>
              <span className="text-xs text-slate-500 font-medium">Lecturas</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Entradas y salidas registradas</p>
          </div>
        </div>

        {/* KPI 3: Empleados Regulares */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Trabajadores Regulares
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{regularCount}</span>
              <span className="text-xs text-slate-500 font-medium">Planilla Directa</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Horario estándar L-V 16:30 | Sáb 13:00</p>
          </div>
        </div>

        {/* KPI 4: Contratistas & Practicantes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Contratistas & Practicantes
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {contractorCount + practicanteCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">Especiales</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {contractorCount} contratistas • {practicanteCount} practicantes
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Feed & Accesos Operativos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Attendance Feed (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Flujo de Accesos en Antenas RFID
              </h2>
              <p className="text-xs text-slate-500">Registros automáticos en tiempo real</p>
            </div>

            <button
              onClick={() => setCurrentView('attendance')}
              className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {attendanceLogs.slice(0, 5).map((record: AttendanceRecord) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={record.avatarUrl}
                    alt={record.workerName}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{record.workerName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{record.workerPosition}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge value={record.workerType} size="sm" />
                      {record.punctuality && <Badge value={record.punctuality} size="sm" />}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    {record.timeFormatted}
                  </span>
                  <Badge value={record.scanType} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accesos Rápidos RRHH & Estado del Hardware (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Módulos de Gestión Operativa
            </span>

            <p className="text-xs text-slate-600 leading-relaxed">
              Como administrador de Recursos Humanos, usted tiene acceso a la administración integral de personal, configuración de horarios y emisión de papeletas.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentView('personnel')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-800 mb-1" />
                <span className="text-xs font-bold block text-slate-900">Gestión de Personal</span>
                <span className="text-[10px] text-slate-500">Padrón & Horarios</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('requests')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 text-slate-800 mb-1" />
                <span className="text-xs font-bold block text-slate-900">Papeletas Oficiales</span>
                <span className="text-[10px] text-slate-500">Permisos & Vacaciones</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('payroll_deductions')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-slate-800 mb-1" />
                <span className="text-xs font-bold block text-slate-900">Descuentos Planilla</span>
                <span className="text-[10px] text-slate-500">Tardanzas por Minuto</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('effectiveness')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Gauge className="w-4 h-4 text-slate-800 mb-1" />
                <span className="text-xs font-bold block text-slate-900">Efectividad KPIs</span>
                <span className="text-[10px] text-slate-500">Auditoría Individual</span>
              </button>
            </div>
          </div>

          {/* Estado de Hardware RFID en Puerta Principal */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-slate-500" />
                Antena RFID • Entrada Principal
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                En línea
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Controlador UHF</span>
                <span className="font-mono text-slate-900 font-bold text-[11px]">
                  Torniquete 1 • LLRP Activo
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Frecuencia / Protocolo</span>
                <span className="font-mono text-slate-900 font-bold text-[11px]">
                  902-928 MHz (EPC Gen2)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
