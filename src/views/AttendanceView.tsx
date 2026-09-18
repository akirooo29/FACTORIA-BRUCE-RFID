import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import type { AttendanceRecord, WorkerType, AttendancePunctuality } from '../types';
import {
  Clock,
  Search,
  FileSpreadsheet,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { attendanceLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | WorkerType>('ALL');
  const [punctualityFilter, setPunctualityFilter] = useState<'ALL' | AttendancePunctuality>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const filteredLogs = attendanceLogs.filter((log: AttendanceRecord) => {
    const matchesSearch =
      log.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.contractorCompany && log.contractorCompany.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.terminalLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || log.workerType === typeFilter;
    const matchesPunctuality = punctualityFilter === 'ALL' || log.punctuality === punctualityFilter;

    return matchesSearch && matchesType && matchesPunctuality;
  });

  const handleExportCSV = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Control & Bitácora de Asistencia RFID
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Registro cronológico inmutable con reglas de 07:30 AM, tolerancia computable hasta 07:35 AM y puerta cerrada.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
        >
          {downloadSuccess ? <Check className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>{downloadSuccess ? '¡Reporte Generado!' : 'Exportar Bitácora (CSV)'}</span>
        </button>
      </div>

      {/* OPERATIONAL RULES BANNER (CONDICIONALES EXACTAS) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-white" />
            Directiva de Puntualidad & Tolerancia en Puerta
          </span>
          <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">
            Norma Interna 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>1. A Tiempo (≤ 07:30:00 AM)</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Marcación regular puntual. 100% de efectividad de jornada y sin descuento salarial.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>2. Tardanza (07:30:01 - 07:35:00 AM)</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Se permite el ingreso a planta. Se acumulan los minutos de tardanza para descuento legal: <strong className="font-mono text-zinc-800 dark:text-zinc-200">[Sueldo / 8h / 60min]</strong>.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>3. Puerta Cerrada (&gt; 07:35:00 AM)</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Falta por defecto. Ingreso restringido. Exige papeleta de <strong className="text-zinc-900 dark:text-white">Autorización Fuera de Tolerancia</strong> firmada únicamente por el <strong className="text-zinc-900 dark:text-white">Jefe de Planta</strong> o <strong className="text-zinc-900 dark:text-white">Gerente General</strong> (RRHH inhabilitado).
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por colaborador, tag RFID, empresa o terminal..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Worker Type */}
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('EMPLEADO_INTERNO')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'EMPLEADO_INTERNO'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Planilla
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('CONTRATISTA')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'CONTRATISTA'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Contratistas
            </button>
          </div>

          {/* Punctuality Filter with Exact Business Rules */}
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPunctualityFilter('ALL')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                punctualityFilter === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPunctualityFilter('A_TIEMPO')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                punctualityFilter === 'A_TIEMPO'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              ≤ 07:30
            </button>
            <button
              type="button"
              onClick={() => setPunctualityFilter('TARDANZA_DESCUENTO')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                punctualityFilter === 'TARDANZA_DESCUENTO'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              7:30-7:35
            </button>
            <button
              type="button"
              onClick={() => setPunctualityFilter('PUERTA_CERRADA')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                punctualityFilter === 'PUERTA_CERRADA'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              &gt; 07:35
            </button>
          </div>

        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Hora & Fecha</th>
                <th className="py-3.5 px-4">Colaborador</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Movimiento</th>
                <th className="py-3.5 px-4">Clasificación de Puntualidad</th>
                <th className="py-3.5 px-4">Tag RFID</th>
                <th className="py-3.5 px-4">Terminal & Ubicación</th>
                <th className="py-3.5 px-4">Observación / Autorización</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredLogs.map((log: AttendanceRecord) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                      {log.timeFormatted}
                    </span>
                    <span className="text-[10px] text-zinc-400">{log.dateFormatted}</span>
                  </td>

                  {/* Worker & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={log.avatarUrl}
                        alt={log.workerName}
                        className="w-8 h-8 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-zinc-900 dark:text-white block truncate max-w-[170px]">
                          {log.workerName}
                        </span>
                        <span className="text-[10px] text-zinc-500">{log.workerPosition}</span>
                      </div>
                    </div>
                  </td>

                  {/* Worker Type */}
                  <td className="py-3.5 px-4">
                    <Badge value={log.workerType} size="sm" />
                  </td>

                  {/* Scan Type */}
                  <td className="py-3.5 px-4">
                    <Badge value={log.scanType} size="sm" />
                  </td>

                  {/* Punctuality with 7:30 / 7:35 / Puerta Cerrada */}
                  <td className="py-3.5 px-4">
                    {log.punctuality ? (
                      <Badge value={log.punctuality} size="sm" />
                    ) : (
                      <span className="text-zinc-400 text-[10px]">--</span>
                    )}
                  </td>

                  {/* Tag */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {log.rfidTag}
                    </span>
                  </td>

                  {/* Terminal */}
                  <td className="py-3.5 px-4">
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium block">{log.terminalId}</span>
                    <span className="text-[10px] text-zinc-400">{log.terminalLocation.split('(')[1]?.replace(')', '') || log.terminalLocation}</span>
                  </td>

                  {/* Notes & Authority info for > 07:35 AM */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {log.authorizedBy ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Aprobado: {log.authorizedBy === 'JEFE_PLANTA' ? 'Jefe de Planta' : 'Gerencia'}
                        </span>
                        <p className="text-[10px] text-zinc-500 truncate">Doc: {log.toleranceAuthorizationDoc}</p>
                      </div>
                    ) : log.punctuality === 'TARDANZA_DESCUENTO' ? (
                      <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                        +{log.delayMinutes} min computable
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500 truncate block">
                        {log.notes || '--'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
