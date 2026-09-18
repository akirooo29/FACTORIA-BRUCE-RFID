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
import confetti from 'canvas-confetti';

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

  // Keep autoFocus continuously active for RFID hardware gun emulation
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

    const result = processRfidScan(rfidInput);

    if (result.success) {
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.65 },
          colors: ['#000000', '#52525b', '#a1a1aa'],
        });
      } catch {
        // Ignore if confetti not supported
      }
    }

    setRfidInput('');
    setTimeout(() => {
      setIsScanningVisual(false);
      inputRef.current?.focus();
    }, 500);
  };

  const handleQuickCardClick = (cardTag: string) => {
    setRfidInput(cardTag);
    setIsScanningVisual(true);
    const result = processRfidScan(cardTag);
    if (result.success) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.6 },
          colors: ['#000000', '#52525b', '#a1a1aa'],
        });
      } catch {
        // Ignore
      }
    }
    setRfidInput('');
    setTimeout(() => {
      setIsScanningVisual(false);
      inputRef.current?.focus();
    }, 350);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Punto de Control & Terminal RFID
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Lector de proximidad UHF 915MHz en puerta principal. Registro instantáneo con sellado de tiempo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Lector Activo</p>
            <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">{activeTerminal}</p>
          </div>
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
            <Shield className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: The Hardware Scanner Terminal (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            
            {/* Terminal Status Header */}
            <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Acceso Puerta Principal • Sensor Activo
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                Tolerancia: 7:35 AM
              </span>
            </div>

            {/* Hardware RFID Pad Visualization */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Outer Ring */}
              <div
                className={`w-48 h-48 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center transition-all duration-300 ${
                  isScanningVisual ? 'scale-105 border-black dark:border-white' : ''
                }`}
              >
                {/* Inner Ring */}
                <div className="w-36 h-36 rounded-full border border-dashed border-zinc-400 dark:border-zinc-600 flex items-center justify-center">
                  
                  {/* Scanner Physical Touch Disc */}
                  <div
                    className={`w-28 h-28 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isScanningVisual ? 'animate-rfid-tap bg-black dark:bg-white' : ''
                    }`}
                  >
                    <CreditCard className={`w-7 h-7 mb-1 ${isScanningVisual ? 'scale-110' : ''}`} />
                    <span className="text-[9px] font-mono tracking-widest font-bold uppercase">
                      Lector RFID
                    </span>
                    <span className="text-[8px] opacity-70">Pase por aquí</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form with autoFocus */}
            <form onSubmit={handleScanSubmit} className="w-full max-w-md mt-4 space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="Aproxime la credencial RFID o ingrese DNI..."
                  className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-center text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>Registrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <Zap className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                <span>Lectura directa de sensor. Presione <strong>Enter</strong> para simular el pase.</span>
              </div>
            </form>

            {/* Quick Demo Cards Tester */}
            <div className="w-full mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  Tarjetas Demo para Prueba de Lectura:
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  Clic para simular lectura física
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {workers.slice(0, 4).map((worker: Worker) => (
                  <button
                    key={worker.id}
                    type="button"
                    onClick={() => handleQuickCardClick(worker.rfidTag)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950/60 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition-all hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.98] group"
                  >
                    <img
                      src={worker.avatarUrl}
                      alt={worker.name}
                      className="w-9 h-9 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-black dark:group-hover:text-white">
                        {worker.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">
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

        {/* RIGHT: Immediate Scan Result Card & Live Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Animated Result Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                Resultado de Marcación
              </h2>
              {lastScanResult && (
                <button
                  onClick={clearLastScan}
                  className="text-[11px] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>

            {lastScanResult ? (
              <div
                className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
                  lastScanResult.success
                    ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700'
                    : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                }`}
              >
                {/* Result Status Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    {lastScanResult.success ? (
                      <span className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-xl bg-rose-600 text-white">
                        <XCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {lastScanResult.success ? 'Pase Autorizado' : 'Acceso Denegado'}
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{lastScanResult.message}</p>
                    </div>
                  </div>

                  {lastScanResult.record && (
                    <Badge value={lastScanResult.record.scanType} size="sm" />
                  )}
                </div>

                {/* Worker Details (If found) */}
                {lastScanResult.worker && (
                  <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={lastScanResult.worker.avatarUrl}
                        alt={lastScanResult.worker.name}
                        className="w-14 h-14 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {lastScanResult.worker.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
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

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Área / Depto:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {lastScanResult.worker.department}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Hora Marcada:</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {lastScanResult.record?.timeFormatted || 'En tiempo real'}
                        </span>
                      </div>

                      {lastScanResult.worker.type === 'CONTRATISTA' && (
                        <div className="col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                          <span className="text-zinc-500 text-[10px] font-bold block">
                            Empresa Contratista:
                          </span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {lastScanResult.worker.contractorCompany} (SCTR: {lastScanResult.worker.sctrStatus || 'VIGENTE'})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 px-4 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400 space-y-2">
                <CreditCard className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Esperando lectura en torniquete
                </p>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Acerque la tarjeta o haga clic en una tarjeta demo para procesar el ingreso inmediato.
                </p>
              </div>
            )}
          </div>

          {/* Real-time Logs of this Terminal */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                Marcaciones Recientes en Puerta
              </h3>
              <span className="text-[10px] text-zinc-400">Hoy</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {attendanceLogs.slice(0, 5).map((log: AttendanceRecord) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={log.avatarUrl}
                      alt={log.workerName}
                      className="w-7 h-7 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{log.workerName}</p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {log.workerType === 'CONTRATISTA' ? log.contractorCompany : log.workerDepartment}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 block">
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
