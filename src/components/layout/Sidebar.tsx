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
  Building,
  UserCheck,
  HardHat,
  Gauge,
  Radio,
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
    {
      id: 'scanner',
      label: 'Simulador RFID',
      icon: Radio,
      badge: 'En vivo',
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
      className={`relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 z-30 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header Minimalista */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shrink-0 font-bold text-xs">
            FB
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white truncate">
                FACTORÍA BRUCE
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Sistema RFID
              </span>
            </div>
          )}
        </div>

        {/* Botón de Colapsar */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Indicador de Perfil */}
      {!sidebarCollapsed ? (
        <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Régimen Activo
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700 dark:text-slate-300">
              {isContractor ? <HardHat className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {isContractor ? 'Contratista' : 'Planilla'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            {isContractor
              ? 'Acceso a solicitudes restringido.'
              : 'Gestión total de asistencia y personal.'}
          </p>
        </div>
      ) : null}

      {/* Navegación Principal */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        <div>
          {!sidebarCollapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Menú Principal
            </div>
          )}

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isActive
                              ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-900'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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

        {/* Sección de Beneficios & Solicitudes */}
        <div>
          {!sidebarCollapsed && (
            <div className="px-2 mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <span>Beneficios Laborales</span>
              {isContractor && <span className="text-[9px] text-amber-600">Restringido</span>}
            </div>
          )}

          <div className="space-y-0.5">
            {employeeBenefits.map((benefit) => {
              const Icon = benefit.icon;

              if (isContractor) {
                return (
                  <button
                    key={benefit.id}
                    type="button"
                    onClick={() => handleRestrictedClick(benefit.label)}
                    title={sidebarCollapsed ? `${benefit.label} (No aplica a contratistas)` : undefined}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-not-allowed opacity-70"
                  >
                    <div className="relative">
                      <Icon className="w-3.5 h-3.5" />
                      <Lock className="w-2 h-2 text-slate-500 absolute -top-1 -right-1" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="line-through truncate">{benefit.label}</span>
                        <span className="text-[9px] text-slate-400 font-mono">No aplica</span>
                      </div>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={benefit.id}
                  type="button"
                  onClick={() => setCurrentView('requests')}
                  title={sidebarCollapsed ? benefit.label : undefined}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{benefit.label}</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Activo</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Minimalista */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2 text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">Planta Metalmecánica</p>
              <p className="text-[10px] text-slate-400 truncate">Trujillo, Perú</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-slate-400">
            <Building className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </aside>
  );
};
