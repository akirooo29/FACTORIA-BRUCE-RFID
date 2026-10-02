import React, { useState } from 'react';
import { Lock, User, CheckCircle2, Shield } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
}

/**
 * Pantalla de Inicio de Sesión Corporativa Minimalista (SaaS Tradicional)
 * - Fondo plano bg-slate-50
 * - Bordes sutiles border-slate-200
 * - Botón sólido sobrio
 * - Sin brillos, degradados ni efectos glassmorphism
 */
export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('••••••••');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Por favor ingrese su usuario corporativo.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Simulación de autenticación corporativa
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(username.trim());
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <div className="w-full max-w-sm space-y-6">
        
        {/* Cabecera Corporativa Sobria */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 mb-1">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Factoría Bruce S.A.
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sistema Integrado de Asistencia & Control RFID
          </p>
        </div>

        {/* Tarjeta de Formulario Minimalista */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-xs">
          <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ingrese sus credenciales autorizadas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Campo Usuario */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block font-medium text-slate-700 dark:text-slate-300"
              >
                Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario.corporativo"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 transition-colors"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block font-medium text-slate-700 dark:text-slate-300"
                >
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 transition-colors"
                />
              </div>
            </div>

            {/* Botón Sólido y Sobrio */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Ingresando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ingresar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Información de demostración */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Acceso Demostrativo:
            </p>
            <p>
              Haga clic en <strong className="text-slate-800 dark:text-slate-200">Ingresar</strong> directamente para acceder al panel principal de operaciones.
            </p>
          </div>
        </div>

        {/* Footer institucional */}
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Factoría Bruce S.A. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
