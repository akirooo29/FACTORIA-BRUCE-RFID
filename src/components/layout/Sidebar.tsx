import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Clock,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Building,
  BarChart3,
  TrendingDown,
  DollarSign,
  Gauge,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    adminRole,
    sidebarCollapsed,
    setSidebarCollapsed,
    attendanceLogs,
    workers,
    paperSlips,
  } = useApp();

  const isGerencia = adminRole === 'GERENCIA';

  // Menú exclusivo de Gerencia (Estrictamente Business Intelligence)
  const gerenciaNavItems = [
    {
      id: 'dashboard_bi',
      label: 'Dashboard BI Ejecutivo',
      icon: BarChart3,
      badge: 'KPIs',
      description: 'Paneles de alto nivel, asistencias vs faltas y puntualidad',
    },
    {
      id: 'economic_impact',
      label: 'Impacto Económico',
      icon: DollarSign,
      badge: 'Financiero',
      description: 'Cálculo referencial de pérdidas por tardanzas',
    },
    {
      id: 'incidences',
      label: 'Áreas con Más Incidencias',
      icon: TrendingDown,
      badge: 'Análisis',
      description: 'Matriz comparativa de tardanzas y ausentismo por área',
    },
    {
      id: 'effectiveness',
      label: 'Efectividad & Desempeño',
      icon: Gauge,
      badge: 'Auditoría',
      description: 'Métricas de efectividad individual y mensual',
    },
    {
      id: 'attendance',
      label: 'Supervisión de Marcaciones',
      icon: Clock,
      badge: attendanceLogs.length.toString(),
      description: 'Auditoría de lecturas RFID UHF en tiempo real',
    },
  ];

  // Menú exclusivo de Recursos Humanos (Estrictamente Operativo)
  const rrhhNavItems = [
    {
      id: 'dashboard',
      label: 'Panel Operativo RRHH',
      icon: LayoutDashboard,
      badge: null,
      description: 'Aforo de planta y actividad en tiempo real',
    },
    {
      id: 'personnel',
      label: 'Gestión de Personal & Horarios',
      icon: Users,
      badge: workers.length.toString(),
      description: 'Trabajadores regulares, contratistas y practicantes',
    },
    {
      id: 'attendance',
      label: 'Control de Asistencia RFID',
      icon: Clock,
      badge: attendanceLogs.length.toString(),
      description: 'Bitácora cronológica y tolerancias de ingreso',
    },
    {
      id: 'requests',
      label: 'Aprobación de Papeletas',
      icon: FileText,
      badge: paperSlips.length.toString(),
      description: 'Permisos, descansos médicos y vacaciones 365d',
    },
    {
      id: 'payroll_deductions',
      label: 'Cálculo de Descuentos',
      icon: Calculator,
      badge: 'Planilla',
      description: 'Descuentos referenciales por minuto de tardanza',
    },
    {
      id: 'effectiveness',
      label: 'Efectividad Individual',
      icon: Gauge,
      badge: null,
      description: 'Evaluación mensual de efectividad por trabajador',
    },
  ];

  const activeNavItems = isGerencia ? gerenciaNavItems : rrhhNavItems;

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-200 z-30 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shrink-0 font-bold text-xs tracking-tight shadow-xs">
            FB
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-tight text-slate-900 truncate">
                FACTORÍA BRUCE
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight truncate leading-tight">
                Control RFID & Business Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Botón de Colapsar */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Indicador de Entorno Activo */}
      {!sidebarCollapsed && (
        <div className="mx-3 my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Entorno Activo
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isGerencia ? 'bg-slate-900 text-white' : 'bg-blue-700 text-white'
            }`}>
              {isGerencia ? 'Gerencia (BI)' : 'RRHH Operativo'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug mt-1">
            {isGerencia
              ? 'Perspectiva analítica ejecutiva, análisis financiero y ausentismo.'
              : 'Operatividad de planta, padrón de personal, horarios y papeletas.'}
          </p>
        </div>
      )}

      {/* Navegación Principal */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        <div>
          {!sidebarCollapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isGerencia ? 'Módulos de Business Intelligence' : 'Módulos Operativos RRHH'}
            </div>
          )}

          <nav className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />

                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                            isActive
                              ? 'bg-slate-800 text-slate-200'
                              : 'bg-slate-200 text-slate-700'
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

        {/* Sección de Políticas y Normativa */}
        {!sidebarCollapsed && (
          <div className="pt-2 border-t border-slate-100">
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-500" />
              <span>Directiva 2026</span>
            </div>
            <div className="px-2 space-y-1 text-[11px] text-slate-600">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block text-[10px]">Tolerancia en Puerta:</span>
                <span>07:30 a 07:35 AM (con descuento). &gt;07:35 AM Puerta Cerrada.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Minimalista */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2 text-xs">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate text-[11px]">Factoría Bruce S.A.</p>
              <p className="text-[10px] text-slate-500 truncate">Parque Industrial • Trujillo, Perú</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-slate-400">
            <Building className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
