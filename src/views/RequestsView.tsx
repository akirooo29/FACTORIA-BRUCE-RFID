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
    const matchesSearch =
      slip.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.folioNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.workerDni.includes(searchTerm) ||
      slip.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'TODOS' || slip.motive === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleOpenNewSlip = (motive: PaperSlipMotive = 'PERMISO_PERSONAL') => {
    setInitialMotiveForModal(motive);
    setShowSlipModal(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Papeletas Digitales & Solicitudes Laborales
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Emisión y control formal de papeletas de salida, permisos particulares, descansos y vacaciones.
          </p>
        </div>

        {!isContractor ? (
          <button
            type="button"
            onClick={() => handleOpenNewSlip('PERMISO_PERSONAL')}
            className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Papeleta Oficial</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
            <Lock className="w-4 h-4 text-zinc-500" />
            <span>Módulo Restringido para Contratistas</span>
          </div>
        )}
      </div>

      {/* STRICT CONTRACTOR BLOCK BANNER */}
      {isContractor && (
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex-1">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Acceso Inhabilitado para el Perfil Contratista Externo
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                De acuerdo con la legislación laboral y el <em>Reglamento Interno de Factoría Bruce S.A.</em>, el personal tercerizado no cuenta con gestión directa de vacaciones ni papeletas internas en este portal corporativo.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="bg-white dark:bg-black px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[11px]">
                  • Gestionar con la empresa contratista proveedora
                </span>
                <span className="bg-white dark:bg-black px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[11px]">
                  • Notificar a HSE para pases de salida extraordinarios
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveUserRole('EMPLEADO_INTERNO')}
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-xl shrink-0 transition-all active:scale-95"
            >
              Cambiar a Rol Empleado
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Vacaciones */}
        <div
          onClick={() => !isContractor && handleOpenNewSlip('VACACIONES')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            isContractor
              ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-60'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Vacaciones de Ley
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
              {isContractor ? 'N/A' : 'Mín. 7 Días'}
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">
              {isContractor ? 'No aplica a personal externo' : 'Fraccionable conforme a D.L. 713'}
            </p>
          </div>
        </div>

        {/* Card 2: Permisos Personales */}
        <div
          onClick={() => !isContractor && handleOpenNewSlip('PERMISO_PERSONAL')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            isContractor
              ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-60'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Permiso Personal
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
              {isContractor ? '0' : `${paperSlips.filter((s) => s.motive === 'PERMISO_PERSONAL').length} Registradas`}
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">
              {isContractor ? 'No aplica a personal externo' : 'Con advertencia de descuento / compensación'}
            </p>
          </div>
        </div>

        {/* Card 3: Tolerancia en Puerta */}
        <div
          onClick={() => !isContractor && handleOpenNewSlip('INGRESO_FUERA_TOLERANCIA')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            isContractor
              ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-60'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Fuera de Tolerancia (&gt; 7:35)
            </span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
              {isContractor ? '0' : `${paperSlips.filter((s) => s.motive === 'INGRESO_FUERA_TOLERANCIA').length} Autorizadas`}
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">
              {isContractor ? 'No aplicable' : 'Aprobación exclusiva Jefe de Planta / Gerente'}
            </p>
          </div>
        </div>
      </div>

      {/* TABS & PAPER SLIPS TABLE */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'TODOS'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Todas ({paperSlips.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PERMISO_PERSONAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'PERMISO_PERSONAL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Permisos Personales
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('VACACIONES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'VACACIONES'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Vacaciones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DESCANSO_MEDICO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'DESCANSO_MEDICO'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Descansos Médicos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('INGRESO_FUERA_TOLERANCIA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'INGRESO_FUERA_TOLERANCIA'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Fuera de Tolerancia
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar folio, nombre o DNI..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Paper Slips Modern Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">Folio Oficial</th>
                <th className="py-3 px-3">Colaborador Titular</th>
                <th className="py-3 px-3">Motivo Oficial</th>
                <th className="py-3 px-3">Salida & Retorno</th>
                <th className="py-3 px-3">Razón / Justificación</th>
                <th className="py-3 px-3">Condición Salarial / Autorización</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredSlips.map((slip: PaperSlipRecord) => (
                <tr key={slip.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  {/* Folio */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                      {slip.folioNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400">{slip.submittedDate}</span>
                  </td>

                  {/* Worker */}
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      {slip.workerName}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      DNI: {slip.workerDni} • {slip.workerPosition}
                    </span>
                  </td>

                  {/* Motive */}
                  <td className="py-3.5 px-3">
                    <Badge value={slip.motive} size="sm" />
                  </td>

                  {/* Period */}
                  <td className="py-3.5 px-3">
                    <span className="text-zinc-900 dark:text-white font-medium block">
                      {slip.departureDate} ({slip.departureTime})
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      al {slip.returnDate} ({slip.returnTime}) • {slip.totalDaysRequested} {slip.totalDaysRequested === 1 ? 'día' : 'días'}
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="py-3.5 px-3 max-w-xs text-zinc-600 dark:text-zinc-400">
                    {slip.reason}
                  </td>

                  {/* Specific Conditional Indicators */}
                  <td className="py-3.5 px-3">
                    {slip.motive === 'PERMISO_PERSONAL' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                        <AlertTriangle className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                        {slip.personalCompensationType === 'COMPENSAR_HORAS'
                          ? 'Pendiente de compensar'
                          : 'Descuento en planilla'}
                      </span>
                    ) : slip.motive === 'INGRESO_FUERA_TOLERANCIA' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        Firma: {slip.approvalAuthority === 'JEFE_PLANTA' ? 'Jefe de Planta' : 'Gerencia General'}
                      </span>
                    ) : slip.motive === 'VACACIONES' ? (
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                        {slip.totalDaysRequested} días (≥ 7 días de ley)
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Regular</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <Badge value={slip.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAPER SLIP MODAL REPLICATING PHYSICAL OFFICIAL FORMAT */}
      <PaperSlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        workers={workers}
        initialMotive={initialMotiveForModal}
        onSubmitSlip={(newSlip) => {
          addPaperSlip(newSlip);
        }}
      />
    </div>
  );
};
