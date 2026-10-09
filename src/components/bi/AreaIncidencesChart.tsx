import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { DEPARTMENT_BI_DATA } from '../../data/mockData';

export const AreaIncidencesChart: React.FC = () => {
  // Ordenar áreas de mayor a menor según incidencias totales (tardanzas + faltas)
  const sortedData = [...DEPARTMENT_BI_DATA]
    .map((dept) => ({
      name: dept.department.replace('&', '+').replace('Seguridad y Medio Ambiente (HSE)', 'HSE'),
      totalIncidences: dept.tardiness + dept.absences,
      tardiness: dept.tardiness,
      absences: dept.absences,
      delayMinutes: dept.totalDelayMinutes,
      economicImpact: dept.economicDeductionImpact,
    }))
    .sort((a, b) => b.totalIncidences - a.totalIncidences);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1 z-50">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{item.name}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Total Incidencias:</span>
            <strong className="font-mono text-slate-900">{item.totalIncidences} eventos</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-amber-700">
            <span>Tardanzas (toleradas/exceso):</span>
            <span className="font-mono">{item.tardiness}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-700">
            <span>Faltas no autorizadas:</span>
            <span className="font-mono">{item.absences}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-700 pt-1 border-t border-slate-100">
            <span>Tiempo acumulado perdido:</span>
            <span className="font-mono font-bold">{item.delayMinutes} min</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Impacto Económico:</span>
            <strong className="font-mono text-slate-900">S/. {item.economicImpact.toLocaleString('es-PE')}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Ranking de Áreas con Más Incidencias
          </h3>
          <p className="text-xs text-slate-500">
            Suma de tardanzas y ausencias detectadas en los puntos de control de planta.
          </p>
        </div>

        <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 self-start sm:self-auto">
          Foco: Operaciones & Planta
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 25, left: 35, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              stroke="#cbd5e1"
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="totalIncidences"
              fill="#d97706"
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <span>Criterio: Tardanza (07:30 a 07:35 AM) + Puerta Cerrada (&gt; 07:35 AM)</span>
        <span className="font-semibold text-slate-800">Total: {sortedData.reduce((a, b) => a + b.totalIncidences, 0)} incidencias</span>
      </div>
    </div>
  );
};
