import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Splash Screen corporativo minimalista.
 * Se muestra durante exactamente 2 segundos al inicializar el sistema.
 * Fondo sólido, sin degradados ni brillos exagerados.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeState, setFadeState] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    // Transición suave de entrada
    const enterTimer = setTimeout(() => {
      setFadeState('visible');
    }, 50);

    // Salida suave a los 1850ms y completado a los 2000ms
    const exitTimer = setTimeout(() => {
      setFadeState('exiting');
    }, 1800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white select-none transition-opacity duration-300 ${
        fadeState === 'entering'
          ? 'opacity-0'
          : fadeState === 'visible'
          ? 'opacity-100'
          : 'opacity-0'
      }`}
    >
      <div className="text-center px-6 max-w-lg space-y-4">
        {/* Isotipo corporativo sobrio */}
        <div className="mx-auto w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 mb-2">
          <svg
            className="w-6 h-6 text-slate-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>

        {/* Nombre requerido exactamente por especificación */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            Factoría Bruce S.A.
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            Sistema Automatizado de Control de Asistencia
          </p>
        </div>

        {/* Barra sutil de carga (2s) */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-slate-300 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
