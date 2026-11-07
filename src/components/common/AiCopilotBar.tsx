import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  CornerDownLeft,
  Copy,
  Check,
  AlertCircle,
  Bot,
  RefreshCw,
  Clock,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AiCopilotBarProps {
  /** Permite forzar el estado de apertura desde fuera si se requiere */
  isOpen?: boolean;
  onClose?: () => void;
}

export const AiCopilotBar: React.FC<AiCopilotBarProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (isControlled && controlledOnClose) {
      // Si es controlado, se asume que el padre maneja
    } else {
      setInternalIsOpen(true);
    }
  };

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Escuchar atajo global Ctrl + K (o Cmd + K) y ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K o Cmd + K para abrir/alternar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      }

      // ESC para cerrar
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isControlled]);

  // Auto-focus en el input al abrirse
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      // Limpiar estados transitorios al cerrar si no hay respuesta activa
      if (!response) {
        setError(null);
      }
    }
  }, [isOpen, response]);

  // Enviar consulta al backend
  const handleSubmit = async (overridePrompt?: string) => {
    const queryToSend = (overridePrompt ?? prompt).trim();
    if (!queryToSend || isLoading) return;

    if (overridePrompt) {
      setPrompt(overridePrompt);
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:5216/api/ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: queryToSend }),
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor de IA: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Si la petición es exitosa, extraer el texto de la propiedad 'respuesta' (ej. data.respuesta)
      let answerText = '';
      if (typeof data === 'string') {
        answerText = data;
      } else if (data?.respuesta !== undefined) {
        answerText = typeof data.respuesta === 'string' ? data.respuesta : JSON.stringify(data.respuesta, null, 2);
      } else if (data?.Respuesta !== undefined) {
        answerText = typeof data.Respuesta === 'string' ? data.Respuesta : JSON.stringify(data.Respuesta, null, 2);
      } else if (data?.response !== undefined) {
        answerText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response, null, 2);
      } else if (data?.result !== undefined) {
        answerText = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
      } else if (data?.message !== undefined) {
        answerText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message, null, 2);
      } else {
        answerText = JSON.stringify(data, null, 2);
      }

      setResponse(answerText);
    } catch (err: any) {
      console.error('Error al consultar AI Copilot:', err);
      setError(
        err?.message ||
        'No se pudo conectar con el endpoint del Copilot en http://localhost:5216/api/ai/copilot. Asegúrese de que el backend de C# esté activo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearAll = () => {
    setPrompt('');
    setResponse(null);
    setError(null);
    inputRef.current?.focus();
  };

  const suggestedPrompts = [
    { label: 'Aforo de hoy', query: '¿Cuántas asistencias hay hoy?', icon: Users },
    { label: 'Tolerancia y tardanzas', query: '¿Cuáles son las reglas de tolerancia e ingreso a las 07:30?', icon: Clock },
    { label: 'Horas-Hombre perdidas', query: '¿Cómo se calculan las horas-hombre perdidas en la planta?', icon: ShieldCheck },
  ];

  return (
    <>
      {/* BOTÓN FLOTANTE CON EL ÍCONO ✨ EN EL LAYOUT PRINCIPAL */}
      <button
        type="button"
        onClick={handleOpen}
        title="Abrir AI Copilot (Ctrl + K)"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-full shadow-2xl border border-slate-700/80 transition-all duration-200 hover:shadow-indigo-500/20 group cursor-pointer"
      >
        <span className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </span>
        <span className="text-xs font-bold tracking-wide pr-0.5 hidden sm:inline">
          AI Copilot
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline">
          Ctrl K
        </span>
      </button>

      {/* OVERLAY TIPO SPOTLIGHT / RAYCAST CON FONDO OSCURO TRANSLÚCIDO */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4 animate-fadeIn"
          onClick={(e) => {
            // Cerrar si hace clic fuera del modal
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 animate-scaleUp"
            role="dialog"
            aria-modal="true"
          >
            {/* BARRA DE BÚSQUEDA MINIMALISTA (SPOTLIGHT) */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-white">
              <span className="p-2 rounded-xl bg-slate-900 text-amber-300 shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>

              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Pregunta al Copilot de Planta (ej. ¿Cuántas tardanzas hubo hoy?)..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />

              {prompt && !isLoading && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Limpiar texto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isLoading || !prompt.trim()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isLoading || !prompt.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                title="Presiona Enter para consultar"
              >
                <span>Consultar</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CUERPO DINÁMICO DEL MODAL */}
            <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {/* ESTADO DE CARGA */}
              {isLoading && (
                <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <Bot className="w-4 h-4 text-slate-900 absolute" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      Cargando análisis de IA...
                    </p>
                    <p className="text-xs text-slate-500">
                      Consultando http://localhost:5216/api/ai/copilot y base de datos SQL Server
                    </p>
                  </div>
                </div>
              )}

              {/* ESTADO DE ERROR */}
              {error && !isLoading && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Error en la consulta al Copilot</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed font-mono">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-900 hover:underline pt-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reintentar consulta
                  </button>
                </div>
              )}

              {/* RESPUESTA EXITOSA DEL SERVIDOR */}
              {response && !isLoading && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-slate-900 text-amber-300">
                        <Bot className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Factoría Bruce • Copilot Inteligente
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copiar respuesta"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    <MarkdownRenderer content={response} />
                  </div>
                </div>
              )}

              {/* SUGERENCIAS CUANDO EL BUSCADOR ESTÁ VACÍO O SIN RESPUESTA */}
              {!response && !isLoading && !error && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                    <span>Preguntas sugeridas sobre operaciones de planta</span>
                    <span className="text-[10px] font-mono">Spotlight Copilot</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {suggestedPrompts.map((s, idx) => {
                      const IconComponent = s.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSubmit(s.query)}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900 group-hover:border-slate-300 shadow-2xs">
                              <IconComponent className="w-4 h-4" />
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                {s.label}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {s.query}
                              </span>
                            </div>
                          </div>
                          <CornerDownLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PIE MINIMALISTA ESTILO RAYCAST */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-bold text-slate-700 shadow-2xs">
                    ↵ Enter
                  </kbd>
                  <span>Enviar</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-bold text-slate-700 shadow-2xs">
                    Esc
                  </kbd>
                  <span>Cerrar</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>FactoriaBruce AI</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
