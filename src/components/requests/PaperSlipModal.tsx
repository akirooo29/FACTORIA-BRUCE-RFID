import React, { useState, useEffect } from 'react';
import type { Worker, PaperSlipMotive, PaperSlipRecord } from '../../types';
import { Badge } from '../common/Badge';
import { evaluateWorkerVacation } from '../../utils/vacationCalculator';
import {
  Search,
  X,
  AlertTriangle,
  Send,
  ChevronDown,
} from 'lucide-react';

interface PaperSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  initialWorkerId?: number | string;
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
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | string>(
    initialWorkerId !== undefined ? initialWorkerId : (workers[0]?.id ?? 1)
  );
  const [workerSearchTerm, setWorkerSearchTerm] = useState<string>('');
  const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState<boolean>(false);

  // Form Fields
  const [motive, setMotive] = useState<PaperSlipMotive>(initialMotive);
  const [reason, setReason] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('2026-10-05');
  const [departureTime, setDepartureTime] = useState<string>('07:30');
  const [returnDate, setReturnDate] = useState<string>('2026-10-12');
  const [returnTime, setReturnTime] = useState<string>('16:30');

  // Specific Conditional States
  const [personalCompensationType, setPersonalCompensationType] = useState<'DESCUENTO_PLANILLA' | 'COMPENSAR_HORAS'>('COMPENSAR_HORAS');
  const [approvalAuthority, setApprovalAuthority] = useState<'JEFE_PLANTA' | 'GERENTE_GENERAL'>('JEFE_PLANTA');

  // Validation state
  const [daysCount, setDaysCount] = useState<number>(7);
  const [vacationValidationError, setVacationValidationError] = useState<string | null>(null);

  const selectedWorker = workers.find((w) => Number(w.id) === Number(selectedWorkerId)) || workers[0];

  useEffect(() => {
    if (initialWorkerId !== undefined) {
      setSelectedWorkerId(initialWorkerId);
    }
  }, [initialWorkerId]);

  useEffect(() => {
    if (initialMotive) {
      setMotive(initialMotive);
      if (initialMotive === 'VACACIONES') {
        setDepartureDate('2026-10-05');
        setDepartureTime('07:30');
        setReturnDate('2026-10-12');
        setReturnTime('16:30');
      }
    }
  }, [initialMotive]);

  // Validar fechas y regla estricta de vacaciones
  useEffect(() => {
    if (departureDate && returnDate) {
      const start = new Date(departureDate);
      const end = new Date(returnDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysCount(Math.max(1, isNaN(diffDays) ? 1 : diffDays));
    }

    if (motive === 'VACACIONES' && selectedWorker) {
      const audit = evaluateWorkerVacation(selectedWorker);

      if (selectedWorker.type === 'CONTRATISTA') {
        setVacationValidationError(
          'El personal contratista no tiene habilitado el módulo de vacaciones con cargo a Factoría Bruce S.A.'
        );
      } else if (!audit.isEligibleFor30Days) {
        setVacationValidationError(
          `Colaborador en observación: Registra ${audit.daysEmployed} días trabajados (menos de 365 días requeridos por ley). Vacaciones disponibles: 0 días (No habilitado). Le faltan ${audit.daysRemainingUntilYear} días para computar su primer período.`
        );
      } else {
        setVacationValidationError(null);
      }
    } else {
      setVacationValidationError(null);
    }
  }, [departureDate, returnDate, motive, selectedWorker]);

  if (!isOpen || !selectedWorker) return null;

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

    if (motive === 'VACACIONES') {
      const audit = evaluateWorkerVacation(selectedWorker);
      if (!audit.isEligibleFor30Days) {
        alert(
          `Operación rechazada: El colaborador tiene ${audit.daysEmployed} días trabajados (< 365 días). Sus vacaciones disponibles son 0 días.`
        );
        return;
      }
    }

    onSubmitSlip({
      workerId: Number(selectedWorker.id),
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
    { value: 'PERMISO_PERSONAL', label: '3. Permiso Personal Sin Contraprestación', description: 'Asunto particular. Horas a descontar o compensar' },
    { value: 'COMISION_SERVICIO', label: '4. Comisión de Servicio / Trámite Externo', description: 'Labor técnica fuera de planta autorizada' },
    { value: 'ONOMASTICO', label: '5. Día de Onomástico (Cumpleaños)', description: 'Descanso remunerado por cumpleaños' },
    { value: 'VACACIONES', label: '6. Período Vacacional (Regla 365 días)', description: 'Fraccionamiento anual legal (Mínimo 7 días calendario)' },
    { value: 'CAPACITACION', label: '7. Capacitación Técnica / Seguridad', description: 'Cursos de homologación, soldadura o HSE' },
    { value: 'OMISION_MARCADO', label: '8. Omisión de Marcado RFID', description: 'Regularización por falla de lectura o tarjeta olvidada' },
    { value: 'INGRESO_FUERA_TOLERANCIA', label: '9. Autorización de Ingreso Fuera de Tolerancia', description: 'Ingreso excepcional pasadas las 07:35 AM' },
    { value: 'COMPENSACION_HORAS', label: '10. Compensación de Horas Extraordinarias', description: 'Descanso compensatorio por sobretiempo previo' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-xl p-6 text-slate-900 max-h-[92vh] overflow-y-auto">
        
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                Factoría Bruce S.A.
              </span>
              <span className="text-xs text-slate-500 font-mono">Formulario RRHH-04</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Emisión de Papeleta Oficial de Salida / Permiso
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. Selección de Colaborador */}
          <div className="space-y-1 relative">
            <label className="block text-slate-800 font-bold">
              1. Colaborador Solicitante: *
            </label>

            <button
              type="button"
              onClick={() => setIsWorkerDropdownOpen(!isWorkerDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-left hover:border-slate-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedWorker.avatarUrl}
                  alt={selectedWorker.name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                />
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">{selectedWorker.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">DNI: {selectedWorker.dni} • {selectedWorker.position}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isWorkerDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 max-h-56 overflow-y-auto space-y-1">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, DNI o cargo..."
                    value={workerSearchTerm}
                    onChange={(e) => setWorkerSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                {filteredWorkers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkerId(w.id);
                      setIsWorkerDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      Number(w.id) === Number(selectedWorkerId) ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-slate-900 font-medium block">{w.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">DNI: {w.dni} • {w.position}</span>
                    </div>
                    <Badge value={w.type} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Motivo Oficial */}
          <div className="space-y-1">
            <label className="block text-slate-800 font-bold">
              2. Motivo Oficial de la Papeleta: *
            </label>
            <select
              value={motive}
              onChange={(e) => setMotive(e.target.value as PaperSlipMotive)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              {MOTIVE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {MOTIVE_OPTIONS.find((o) => o.value === motive)?.description}
            </p>
          </div>

          {/* Compensación (Condicional para Permiso Personal) */}
          {motive === 'PERMISO_PERSONAL' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block font-bold text-slate-800 text-xs">
                Modalidad de Compensación (Permiso Personal):
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="compensation"
                    checked={personalCompensationType === 'COMPENSAR_HORAS'}
                    onChange={() => setPersonalCompensationType('COMPENSAR_HORAS')}
                  />
                  <span>Compensación con horas de trabajo</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="compensation"
                    checked={personalCompensationType === 'DESCUENTO_PLANILLA'}
                    onChange={() => setPersonalCompensationType('DESCUENTO_PLANILLA')}
                  />
                  <span>Descuento computable en planilla</span>
                </label>
              </div>
            </div>
          )}

          {/* Autoridad de Aprobación (Condicional para Fuera de Tolerancia) */}
          {motive === 'INGRESO_FUERA_TOLERANCIA' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block font-bold text-slate-800 text-xs">
                Autoridad que aprueba el ingreso excepcional:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="authority"
                    checked={approvalAuthority === 'JEFE_PLANTA'}
                    onChange={() => setApprovalAuthority('JEFE_PLANTA')}
                  />
                  <span>Jefe de Planta</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="authority"
                    checked={approvalAuthority === 'GERENTE_GENERAL'}
                    onChange={() => setApprovalAuthority('GERENTE_GENERAL')}
                  />
                  <span>Gerente General</span>
                </label>
              </div>
            </div>
          )}

          {/* Alerta de Vacaciones si no está habilitado */}
          {motive === 'VACACIONES' && vacationValidationError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="space-y-0.5">
                <span className="font-bold block">Inhabilitado para Solicitud de Vacaciones:</span>
                <span>{vacationValidationError}</span>
              </div>
            </div>
          )}

          {/* 3. Fechas y Horas */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">
              3. Horario y Rango del Permiso:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">Fecha Salida *</label>
                <input
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">Hora Salida *</label>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">Fecha Retorno *</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">Hora Retorno *</label>
                <input
                  type="time"
                  required
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Duración computable:</span>
              <span className="font-mono font-bold text-slate-900">
                {daysCount} {daysCount === 1 ? 'día' : 'días'} ({daysCount * 8} horas de jornada)
              </span>
            </div>
          </div>

          {/* 4. Razón o Justificación */}
          <div className="space-y-1">
            <label className="block text-slate-800 font-bold">
              4. Justificación Oficial: *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detallar el motivo de la papeleta o referencia formal..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* Botones de acción (Sin adjuntar documento por requerimiento explícito) */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={Boolean(vacationValidationError)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
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
