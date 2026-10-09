import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingDown } from 'lucide-react';
import { MONTHLY_ABSENTEEISM_TRENDS } from '../../data/mockData';

export const MonthlyAbsenteeismChart: React.FC = () => {
  const data = MONTHLY_ABSENTEEISM_TRENDS;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Tasa de Ausentismo:</span>
            <strong className="font-mono text-rose-600">{item.absenteeismRate}%</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Jornadas Inasistencia:</span>
            <span className="font-mono text-slate-900">{item.absences} faltas</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Minutos Tardanza:</span>
            <span className="font-mono text-amber-600">{item.tardinessMinutes} min</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
            <span className="text-slate-600 font-semibold">Pérdida Económica:</span>
            <strong className="font-mono text-slate-900">S/. {item.economicLoss.toLocaleString('es-PE')}</strong>
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
            <TrendingDown className="w-4 h-4 text-rose-600" />
            Evolución Mensual de la Tasa de Ausentismo (%)
          </h3>
          <p className="text-xs text-slate-500">
            Comportamiento histórico semestral de inasistencias no justificadas sobre jornadas totales.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto font-semibold">
          <span>Tendencia a la baja (-2.5%)</span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="absenteeismGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#475569', fontSize: 11 }}
              stroke="#cbd5e1"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              domain={[0, 6]}
              unit="%"
              stroke="#cbd5e1"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="absenteeismRate"
              stroke="#e11d48"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#absenteeismGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <span>Fuente: Módulo de Marcaciones UHF RFID y Papeletas Normativas</span>
        <span className="font-semibold text-slate-700">Promedio semestral: 3.4%</span>
      </div>
    </div>
  );
};
