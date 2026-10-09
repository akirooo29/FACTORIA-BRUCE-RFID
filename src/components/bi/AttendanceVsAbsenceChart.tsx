import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DepartmentIncidence } from '../../types';

interface AttendanceVsAbsenceChartProps {
  data: DepartmentIncidence[];
}

export const AttendanceVsAbsenceChart: React.FC<AttendanceVsAbsenceChartProps> = ({ data }) => {
  // Formatear datos para Recharts
  const chartData = data.map((item) => ({
    area: item.department.replace('&', '+').replace('Seguridad y Medio Ambiente (HSE)', 'HSE'),
    Asistencias: item.attendances,
    Tardanzas: item.tardiness,
    Faltas: item.absences,
    Puntualidad: item.punctualityRate,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1 z-50">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <strong className="font-mono text-slate-900">{entry.value} marcaciones</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Comparativo de Asistencias vs. Faltas por Área
          </h3>
          <p className="text-xs text-slate-500">
            Distribución operativa acumulada del mes evaluada en cada departamento de planta.
          </p>
        </div>

        <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
          6 Áreas Auditadas
        </span>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="area"
              tick={{ fill: '#475569', fontSize: 11 }}
              angle={-20}
              textAnchor="end"
              interval={0}
              stroke="#cbd5e1"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
              formatter={(value) => <span className="text-slate-700 font-semibold">{value}</span>}
            />
            {/* Colores corporativos sobrios: Slate/Navy para asistencias, Ámbar para tardanzas, Rojo sobrio para faltas */}
            <Bar dataKey="Asistencias" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Tardanzas" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Faltas" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
