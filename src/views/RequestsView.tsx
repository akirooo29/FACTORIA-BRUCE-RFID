import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { PaperSlipModal } from '../components/requests/PaperSlipModal';
import type { PaperSlipRecord, PaperSlipMotive } from '../types';
import {
  FileText,
  CalendarDays,
  FileSpreadsheet,
  Plus,
  Lock,
  ShieldAlert,
  Search,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const RequestsView: React.FC = () => {
  const {
    paperSlips,
    addPaperSlip,
    workers,
    activeUserRole,
    setActiveUserRole,
  } = useApp();

  const isContractor = activeUserRole === 'CONTRATISTA';

  const [activeTab, setActiveTab] = useState<'TODOS' | 'PERMISO_PERSONAL' | 'VACACIONES' | 'DESCANSO_MEDICO' | 'INGRESO_FUERA_TOLERANCIA'>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [initialMotiveForModal, setInitialMotiveForModal] = useState<PaperSlipMotive>('PERMISO_PERSONAL');

  const filteredSlips = paperSlips.filter((slip: PaperSlipRecord) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      slip.workerName.toLowerCase().includes(q) ||
      slip.folioNumber.toLowerCase().includes(q) ||
      slip.workerDni.includes(q) ||
      slip.reason.toLowerCase().includes(q);

    const matchesTab = activeTab === 'TODOS' || slip.motive === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleOpenNewSlip = (motive: PaperSlipMotive = 'PERMISO_PERSONAL') => {
    setInitialMotiveForModal(motive);
    setShowSlipModal(true);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Corporativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Papeletas Digitales & Solicitudes Laborales
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Emisión y control formal de papeletas de salida, permisos particulares, descansos y vacaciones.
          </p>
        </div>

        {!isContractor ? (
          <button
            type="button"
            onClick={() => handleOpenNewSlip('PERMISO_PERSONAL')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Papeleta Oficial</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Módulo Restringido para Contratistas</span>
          </div>
        )}
      </div>

      {/* Alerta de restricción si es Contratista */}
      {isContractor && (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-0.5 flex-1">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Acceso Inhabilitado para Perfil Contratista Externo
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                El personal tercerizado no cuenta con gestión directa de vacaciones ni papeletas internas en este portal. Gestionar directamente con su empleador contratista.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveUserRole('EMPLEADO_INTERNO')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              Cambiar a Rol Empleado
            </button>
          </div>
        </div>
      )}

      {/* Tarjetas Resumen de Solicitudes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Vacaciones */}
        <div
          onClick={() => !isContractor && handleOpenNewSlip('VACACIONES')}
          className={`p-4 rounded-xl border transition-colors ${
            isContractor
              ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vacaciones de Ley
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {isContractor ? 'N/A' : 'Mín. 7 Días'}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isContractor ? 'No aplica a personal externo' : 'Fraccionable conforme a D.L. 713'}
            </p>
          </div>
        </div>

        {/* Permisos Personales */}
        <div
          onClick={() => !isContractor && handleOpenNewSlip('PERMISO_PERSONAL')}
          className={`p-4 rounded-xl border transition-colors ${
            isContractor
              ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Permiso Personal
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {isContractor ? '0' : `${paperSlips.filter((s) => s.motive === 'PERMISO_PERSONAL').length} Registradas`}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isContractor ? 'No aplica a personal externo' : 'Con descuento o compensación'}
            </p>
          </div>
        </div>

        {/* Tolerancia en Puerta */}
        <div
          onClick={() => !isContractor && handleOpenNewSlip('INGRESO_FUERA_TOLERANCIA')}
          className={`p-4 rounded-xl border transition-colors ${
            isContractor
              ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fuera de Tolerancia (&gt; 7:35)
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {isContractor ? '0' : `${paperSlips.filter((s) => s.motive === 'INGRESO_FUERA_TOLERANCIA').length} Autorizadas`}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isContractor ? 'No aplicable' : 'Aprobación exclusiva Jefe de Planta'}
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas & Tabla de Papeletas */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('TODOS')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'TODOS'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas ({paperSlips.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PERMISO_PERSONAL')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'PERMISO_PERSONAL'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Permisos Personales
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('VACACIONES')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'VACACIONES'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vacaciones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DESCANSO_MEDICO')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'DESCANSO_MEDICO'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Descansos Médicos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('INGRESO_FUERA_TOLERANCIA')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'INGRESO_FUERA_TOLERANCIA'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Fuera de Tolerancia
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar folio, nombre o DNI..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Folio Oficial</th>
                <th className="py-2.5 px-3">Colaborador Titular</th>
                <th className="py-2.5 px-3">Motivo Oficial</th>
                <th className="py-2.5 px-3">Salida & Retorno</th>
                <th className="py-2.5 px-3">Razón / Justificación</th>
                <th className="py-2.5 px-3">Condición Salarial / Autorización</th>
                <th className="py-2.5 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSlips.map((slip: PaperSlipRecord) => (
                <tr key={slip.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white block">
                      {slip.folioNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">{slip.submittedDate}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {slip.workerName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      DNI: {slip.workerDni} • {slip.workerPosition}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <Badge value={slip.motive} size="sm" />
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-slate-900 dark:text-white font-medium block">
                      {slip.departureDate} ({slip.departureTime})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      al {slip.returnDate} ({slip.returnTime}) • {slip.totalDaysRequested} {slip.totalDaysRequested === 1 ? 'día' : 'días'}
                    </span>
                  </td>

                  <td className="py-3 px-3 max-w-xs text-slate-600 dark:text-slate-400">
                    {slip.reason}
                  </td>

                  <td className="py-3 px-3">
                    {slip.motive === 'PERMISO_PERSONAL' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {slip.personalCompensationType === 'COMPENSAR_HORAS'
                          ? 'Pendiente de Compensar'
                          : 'Sujeto a Descuento'}
                      </span>
                    ) : slip.motive === 'INGRESO_FUERA_TOLERANCIA' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Aprobado: {slip.approvalAuthority === 'JEFE_PLANTA' ? 'Jefe de Planta' : 'Gerencia'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Regulado por Ley</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <Badge value={slip.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Papeleta Oficial */}
      {showSlipModal && (
        <PaperSlipModal
          isOpen={showSlipModal}
          onClose={() => setShowSlipModal(false)}
          workers={workers.filter((w) => w.type === 'EMPLEADO_INTERNO')}
          initialMotive={initialMotiveForModal}
          onSubmitSlip={(slip) => addPaperSlip(slip)}
        />
      )}
    </div>
  );
};
