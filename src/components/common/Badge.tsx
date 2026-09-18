import React from 'react';
import type { WorkerType, WorkerStatus, ScanType, ScanStatus, AttendancePunctuality } from '../../types';

interface BadgeProps {
  type?: 'worker' | 'status' | 'scanType' | 'scanStatus' | 'punctuality';
  value: WorkerType | WorkerStatus | ScanType | ScanStatus | AttendancePunctuality | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ value, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold tracking-tight',
    lg: 'text-sm px-3 py-1.5 rounded-lg font-bold tracking-tight',
  }[size];

  // Worker Type: Empleado Interno vs Contratista
  if (value === 'EMPLEADO_INTERNO') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100"></span>
        Planilla Interna
      </span>
    );
  }

  if (value === 'CONTRATISTA') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-zinc-900 text-zinc-100 border border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-200 ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
        Contratista
      </span>
    );
  }

  // Scan Types: Entrada / Salida
  if (value === 'ENTRADA') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 ${sizeClasses} ${className}`}
      >
        <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Entrada
      </span>
    );
  }

  if (value === 'SALIDA') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 ${sizeClasses} ${className}`}
      >
        <svg className="w-3 h-3 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Salida
      </span>
    );
  }

  // Punctuality & Statuses
  switch (value) {
    case 'A_TIEMPO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-900 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
          A tiempo (≤ 7:30)
        </span>
      );

    case 'TARDANZA_DESCUENTO':
    case 'TARDANZA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Tardanza (7:30 - 7:35)
        </span>
      );

    case 'PUERTA_CERRADA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-900 text-white border border-zinc-800 dark:bg-white dark:text-black dark:border-zinc-200 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Puerta Cerrada (&gt; 07:35)
        </span>
      );

    case 'ACTIVO':
    case 'AUTORIZADO':
    case 'VIGENTE':
    case 'APROBADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-900 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
          {value === 'AUTORIZADO' ? 'Autorizado' : value === 'ACTIVO' ? 'Activo' : value === 'APROBADO' ? 'Aprobado' : 'Vigente'}
        </span>
      );

    case 'EN_OBSERVACION':
    case 'POR_VENCER':
    case 'PENDIENTE':
    case 'FUERA_DE_TURNO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {value === 'POR_VENCER' ? 'Por Vencer' : value === 'PENDIENTE' ? 'Pendiente' : value}
        </span>
      );

    case 'FALTA':
    case 'BLOQUEADO':
    case 'DENEGADO':
    case 'VENCIDO':
    case 'RECHAZADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-200 text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400"></span>
          {value === 'DENEGADO' ? 'Acceso Denegado' : value === 'FALTA' ? 'Falta Injustificada' : value === 'BLOQUEADO' ? 'Bloqueado' : value}
        </span>
      );

    case 'JUSTIFICADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
          Justificado / Permiso
        </span>
      );

    // Paper Slip Motives
    case 'DESCANSO_MEDICO':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400"></span>
          Descanso Médico
        </span>
      );
    case 'ATENCION_MEDICA':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
          Atención Médica
        </span>
      );
    case 'PERMISO_PERSONAL':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-900 border border-zinc-400 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-600 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Permiso Personal (Sin Contraprestación)
        </span>
      );
    case 'COMISION_SERVICIO':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400"></span>
          Comisión de Servicio
        </span>
      );
    case 'ONOMASTICO':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400"></span>
          Onomástico
        </span>
      );
    case 'VACACIONES':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-900 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 font-bold ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
          Vacaciones
        </span>
      );
    case 'CAPACITACION':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
          Capacitación Oficializada
        </span>
      );
    case 'OMISION_MARCADO':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
          Omisión de Marcado
        </span>
      );
    case 'INGRESO_FUERA_TOLERANCIA':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-900 text-white border border-zinc-800 dark:bg-white dark:text-black dark:border-zinc-200 font-bold ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Autorización Fuera de Tolerancia
        </span>
      );
    case 'COMPENSACION_HORAS':
      return (
        <span className={`inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
          Compensación de Horas
        </span>
      );

    case 'NO_REGISTRADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-zinc-200 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 ${sizeClasses} ${className}`}
        >
          No Registrado
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 ${sizeClasses} ${className}`}
        >
          {value}
        </span>
      );
  }
};
