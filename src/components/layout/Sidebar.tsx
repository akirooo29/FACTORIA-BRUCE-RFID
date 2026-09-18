import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Clock,
  Users,
  FileText,
  CalendarDays,
  FileHeart,
  FileSpreadsheet,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  HardHat,
  Gauge,
  Cpu,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeUserRole,
    sidebarCollapsed,
    setSidebarCollapsed,
    setActiveContractorWarningModal,
    setAttemptedRestrictedSection,
    attendanceLogs,
    workers,
  } = useApp();

  const isContractor = activeUserRole === 'CONTRATISTA';

  const handleRestrictedClick = (featureName: string) => {
    if (isContractor) {
      setAttemptedRestrictedSection(featureName);
      setActiveContractorWarningModal(true);
    } else {
      setCurrentView('requests');
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard General',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'effectiveness',
      label: 'Efectividad Individual',
      icon: Gauge,
      badge: 'Mensual',
      highlight: true,
    },
    {
      id: 'attendance',
      label: 'Control de Asistencia',
      icon: Clock,
      badge: attendanceLogs.length.toString(),
    },
    {
      id: 'personnel',
      label: 'Gestión de Personal',
      icon: Users,
      badge: workers.length.toString(),
    },
    {
      id: 'requests',
      label: 'Papeletas & Solicitudes',
      icon: FileText,
      badge: isContractor ? 'Restringido' : null,
      isRestricted: isContractor,
    },
  ];

  const employeeBenefits = [
    {
      id: 'vacaciones',
      label: 'Vacaciones Anuales',
      icon: CalendarDays,
    },
    {
      id: 'permisos',
      label: 'Permisos & Licencias',
      icon: FileSpreadsheet,
    },
    {
      id: 'descansos',
      label: 'Descansos Médicos',
      icon: FileHeart,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 z-30 select-none ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-sm shrink-0 border border-zinc-300 dark:border-zinc-700">
            <Cpu className="w-5 h-5" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1">
                FACTORIA<span className="text-zinc-500 dark:text-zinc-400">BRUCE</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100"></span>
                RFID Access v3.0
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95"
          title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Profile Mode Indicator Card */}
      {!sidebarCollapsed ? (
        <div className="mx-3 my-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              Perfil Activo:
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border ${
                isContractor
                  ? 'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
                  : 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
              }`}
            >
              {isContractor ? <HardHat className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {isContractor ? 'Contratista' : 'Empleado'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
            {isContractor
              ? 'Acceso restringido a módulos de beneficios de planilla.'
              : 'Acceso total a solicitudes y gestión de personal.'}
          </p>
        </div>
      ) : (
        <div className="flex justify-center my-3">
          <div
            title={`Perfil: ${isContractor ? 'Contratista' : 'Empleado Interno'}`}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
          >
            {isContractor ? <HardHat className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        <div>
          {!sidebarCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Navegación Principal
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                      isActive ? 'text-white dark:text-black' : 'text-zinc-500'
                    }`}
                  />

                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                            isActive
                              ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-900'
                              : item.isRestricted
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Benefits & Employee Requests (STRICT CONDITIONAL LOGIC) */}
        <div>
          {!sidebarCollapsed && (
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Beneficios de Planilla
              </span>
              {isContractor && (
                <span className="text-[9px] font-bold text-zinc-500 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                  <Lock className="w-2.5 h-2.5" /> Bloqueado
                </span>
              )}
            </div>
          )}

          <div className="space-y-1">
            {employeeBenefits.map((benefit) => {
              const Icon = benefit.icon;

              if (isContractor) {
                // CONTRACTOR PERSPECTIVE: Strictly blocked
                return (
                  <button
                    key={benefit.id}
                    type="button"
                    onClick={() => handleRestrictedClick(benefit.label)}
                    title={
                      sidebarCollapsed
                        ? `${benefit.label} (No aplica a contratistas)`
                        : undefined
                    }
                    className="w-full group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/40 cursor-not-allowed opacity-60 hover:opacity-100 transition-all"
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                      <Lock className="w-2.5 h-2.5 text-zinc-600 dark:text-zinc-400 absolute -top-1 -right-1" />
                    </div>

                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="line-through text-zinc-400 dark:text-zinc-600">{benefit.label}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded font-semibold">
                          No Aplica
                        </span>
                      </div>
                    )}
                  </button>
                );
              }

              // INTERNAL EMPLOYEE PERSPECTIVE: Active & enabled
              return (
                <button
                  key={benefit.id}
                  type="button"
                  onClick={() => setCurrentView('requests')}
                  title={sidebarCollapsed ? benefit.label : undefined}
                  className="w-full group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                >
                  <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white" />
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span>{benefit.label}</span>
                      <span className="text-[9px] text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                        Disponible
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200">
              <Building className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Planta Metalmecánica</p>
              <p className="text-[10px] text-zinc-500 truncate">Trujillo • Perú</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
