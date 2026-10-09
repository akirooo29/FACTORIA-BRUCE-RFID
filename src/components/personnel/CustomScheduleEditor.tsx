import { Clock, Info } from 'lucide-react';
import type { CustomSchedule, WeekDay } from '../../types';

interface CustomScheduleEditorProps {
  schedule: CustomSchedule;
  onChange: (updated: CustomSchedule) => void;
  disabled?: boolean;
}

const WEEKDAYS: WeekDay[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const calculateDayHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const diffMinutes = endH * 60 + endM - (startH * 60 + startM);
  return diffMinutes > 0 ? Math.round((diffMinutes / 60) * 10) / 10 : 0;
};

export const calculateWeeklyTotalHours = (schedule: CustomSchedule): number => {
  return WEEKDAYS.reduce((total, day) => {
    const dayConfig = schedule[day];
    if (dayConfig && dayConfig.enabled) {
      return total + calculateDayHours(dayConfig.startTime, dayConfig.endTime);
    }
    return total;
  }, 0);
};

export const CustomScheduleEditor: React.FC<CustomScheduleEditorProps> = ({
  schedule,
  onChange,
  disabled = false,
}) => {
  const handleToggleDay = (day: WeekDay) => {
    const current = schedule[day] || { enabled: false, startTime: '08:00', endTime: '14:00' };
    onChange({
      ...schedule,
      [day]: {
        ...current,
        enabled: !current.enabled,
      },
    });
  };

  const handleTimeChange = (day: WeekDay, field: 'startTime' | 'endTime', value: string) => {
    const current = schedule[day] || { enabled: true, startTime: '08:00', endTime: '14:00' };
    onChange({
      ...schedule,
      [day]: {
        ...current,
        [field]: value,
      },
    });
  };

  const totalWeeklyHours = calculateWeeklyTotalHours(schedule);

  return (
    <div className="space-y-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Horario Personalizado de Prácticas (Día por Día)
            </h4>
            <p className="text-[11px] text-slate-500">
              Seleccione los días de asistencia y defina horas de ingreso y salida independientes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-600">Total Semanal:</span>
          <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
            totalWeeklyHours <= 30
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {totalWeeklyHours} hrs / sem
          </span>
        </div>
      </div>

      {/* Grid de días de la semana */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {WEEKDAYS.map((day) => {
          const config = schedule[day] || { enabled: false, startTime: '08:00', endTime: '14:00' };
          const hours = config.enabled ? calculateDayHours(config.startTime, config.endTime) : 0;

          return (
            <div
              key={day}
              className={`p-2.5 rounded-lg border transition-all ${
                config.enabled
                  ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-500/10'
                  : 'bg-slate-100/70 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    disabled={disabled}
                    onChange={() => handleToggleDay(day)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${config.enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                    {day}
                  </span>
                </label>

                {config.enabled ? (
                  <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {hours} hrs
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">
                    No asiste
                  </span>
                )}
              </div>

              {config.enabled && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-500 font-semibold block">
                      Entrada
                    </label>
                    <input
                      type="time"
                      value={config.startTime}
                      disabled={disabled}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-500 font-semibold block">
                      Salida
                    </label>
                    <input
                      type="time"
                      value={config.endTime}
                      disabled={disabled}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nota legal y formativa */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
        <Info className="w-4 h-4 shrink-0 text-blue-700 mt-0.5" />
        <div>
          <span className="font-semibold">Regla Formativa (D.L. 1401 / Ley 28518):</span> La jornada de prácticas pre-profesionales no debe exceder las 6 horas diarias ni 30 horas semanales.
        </div>
      </div>
    </div>
  );
};
