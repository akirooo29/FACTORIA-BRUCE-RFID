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
  const [returnTime, setReturnTime] = useState<string>('17:00');

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
        setReturnTime('17:00');
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
    { value: 'COMISION_SERVICIO', label: '4. Comisión de Servicio', description: 'Gestión externa oficial por cuenta de la empresa' },
    { value: 'ONOMASTICO', label: '5. Descanso por Onomástico', description: 'Día de descanso remunerado por fecha de cumpleaños' },
    { value: 'VACACIONES', label: '6. Período Vacacional de Ley', description: 'Mínimo 7 días consecutivos. Requiere 365 días laborados' },
    { value: 'CAPACITACION', label: '7. Capacitación Oficializada', description: 'Eventos formativos requeridos por la empresa o SUNAFIL' },
    { value: 'OMISION_MARCADO', label: '8. Omisión de Marcado de Reloj', description: 'Justificación excepcional de falta de marcado RFID' },
    { value: 'INGRESO_FUERA_TOLERANCIA', label: '9. Autorización Fuera de Tolerancia', description: 'Ingreso > 07:35 AM. Aprobación exclusiva Jefe de Planta' },
    { value: 'COMPENSACION_HORAS', label: '10. Compensación de Horas Extra', description: 'Compensación de sobretiempo debidamente autorizado' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden p-6 text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto text-xs">
        
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Formulario Oficial de Personal • Factoría Bruce S.A.
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Emisión de Papeleta Digital de Salida o Autorización
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Seleccionar Colaborador */}
          <div className="space-y-1.5">
            <label className="block text-slate-800 dark:text-slate-200 font-semibold">
              1. Colaborador Solicitante:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWorkerDropdownOpen(!isWorkerDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={selectedWorker.avatarUrl}
                    alt={selectedWorker.name}
                    className="w-7 h-7 rounded-md object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-white block truncate">
                      {selectedWorker.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID #{selectedWorker.id} • DNI: {selectedWorker.dni} • {selectedWorker.position}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isWorkerDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-md p-2 space-y-2 animate-fadeIn">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={workerSearchTerm}
                      onChange={(e) => setWorkerSearchTerm(e.target.value)}
                      placeholder="Filtrar por nombre, DNI o cargo..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs focus:outline-none"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredWorkers.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWorkerId(w.id);
                          setIsWorkerDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-xs">{w.name}</p>
                          <p className="text-[10px] text-slate-500">{w.position}</p>
                        </div>
                        <Badge value={w.type} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Seleccionar Motivo Oficial */}
          <div className="space-y-1.5">
            <label className="block text-slate-800 dark:text-slate-200 font-semibold">
              2. Motivo Oficial de la Papeleta:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOTIVE_OPTIONS.map((item) => {
                const isSelected = motive === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMotive(item.value)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-semibold block truncate text-xs">{item.label}</span>
                    <span className={`text-[10px] block mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500'}`}>
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modalidad de Compensación (Condicional para Permiso Personal) */}
          {motive === 'PERMISO_PERSONAL' && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="block font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Modalidad de Compensación de Permiso Particular:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="compensation"
                    checked={personalCompensationType === 'COMPENSAR_HORAS'}
                    onChange={() => setPersonalCompensationType('COMPENSAR_HORAS')}
                  />
                  <span>Compensación de horas con sobretiempo</span>
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
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="block font-semibold text-slate-800 dark:text-slate-200 text-xs">
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
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Inhabilitado para Solicitud de Vacaciones:</span>
                <span>{vacationValidationError}</span>
              </div>
            </div>
          )}

          {/* 3. Fechas y Horas */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              3. Horario y Rango del Permiso:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold block">Fecha Salida *</label>
                <input
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold block">Hora Salida *</label>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold block">Fecha Retorno *</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold block">Hora Retorno *</label>
                <input
                  type="time"
                  required
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Duración computable:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {daysCount} {daysCount === 1 ? 'día' : 'días'} ({daysCount * 8} horas de jornada)
              </span>
            </div>
          </div>

          {/* 4. Razón o Justificación */}
          <div className="space-y-1">
            <label className="block text-slate-800 dark:text-slate-200 font-semibold">
              4. Justificación Oficial: *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detallar el motivo de la papeleta o referencia formal..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={Boolean(vacationValidationError)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
