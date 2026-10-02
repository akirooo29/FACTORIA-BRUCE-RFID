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
    <div className="space-y-5 animate-fadeIn">
      {/* Welcome Banner Corporativo Plano */}
      <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              Sistema Operativo • Planta Metalmecánica Trujillo
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Panel Principal <span className="text-slate-500 font-normal">FactoriaBruceRFID</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Monitoreo integral de accesos por radiofrecuencia (UHF), control de puntualidad y trazabilidad de colaboradores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentView('attendance')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Control de Asistencia</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('effectiveness')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Ver KPIs de Efectividad</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid Minimalista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Personal en Planta */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Personal en Planta
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{activeInsidePlant}</span>
              <span className="text-xs text-slate-500 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> 94% aforo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Con pase validado hoy</p>
          </div>
        </div>

        {/* KPI 2: Marcaciones RFID Hoy */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lecturas RFID Hoy
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalScansToday}</span>
              <span className="text-xs text-slate-500 font-medium">En vivo</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Puerta principal y talleres</p>
          </div>
        </div>

        {/* KPI 3: Empleados Internos */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Planilla Interna
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{internalCount}</span>
              <span className="text-xs text-slate-500 font-medium">Directos</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Beneficios y vacaciones de ley</p>
          </div>
        </div>

        {/* KPI 4: Contratistas Tercerizados */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contratistas
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{contractorCount}</span>
              <span className="text-xs text-slate-500 font-medium">Póliza SCTR</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Empresas tercerizadas</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Feed & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Attendance Feed (7 Cols) */}
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Flujo de Accesos en Antenas
              </h2>
              <p className="text-xs text-slate-500">Registros automáticos de torniquetes</p>
            </div>

            <button
              onClick={() => setCurrentView('attendance')}
              className="text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {attendanceLogs.slice(0, 5).map((record: AttendanceRecord) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={record.avatarUrl}
                    alt={record.workerName}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{record.workerName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{record.workerPosition}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge value={record.workerType} size="sm" />
                      {record.punctuality && <Badge value={record.punctuality} size="sm" />}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                    {record.timeFormatted}
                  </span>
                  <Badge value={record.scanType} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Insights & Quick Navigation (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Profile Status Box */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Régimen Laboral Actual
              </span>
              <Badge value={activeUserRole} size="md" />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isContractor ? (
                <>
                  Estás visualizando el sistema como <strong className="text-slate-900 dark:text-white">Personal Contratista</strong>. Los módulos de <em>Vacaciones, Permisos y Descansos Médicos</em> se encuentran bloqueados para este perfil.
                </>
              ) : (
                <>
                  Estás visualizando el sistema como <strong className="text-slate-900 dark:text-white">Empleado de Planilla</strong>. Cuentas con acceso a todas las solicitudes de vacaciones y licencias remuneradas.
                </>
              )}
            </p>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Accesos a Solicitudes:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleBenefitClick('Vacaciones')}
                  className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    isContractor
                      ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px] font-semibold block truncate">Vacaciones</span>
                  <span className="text-[10px] text-slate-500">
                    {isContractor ? 'Restringido' : 'Disponible'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBenefitClick('Permisos')}
                  className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    isContractor
                      ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px] font-semibold block truncate">Permisos</span>
                  <span className="text-[10px] text-slate-500">
                    {isContractor ? 'Restringido' : 'Disponible'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBenefitClick('Descansos Médicos')}
                  className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    isContractor
                      ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px] font-semibold block truncate">D. Médicos</span>
                  <span className="text-[10px] text-slate-500">
                    {isContractor ? 'Restringido' : 'Disponible'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Connected RFID Antennas Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-500" />
              Estado de Lectores RFID en Planta
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">TRM-01: Puerta Principal</span>
                <span className="text-[10px] text-slate-800 dark:text-slate-200 font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                  Online (99.8%)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">TRM-02: Acceso Contratistas</span>
                <span className="text-[10px] text-slate-800 dark:text-slate-200 font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                  Online (100%)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">TRM-03: Taller Metalmecánico</span>
                <span className="text-[10px] text-slate-800 dark:text-slate-200 font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
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
