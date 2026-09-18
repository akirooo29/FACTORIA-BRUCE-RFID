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
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    workers,
    attendanceLogs,
    setCurrentView,
    activeUserRole,
    setActiveContractorWarningModal,
    setAttemptedRestrictedSection,
  } = useApp();

  const internalCount = workers.filter((w: Worker) => w.type === 'EMPLEADO_INTERNO').length;
  const contractorCount = workers.filter((w: Worker) => w.type === 'CONTRATISTA').length;
  const totalScansToday = attendanceLogs.length;
  const activeInsidePlant = Math.max(3, attendanceLogs.filter((a: AttendanceRecord) => a.scanType === 'ENTRADA').length);

  const isContractor = activeUserRole === 'CONTRATISTA';

  const handleBenefitClick = (name: string) => {
    if (isContractor) {
      setAttemptedRestrictedSection(name);
      setActiveContractorWarningModal(true);
    } else {
      setCurrentView('requests');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              Sistema Operativo • Planta Metalmecánica
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Panel de Control <span className="text-zinc-500 dark:text-zinc-400">FactoriaBruceRFID</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
              Monitoreo integral de accesos por radiofrecuencia (UHF), control de puntualidad y trazabilidad de colaboradores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('attendance')}
              className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>Control de Asistencia</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('effectiveness')}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 transition-all"
            >
              <Gauge className="w-4 h-4" />
              <span>Ver Efectividad KPIs</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Personal en Planta */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Personal en Planta
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono">{activeInsidePlant}</span>
              <span className="text-xs text-zinc-500 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 94% aforo
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Con pase validado hoy</p>
          </div>
        </div>

        {/* KPI 2: Marcaciones RFID Hoy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Lecturas RFID Hoy
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono">{totalScansToday}</span>
              <span className="text-xs text-zinc-500 font-semibold">En vivo</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Puerta principal y talleres</p>
          </div>
        </div>

        {/* KPI 3: Empleados Internos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Planilla Interna
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono">{internalCount}</span>
              <span className="text-xs text-zinc-500 font-semibold">Planilla directa</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Beneficios y vacaciones activas</p>
          </div>
        </div>

        {/* KPI 4: Contratistas Tercerizados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Contratistas
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono">{contractorCount}</span>
              <span className="text-xs text-zinc-500 font-semibold">SCTR Auditado</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">3 empresas contratistas</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Feed & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Attendance Feed (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                Flujo de Accesos en Antenas
              </h2>
              <p className="text-xs text-zinc-500">Registros automáticos de torniquetes</p>
            </div>

            <button
              onClick={() => setCurrentView('attendance')}
              className="text-xs font-semibold text-zinc-900 dark:text-white hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {attendanceLogs.slice(0, 5).map((record: AttendanceRecord) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={record.avatarUrl}
                    alt={record.workerName}
                    className="w-9 h-9 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{record.workerName}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{record.workerPosition}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge value={record.workerType} size="sm" />
                      {record.punctuality && <Badge value={record.punctuality} size="sm" />}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white block">
                    {record.timeFormatted}
                  </span>
                  <Badge value={record.scanType} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Insights & Quick Navigation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Profile Status Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-zinc-500" />
                Régimen Laboral Actual
              </span>
              <Badge value={activeUserRole} size="md" />
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {isContractor ? (
                <>
                  Estás visualizando el sistema como <strong className="text-zinc-900 dark:text-white">Personal Contratista</strong>. Los módulos de <em>Vacaciones, Permisos y Descansos Médicos</em> se encuentran bloqueados para este perfil.
                </>
              ) : (
                <>
                  Estás visualizando el sistema como <strong className="text-zinc-900 dark:text-white">Empleado de Planilla</strong>. Cuentas con acceso a todas las solicitudes de vacaciones y licencias remuneradas.
                </>
              )}
            </p>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Accesos a Solicitudes:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleBenefitClick('Vacaciones')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isContractor
                      ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-bold block truncate">Vacaciones</span>
                  <span className="text-[9px] text-zinc-500">
                    {isContractor ? 'Bloqueado' : 'Disponible'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBenefitClick('Permisos')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isContractor
                      ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-bold block truncate">Permisos</span>
                  <span className="text-[9px] text-zinc-500">
                    {isContractor ? 'Bloqueado' : 'Disponible'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBenefitClick('Descansos Médicos')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isContractor
                      ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-bold block truncate">D. Médicos</span>
                  <span className="text-[9px] text-zinc-500">
                    {isContractor ? 'Bloqueado' : 'Disponible'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Connected RFID Antennas Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-zinc-500" />
              Estado de Lectores RFID en Planta
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-700 dark:text-zinc-300">TRM-01: Puerta Principal</span>
                <span className="text-[10px] text-zinc-800 dark:text-zinc-200 font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                  Online (99.8%)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-700 dark:text-zinc-300">TRM-02: Acceso Contratistas</span>
                <span className="text-[10px] text-zinc-800 dark:text-zinc-200 font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                  Online (100%)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-700 dark:text-zinc-300">TRM-03: Taller Metalmecánico</span>
                <span className="text-[10px] text-zinc-800 dark:text-zinc-200 font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                  Online (100%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
