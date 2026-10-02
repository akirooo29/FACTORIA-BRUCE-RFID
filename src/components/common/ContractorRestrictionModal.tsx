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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 text-slate-900 dark:text-slate-100">
        
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Módulo Restringido
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Reglamento Interno de Trabajo • Factoría Bruce S.A.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveContractorWarningModal(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                Acceso no disponible para el módulo de {attemptedRestrictedSection || 'Beneficios'}:
              </span>
              El personal bajo régimen de <strong className="text-slate-900 dark:text-slate-100">Contratista / Servicios Tercerizados</strong> no cuenta con régimen de vacaciones pagadas, licencias sindicales ni descansos médicos por planilla interna de Factoría Bruce S.A.
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
              Protocolo Operativo para Contratistas:
            </p>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
              <span>Gestionar cualquier descanso o licencia directamente con su <strong>Empresa Empleadora / Contratista</strong>.</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <FileCheck2 className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
              <span>La empresa contratista debe notificar al área de HSE con 24h de anticipación para la reprogramación de pase RFID.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveContractorWarningModal(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Entendido, Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
