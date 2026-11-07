import React, { useState, useEffect } from 'react';

interface FatigueScore {
  trabajadorId: number;
  nombre: string;
  minutosTardanza: number;
  horasExtra: number;
  riesgoFatiga: number;
}

export const AiFatigueRadarView: React.FC = () => {
  const [scores, setScores] = useState<FatigueScore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('http://localhost:5216/api/ai/fatigue-scores');
        if (!response.ok) throw new Error('Error al conectar con el motor de ML.NET');
        const data = await response.json();
        
        const sortedData = data.sort((a: FatigueScore, b: FatigueScore) => b.riesgoFatiga - a.riesgoFatiga);
        setScores(sortedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();
  }, []);

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'bg-red-50 border-red-200 text-red-700';
    if (risk >= 40) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  };

  const getProgressColor = (risk: number) => {
    if (risk >= 80) return 'bg-red-500';
    if (risk >= 40) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Analizando patrones históricos con ML.NET...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Radar de Prevención IA
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Análisis predictivo de fatiga basado en tardanzas y horas extra (Últimos 7 días)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scores.map((worker) => (
          <div key={worker.trabajadorId} className={`p-5 rounded-xl border ${getRiskColor(worker.riesgoFatiga)} shadow-sm transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">{worker.nombre}</h3>
              <span className="text-2xl font-bold">{worker.riesgoFatiga}%</span>
            </div>
            
            <div className="w-full bg-white rounded-full h-2.5 mb-5 overflow-hidden border border-white/50">
              <div 
                className={`h-2.5 rounded-full ${getProgressColor(worker.riesgoFatiga)}`} 
                style={{ width: `${worker.riesgoFatiga}%` }}
              ></div>
            </div>

            <div className="space-y-2 text-sm bg-white/60 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="opacity-80">Tardanza acumulada:</span>
                <span className="font-medium">{worker.minutosTardanza} min</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Sobrecarga (Hrs Extra):</span>
                <span className="font-medium">{worker.horasExtra.toFixed(1)} hrs</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

