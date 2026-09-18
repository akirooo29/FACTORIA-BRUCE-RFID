import React, { useState, useEffect } from 'react';
import type { Worker, PaperSlipMotive, PaperSlipRecord } from '../../types';
import { Badge } from '../common/Badge';
import {
  Search,
  X,
  AlertTriangle,
  Send,
  Building,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface PaperSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  initialWorkerId?: string;
  initialMotive?: PaperSlipMotive;
  onSubmitSlip: (slip: Omit<PaperSlipRecord, 'id' | 'folioNumber' | 'submittedDate'>) => void;
}

export const PaperSlipModal: React.FC<PaperSlipModalProps> = ({
  isOpen,
  onClose,
  workers,
  initialWorkerId,
  initialMotive = 'PERMISO_PERSONAL',
  onSubmitSlip,
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(initialWorkerId || 'W-001');
  const [workerSearchTerm, setWorkerSearchTerm] = useState<string>('');
  const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState<boolean>(false);

  // Form Fields
  const [motive, setMotive] = useState<PaperSlipMotive>(initialMotive);
  const [reason, setReason] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('2026-09-18');
  const [departureTime, setDepartureTime] = useState<string>('08:00');
  const [returnDate, setReturnDate] = useState<string>('2026-09-18');
  const [returnTime, setReturnTime] = useState<string>('12:00');

  // Specific Conditional States
  const [personalCompensationType, setPersonalCompensationType] = useState<'DESCUENTO_PLANILLA' | 'COMPENSAR_HORAS'>('COMPENSAR_HORAS');
  const [approvalAuthority, setApprovalAuthority] = useState<'JEFE_PLANTA' | 'GERENTE_GENERAL'>('JEFE_PLANTA');

  // Validation state
  const [daysCount, setDaysCount] = useState<number>(1);
  const [vacationValidationError, setVacationValidationError] = useState<string | null>(null);

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  useEffect(() => {
    if (initialWorkerId) {
      setSelectedWorkerId(initialWorkerId);
    }
  }, [initialWorkerId]);

  useEffect(() => {
    if (initialMotive) {
      setMotive(initialMotive);
      if (initialMotive === 'VACACIONES') {
        // Default 7 days from departure
        setDepartureDate('2026-10-05');
        setDepartureTime('07:30');
        setReturnDate('2026-10-12');
        setReturnTime('17:00');
      }
    }
  }, [initialMotive]);

  // Calculate day difference and enforce 7-day rule for Vacations
  useEffect(() => {
    if (departureDate && returnDate) {
      const start = new Date(departureDate);
      const end = new Date(returnDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const computedDays = Math.max(1, isNaN(diffDays) ? 1 : diffDays);
      setDaysCount(computedDays);

      if (motive === 'VACACIONES' && computedDays < 7) {
        setVacationValidationError(
          `Norma Laboral: El período vacacional obligatorio debe ser de un mínimo de 1 semana (7 días). Seleccionado actualmente: ${computedDays} ${computedDays === 1 ? 'día' : 'días'}.`
        );
      } else {
        setVacationValidationError(null);
      }
    }
  }, [departureDate, returnDate, motive]);

  if (!isOpen) return null;

  const filteredWorkers = workers.filter((w) => {
    const q = workerSearchTerm.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.dni.includes(q) ||
      w.position.toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce 7-day minimum for vacation
    if (motive === 'VACACIONES' && daysCount < 7) {
      setVacationValidationError('No se puede emitir la papeleta: el período vacacional mínimo legal es de 7 días.');
      return;
    }

    if (!reason.trim()) return;

    onSubmitSlip({
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      workerPosition: selectedWorker.position,
      workerDni: selectedWorker.dni,
      workerType: selectedWorker.type,
      motive,
      reason,
      departureDate,
      departureTime,
      returnDate,
      returnTime,
      totalHoursRequested: daysCount * 8,
      totalDaysRequested: daysCount,
      personalCompensationType: motive === 'PERMISO_PERSONAL' ? personalCompensationType : undefined,
      approvalAuthority: motive === 'INGRESO_FUERA_TOLERANCIA' ? approvalAuthority : undefined,
      status: 'APROBADO',
    });

    onClose();
  };

  const MOTIVE_OPTIONS: { value: PaperSlipMotive; label: string; description: string }[] = [
    { value: 'DESCANSO_MEDICO', label: '1. Descanso Médico', description: 'Incapacidad médica certificada por ESSALUD/MINSA' },
    { value: 'ATENCION_MEDICA', label: '2. Atención Médica', description: 'Cita médica o urgencia en centro asistencial' },
    { value: 'PERMISO_PERSONAL', label: '3. Permiso Personal Sin Contraprestación', description: 'Asunto particular. Horas a descontar o pendientes de compensar' },
    { value: 'COMISION_SERVICIO', label: '4. Comisión de Servicio', description: 'Gestión externa oficial por cuenta de la empresa' },
    { value: 'ONOMASTICO', label: '5. Onomástico', description: 'Día libre legal por cumpleaños del colaborador' },
    { value: 'VACACIONES', label: '6. Vacaciones', description: 'Goce de vacaciones anuales (Mínimo legal: 7 días)' },
    { value: 'CAPACITACION', label: '7. Capacitación Oficializada', description: 'Cursos o talleres autorizados por gerencia' },
    { value: 'OMISION_MARCADO', label: '8. Omisión de Marcado', description: 'Falla o extravío de credencial física en puerta' },
    { value: 'INGRESO_FUERA_TOLERANCIA', label: '9. Autorización de Ingreso Fuera de Tolerancia', description: 'Ingreso pasadas las 07:35 AM. Aprobación exclusiva Jefe de Planta / Gerente General' },
    { value: 'COMPENSACION_HORAS', label: '10. Compensación de Horas', description: 'Devolución de sobretiempo acumulado en taller' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col text-zinc-900 dark:text-zinc-100">
        
        {/* OFFICIAL PHYSICAL FORMAT HEADER */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-sm shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                  Factoría Bruce S.A.
                </h3>
                <span className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">
                  RUC 20132456781
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                PAPELETA OFICIAL DE AUTORIZACIÓN DE SALIDA / PERMISO LABORAL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* 1. SELECTOR DE TRABAJADOR */}
          <div className="space-y-1.5 relative">
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold">
              1. Seleccionar Colaborador Titular: *
            </label>

            <div
              onClick={() => setIsWorkerDropdownOpen(!isWorkerDropdownOpen)}
              className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl cursor-pointer hover:border-black dark:hover:border-white transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedWorker.avatarUrl}
                  alt={selectedWorker.name}
                  className="w-9 h-9 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold text-zinc-900 dark:text-white block truncate">
                    {selectedWorker.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 truncate block font-mono">
                    Código: {selectedWorker.code} • DNI: {selectedWorker.dni}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge value={selectedWorker.type} size="sm" />
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isWorkerDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Search Dropdown list */}
            {isWorkerDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden max-h-56 flex flex-col animate-fadeIn">
                <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={workerSearchTerm}
                      onChange={(e) => setWorkerSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, DNI o cargo..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredWorkers.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setSelectedWorkerId(w.id);
                        setIsWorkerDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={w.avatarUrl}
                          alt={w.name}
                          className="w-7 h-7 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{w.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">DNI: {w.dni} • {w.position}</p>
                        </div>
                      </div>
                      <Badge value={w.type} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. AUTO-FILLED OFFICIAL FIELDS (PUESTO & DNI) */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Puesto / Cargo Oficial
              </span>
              <span className="font-bold text-zinc-900 dark:text-white block mt-0.5">
                {selectedWorker.position}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Documento Nacional de Identidad (DNI)
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white block mt-0.5">
                {selectedWorker.dni}
              </span>
            </div>
          </div>

          {/* 3. DROPDOWN OBLIGATORIO DE MOTIVO CON LAS 10 OPCIONES EXACTAS */}
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
              2. Motivo Oficial de Papeleta / Permiso: *
            </label>
            <select
              value={motive}
              onChange={(e) => setMotive(e.target.value as PaperSlipMotive)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white shadow-sm"
            >
              {MOTIVE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 py-1">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* CONDITIONAL 1: PERMISO PERSONAL SIN CONTRAPRESTACION */}
          {motive === 'PERMISO_PERSONAL' && (
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-zinc-900 dark:text-white" />
                <span>Advertencia Obligatoria de Régimen Personal:</span>
              </div>
              <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Conforme a la política corporativa de Factoría Bruce, las horas correspondientes a este permiso no cuentan con contraprestación patronal directa. Deben registrarse bajo una de las dos modalidades:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    personalCompensationType === 'COMPENSAR_HORAS'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                      : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="compensationType"
                    checked={personalCompensationType === 'COMPENSAR_HORAS'}
                    onChange={() => setPersonalCompensationType('COMPENSAR_HORAS')}
                    className="hidden"
                  />
                  <span>Pendientes de compensar</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    personalCompensationType === 'DESCUENTO_PLANILLA'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                      : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="compensationType"
                    checked={personalCompensationType === 'DESCUENTO_PLANILLA'}
                    onChange={() => setPersonalCompensationType('DESCUENTO_PLANILLA')}
                    className="hidden"
                  />
                  <span>Descontar en planilla</span>
                </label>
              </div>
            </div>
          )}

          {/* CONDITIONAL 2: AUTORIZACIÓN DE INGRESO FUERA DE TOLERANCIA (> 07:35 AM) */}
          {motive === 'INGRESO_FUERA_TOLERANCIA' && (
            <div className="p-4 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black space-y-2.5 animate-fadeIn shadow-md">
              <div className="flex items-center gap-2 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Aprobación de Puerta Cerrada (Ingreso Restringido):</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                El colaborador registró ingreso después de las 07:35:00 AM (estado Falta por defecto). <strong>Atención: Recursos Humanos NO tiene facultades para aprobar este ingreso.</strong> Requiere firma y autorización exclusiva de la máxima autoridad de planta.
              </p>

              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-90">
                  Autoridad Facultada Aprobante: *
                </label>
                <select
                  value={approvalAuthority}
                  onChange={(e) => setApprovalAuthority(e.target.value as 'JEFE_PLANTA' | 'GERENTE_GENERAL')}
                  className="w-full px-3 py-2 bg-zinc-800 dark:bg-zinc-200 border border-zinc-700 dark:border-zinc-300 rounded-xl text-xs font-bold text-white dark:text-black focus:outline-none"
                >
                  <option value="JEFE_PLANTA">Jefe de Planta (Ing. Carlos Mendoza Silva)</option>
                  <option value="GERENTE_GENERAL">Gerente General (Ing. Roberto Bruce)</option>
                </select>
              </div>
            </div>
          )}

          {/* 4. FECHA Y HORA DE SALIDA / RETORNO */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block uppercase tracking-wider text-[10px]">
              3. Período Programado (Salida y Retorno):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Salida */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-semibold block">Fecha de Salida *</label>
                <input
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-semibold block">Hora de Salida *</label>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>

              {/* Retorno */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-semibold block">Fecha de Retorno Previsto *</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-semibold block">Hora de Retorno Previsto *</label>
                <input
                  type="time"
                  required
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Duration Display & VACATIONS 7-DAY MINIMUM VALIDATION */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-500 text-[11px]">Duración calculada:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {daysCount} {daysCount === 1 ? 'día laborable' : 'días laborables'} ({daysCount * 8} horas)
              </span>
            </div>

            {/* Inline validation alert if Vacations < 7 days */}
            {vacationValidationError && (
              <div className="p-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black text-xs flex items-start gap-2 animate-fadeIn font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{vacationValidationError}</span>
              </div>
            )}
          </div>

          {/* 5. RAZON / TEXTO LIBRE */}
          <div>
            <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1">
              4. Razón y Justificación Oficial: *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detallar minuciosamente el motivo del permiso, número de expediente médico o referencia técnica..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white shadow-sm"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={Boolean(vacationValidationError)}
              className={`px-5 py-2.5 font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all ${
                vacationValidationError
                  ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emitir Papeleta Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
