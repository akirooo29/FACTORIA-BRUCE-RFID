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
    sm: 'text-[10px] px-2 py-0.5 rounded font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded font-semibold tracking-tight',
    lg: 'text-sm px-3 py-1.5 rounded font-bold tracking-tight',
  }[size];

  // Worker Type: Trabajador (Regular) vs Contratista vs Practicante
  if (value === 'TRABAJADOR_REGULAR' || value === 'EMPLEADO_INTERNO') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
        Trabajador (Regular)
      </span>
    );
  }

  if (value === 'CONTRATISTA') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-slate-900 text-slate-100 border border-slate-800 ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Contratista
      </span>
    );
  }

  if (value === 'PRACTICANTE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        Practicante
      </span>
    );
  }

  // Scan Types: Entrada / Salida
  if (value === 'ENTRADA') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}
      >
        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Entrada
      </span>
    );
  }

  if (value === 'SALIDA') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses} ${className}`}
      >
        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          A tiempo (≤ 7:30)
        </span>
      );

    case 'TARDANZA_DESCUENTO':
    case 'TARDANZA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Tardanza (7:30 - 7:35)
        </span>
      );

    case 'PUERTA_CERRADA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-slate-900 text-white border border-slate-800 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Puerta Cerrada (&gt; 07:35)
        </span>
      );

    case 'ACTIVO':
    case 'AUTORIZADO':
    case 'VIGENTE':
    case 'APROBADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {value === 'AUTORIZADO' ? 'Autorizado' : value === 'ACTIVO' ? 'Activo' : value === 'APROBADO' ? 'Aprobado' : 'Vigente'}
        </span>
      );

    case 'EN_OBSERVACION':
    case 'POR_VENCER':
    case 'PENDIENTE':
    case 'FUERA_DE_TURNO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {value === 'POR_VENCER' ? 'Por Vencer' : value === 'PENDIENTE' ? 'Pendiente' : value}
        </span>
      );

    case 'FALTA':
    case 'INACTIVO':
    case 'DENEGADO':
    case 'VENCIDO':
    case 'RECHAZADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-200 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          {value === 'DENEGADO' ? 'Acceso Denegado' : value === 'FALTA' ? 'Falta Injustificada' : value === 'INACTIVO' ? 'Inactivo' : value}
        </span>
      );

    case 'JUSTIFICADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Justificado / Permiso
        </span>
      );

    // Motivos de Papeletas Oficiales
    case 'DESCANSO_MEDICO':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 font-medium ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          Descanso Médico
        </span>
      );
    case 'ATENCION_MEDICA':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Atención Médica
        </span>
      );
    case 'PERMISO_PERSONAL':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Permiso Personal
        </span>
      );
    case 'COMISION_SERVICIO':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Comisión de Servicio
        </span>
      );
    case 'ONOMASTICO':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Onomástico
        </span>
      );
    case 'VACACIONES':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 font-semibold ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Vacaciones
        </span>
      );
    case 'CAPACITACION':
      return (
        <span className={`inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Capacitación Oficial
        </span>
      );
    case 'OMISION_MARCADO':
      return (
        <span className={`inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Omisión de Marcado
        </span>
      );
    case 'INGRESO_FUERA_TOLERANCIA':
      return (
        <span className={`inline-flex items-center gap-1 bg-slate-900 text-white border border-slate-800 font-semibold ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Autorización Fuera de Tolerancia
        </span>
      );
    case 'COMPENSACION_HORAS':
      return (
        <span className={`inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Compensación de Horas
        </span>
      );

    case 'NO_REGISTRADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 bg-slate-200 text-slate-700 border border-slate-300 ${sizeClasses} ${className}`}
        >
          No Registrado
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center bg-slate-100 text-slate-800 border border-slate-300 ${sizeClasses} ${className}`}
        >
          {value}
        </span>
      );
  }
};
