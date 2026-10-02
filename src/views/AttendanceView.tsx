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
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      log.workerName.toLowerCase().includes(q) ||
      log.rfidTag.toLowerCase().includes(q) ||
      (log.contractorCompany && log.contractorCompany.toLowerCase().includes(q)) ||
      log.terminalLocation.toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || log.workerType === typeFilter;
    const matchesPunctuality = punctualityFilter === 'ALL' || log.punctuality === punctualityFilter;

    return matchesSearch && matchesType && matchesPunctuality;
  });

  const handleExportCSV = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Corporativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <Clock className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Control & Bitácora de Asistencia RFID
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro cronológico inmutable con reglas de 07:30 AM, tolerancia computable hasta 07:35 AM y puerta cerrada.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
          <span>{downloadSuccess ? '¡Reporte Generado!' : 'Exportar Bitácora (CSV)'}</span>
        </button>
      </div>

      {/* Reglas Operativas Normativas */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-white" />
            Directiva de Puntualidad & Tolerancia en Puerta
          </span>
          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-300">
            Norma Interna 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Regla 1 */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>1. A Tiempo (≤ 07:30:00 AM)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Marcación regular puntual. 100% de efectividad de jornada y sin descuento salarial.
            </p>
          </div>

          {/* Regla 2 */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>2. Tardanza (07:30:01 - 07:35:00 AM)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Permite el ingreso a planta. Descuento en planilla: <strong className="font-mono text-slate-800 dark:text-slate-200">[Sueldo / 8h / 60min]</strong>.
            </p>
          </div>

          {/* Regla 3 */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>3. Puerta Cerrada (&gt; 07:35:00 AM)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Falta por defecto. Ingreso exige autorización firmada exclusivamente por <strong className="text-slate-800 dark:text-slate-200">Jefe de Planta</strong> o <strong className="text-slate-800 dark:text-slate-200">Gerencia</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscador */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por colaborador, tag RFID, empresa o terminal..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
            />
          </div>

          {/* Tipo de Trabajador */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('EMPLEADO_INTERNO')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                typeFilter === 'EMPLEADO_INTERNO'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Planilla
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('CONTRATISTA')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                typeFilter === 'CONTRATISTA'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Contratistas
            </button>
          </div>

          {/* Filtro Puntualidad */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setPunctualityFilter('ALL')}
              className={`flex-1 py-1 px-2 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                punctualityFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPunctualityFilter('A_TIEMPO')}
              className={`flex-1 py-1 px-2 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                punctualityFilter === 'A_TIEMPO'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ≤ 07:30
            </button>
            <button
              type="button"
              onClick={() => setPunctualityFilter('TARDANZA_DESCUENTO')}
              className={`flex-1 py-1 px-2 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                punctualityFilter === 'TARDANZA_DESCUENTO'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              7:30-7:35
            </button>
            <button
              type="button"
              onClick={() => setPunctualityFilter('PUERTA_CERRADA')}
              className={`flex-1 py-1 px-2 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                punctualityFilter === 'PUERTA_CERRADA'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              &gt; 07:35
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Asistencia Minimalista */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Hora & Fecha</th>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Régimen</th>
                <th className="py-3 px-4">Movimiento</th>
                <th className="py-3 px-4">Clasificación Puntualidad</th>
                <th className="py-3 px-4">Tag RFID</th>
                <th className="py-3 px-4">Terminal & Ubicación</th>
                <th className="py-3 px-4">Observación / Autorización</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map((log: AttendanceRecord) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white block">
                      {log.timeFormatted}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.dateFormatted}</span>
                  </td>

                  {/* Worker & Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={log.avatarUrl}
                        alt={log.workerName}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white block truncate max-w-[170px]">
                          {log.workerName}
                        </span>
                        <span className="text-[10px] text-slate-500">{log.workerPosition}</span>
                      </div>
                    </div>
                  </td>

                  {/* Worker Type */}
                  <td className="py-3 px-4">
                    <Badge value={log.workerType} size="sm" />
                  </td>

                  {/* Scan Type */}
                  <td className="py-3 px-4">
                    <Badge value={log.scanType} size="sm" />
                  </td>

                  {/* Puntualidad */}
                  <td className="py-3 px-4">
                    {log.punctuality ? (
                      <Badge value={log.punctuality} size="sm" />
                    ) : (
                      <span className="text-slate-400 text-[10px]">--</span>
                    )}
                  </td>

                  {/* Tag */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                      {log.rfidTag}
                    </span>
                  </td>

                  {/* Terminal */}
                  <td className="py-3 px-4">
                    <span className="text-slate-800 dark:text-slate-200 font-medium block">{log.terminalId}</span>
                    <span className="text-[10px] text-slate-400">{log.terminalLocation.split('(')[1]?.replace(')', '') || log.terminalLocation}</span>
                  </td>

                  {/* Notas */}
                  <td className="py-3 px-4 max-w-xs">
                    {log.authorizedBy ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Aprobado: {log.authorizedBy === 'JEFE_PLANTA' ? 'Jefe de Planta' : 'Gerencia'}
                        </span>
                        <p className="text-[10px] text-slate-500 truncate">Doc: {log.toleranceAuthorizationDoc}</p>
                      </div>
                    ) : log.punctuality === 'TARDANZA_DESCUENTO' ? (
                      <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        +{log.delayMinutes} min computable
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 truncate block">
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
