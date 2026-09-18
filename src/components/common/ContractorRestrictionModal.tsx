import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, AlertTriangle, Building2, FileCheck2 } from 'lucide-react';

export const ContractorRestrictionModal: React.FC = () => {
  const {
    activeContractorWarningModal,
    setActiveContractorWarningModal,
    attemptedRestrictedSection,
  } = useApp();

  if (!activeContractorWarningModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100">
        
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Módulo Restringido
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Reglamento Interno de Trabajo • Factoría Bruce S.A.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveContractorWarningModal(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                Acceso no disponible para el módulo de {attemptedRestrictedSection || 'Beneficios'}:
              </span>
              El personal bajo régimen de <strong className="text-zinc-900 dark:text-zinc-100">Contratista / Servicios Tercerizados</strong> no cuenta con régimen de vacaciones pagadas, licencias sindicales ni descansos médicos por planilla interna de Factoría Bruce.
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <p className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
              Protocolo Operativo para Contratistas:
            </p>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <Building2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
              <span>Gestionar cualquier descanso o licencia directamente con su <strong>Empresa Empleadora / Contratista</strong>.</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <FileCheck2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
              <span>La empresa contratista debe notificar al área de HSE con 24h de anticipación para la reprogramación de pase RFID.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveContractorWarningModal(false)}
            className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95"
          >
            Entendido, Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
