import React from 'react';
import { useApp } from '../context/AppContext';
import { AreaIncidencesChart } from '../components/bi/AreaIncidencesChart';
import { DEPARTMENT_BI_DATA } from '../data/mockData';
import { TrendingDown } from 'lucide-react';

export const AreaIncidencesView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
              <TrendingDown className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Análisis Departamental de Incidencias & Frecuencia
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Identificación de cuellos de botella, áreas críticas en puntualidad y ausentismo no programado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('dashboard_bi')}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          ← Volver al Dashboard BI
        </button>
      </div>

      {/* Gráfico Principal */}
      <AreaIncidencesChart />

      {/* Tarjetas de Áreas Críticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEPARTMENT_BI_DATA.slice(0, 3).map((dept, index) => (
          <div key={index} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                index === 0 ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-100 text-slate-700'
              }`}>
                Puesto #{index + 1} en Incidencias
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {dept.tardiness + dept.absences} eventos
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900">{dept.department}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {dept.totalWorkers} colaboradores • {dept.totalDelayMinutes} min acumulados
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Tardanzas:</span>
                <span className="font-mono font-bold text-amber-700">{dept.tardiness}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Faltas:</span>
                <span className="font-mono font-bold text-rose-700">{dept.absences}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Impacto Estimado:</span>
              <strong className="font-mono text-slate-900">
                S/. {dept.economicDeductionImpact.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
