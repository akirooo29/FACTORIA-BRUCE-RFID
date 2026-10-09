import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import type { AttendanceRecord, Worker } from '../types';
import {
  Radio,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Info,
  Shield,
  Zap,
} from 'lucide-react';

export const RfidScannerView: React.FC = () => {
  const {
    workers,
    processRfidScan,
    lastScanResult,
    clearLastScan,
    activeTerminal,
    attendanceLogs,
  } = useApp();

  const [rfidInput, setRfidInput] = useState<string>('');
  const [isScanningVisual, setIsScanningVisual] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantener autoFocus activo continuamente para pistolas y lectores USB RFID
  useEffect(() => {
    inputRef.current?.focus();
    const handleGlobalClick = () => {
      inputRef.current?.focus();
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rfidInput.trim()) return;

    setIsScanningVisual(true);
    processRfidScan(rfidInput);

    setRfidInput('');
    setTimeout(() => {
      setIsScanningVisual(false);
      inputRef.current?.focus();
    }, 400);
  };

  const handleQuickCardClick = (cardTag: string) => {
    setRfidInput(cardTag);
    setIsScanningVisual(true);
    processRfidScan(cardTag);
    setRfidInput('');
    setTimeout(() => {
      setIsScanningVisual(false);
      inputRef.current?.focus();
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 text-slate-900 border border-slate-200">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Punto de Control & Terminal RFID
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Lector de proximidad UHF 915MHz en puerta principal. Registro instantáneo con sellado de tiempo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Lector Activo</p>
            <p className="text-xs font-mono font-bold text-slate-900">{activeTerminal}</p>
          </div>
          <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg">
            <Shield className="w-5 h-5 text-slate-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal del Lector Hardware (7 Columnas) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center">
            
            {/* Cabecera de Estado */}
            <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Acceso Puerta Principal • Sensor Activo
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Tolerancia: 7:35 AM
              </span>
            </div>

            {/* Visualización de la Zona de Contacto RFID */}
            <div className="relative my-4 flex items-center justify-center">
              <div
                className={`w-44 h-44 rounded-full border border-slate-300 flex items-center justify-center transition-all duration-200 ${
                  isScanningVisual ? 'border-slate-900 scale-102' : ''
                }`}
              >
                <div className="w-32 h-32 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                  <div
                    className={`w-24 h-24 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${
                      isScanningVisual ? 'bg-slate-800 scale-98' : ''
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-mono tracking-wider font-bold uppercase">
                      Lector RFID
                    </span>
                    <span className="text-[8px] opacity-70">Aproximar tag</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Entrada con AutoFocus para lector USB */}
            <form onSubmit={handleScanSubmit} className="w-full max-w-md mt-4 space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="Aproxime la credencial RFID o ingrese DNI..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-center text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
                >
                  <span>Registrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <Zap className="w-3.5 h-3.5 text-slate-600" />
                <span>Lectura directa de sensor. Presione <strong>Enter</strong> para simular el pase.</span>
              </div>
            </form>

            {/* Tarjetas Demo para Validación Rápida */}
            <div className="w-full mt-8 pt-6 border-t border-slate-200 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  Tarjetas Demo para Prueba:
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Clic para simular lectura física
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {workers.slice(0, 4).map((worker: Worker) => (
                  <button
                    key={worker.id}
                    type="button"
                    onClick={() => handleQuickCardClick(worker.rfidTag)}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors group cursor-pointer"
                  >
                    <img
                      src={worker.avatarUrl}
                      alt={worker.name}
                      className="w-9 h-9 rounded-md object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {worker.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500 font-medium">
                          {worker.rfidTag}
                        </span>
                        <Badge value={worker.type} size="sm" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Panel Lateral: Resultado de Marcación & Historial (5 Columnas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tarjeta de Resultado */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-900" />
                Resultado de Marcación
              </h2>
              {lastScanResult && (
                <button
                  onClick={clearLastScan}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>

            {lastScanResult ? (
              <div
                className={`p-4 rounded-lg border ${
                  lastScanResult.success
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                {/* Encabezado del resultado */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    {lastScanResult.success ? (
                      <span className="p-1.5 rounded-md bg-slate-900 text-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-md bg-rose-600 text-white">
                        <XCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {lastScanResult.success ? 'Pase Autorizado' : 'Acceso Denegado'}
                      </h3>
                      <p className="text-xs text-slate-500">{lastScanResult.message}</p>
                    </div>
                  </div>

                  {lastScanResult.record && (
                    <Badge value={lastScanResult.record.scanType} size="sm" />
                  )}
                </div>

                {/* Detalles del Trabajador */}
                {lastScanResult.worker && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={lastScanResult.worker.avatarUrl}
                        alt={lastScanResult.worker.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {lastScanResult.worker.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {lastScanResult.worker.position}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <Badge value={lastScanResult.worker.type} size="sm" />
                          {lastScanResult.record?.punctuality && (
                            <Badge value={lastScanResult.record.punctuality} size="sm" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Área / Depto:</span>
                        <span className="font-semibold text-slate-800">
                          {lastScanResult.worker.department}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Hora Marcada:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {lastScanResult.record?.timeFormatted || 'En tiempo real'}
                        </span>
                      </div>

                      {lastScanResult.worker.type === 'CONTRATISTA' && (
                        <div className="col-span-2 pt-2 border-t border-slate-100 mt-1">
                          <span className="text-slate-500 text-[10px] font-bold block">
                            Empresa Contratista:
                          </span>
                          <span className="font-medium text-slate-700">
                            {lastScanResult.worker.contractorCompany} (SCTR: {lastScanResult.worker.sctrStatus || 'VIGENTE'})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 px-4 text-center rounded-lg bg-slate-50 border border-dashed border-slate-300 text-slate-400 space-y-2">
                <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Esperando lectura en torniquete
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Acerque la tarjeta o haga clic en una tarjeta demo para procesar el ingreso inmediato.
                </p>
              </div>
            )}
          </div>

          {/* Registro en Tiempo Real de este Terminal */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Marcaciones Recientes en Puerta
              </h3>
              <span className="text-[11px] text-slate-400">Hoy</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {attendanceLogs.slice(0, 5).map((log: AttendanceRecord) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={log.avatarUrl}
                      alt={log.workerName}
                      className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{log.workerName}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {log.workerType === 'CONTRATISTA' ? log.contractorCompany : log.workerDepartment}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      {log.timeFormatted}
                    </span>
                    <Badge value={log.punctuality || log.scanType} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
