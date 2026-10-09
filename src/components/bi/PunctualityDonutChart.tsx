import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ShieldCheck } from 'lucide-react';
import { GENERAL_PUNCTUALITY_DISTRIBUTION } from '../../data/mockData';

export const PunctualityDonutChart: React.FC = () => {
  const data = GENERAL_PUNCTUALITY_DISTRIBUTION;
  const onTimePercentage = data.find((d) => d.name.includes('A Tiempo'))?.value || 83.5;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-md text-xs space-y-0.5 z-50">
          <p className="font-bold text-slate-900">{item.name}</p>
          <div className="flex items-center justify-between gap-3 text-slate-600">
            <span>Porcentaje:</span>
            <strong className="font-mono text-slate-900">{item.value}%</strong>
          </div>
          <div className="flex items-center justify-between gap-3 text-slate-600">
            <span>Marcaciones:</span>
            <span className="font-mono text-slate-700">{item.count}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-800" />
            Índice General de Puntualidad
          </h3>
          <p className="text-xs text-slate-500">
            Distribución global de ingreso por umbrales de horario.
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Meta: ≥ 85%
        </span>
      </div>

      {/* Gráfico Donut con Indicador Central */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Cifra Central en el Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {onTimePercentage}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            A Tiempo
          </span>
        </div>
      </div>

      {/* Leyenda y Desglose Detallado */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-700 truncate pr-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="truncate">{item.name.split('(')[0]}</span>
            </span>
            <span className="font-mono font-bold text-slate-900 shrink-0">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
