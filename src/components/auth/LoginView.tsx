import React, { useState } from 'react';
import { Lock, Mail, Shield, AlertCircle, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { AdminRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess?: (email: string, role?: AdminRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { login } = useApp();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Por favor ingrese su correo corporativo y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Ejecutar validación estricta de credenciales en el contexto
    const result = login(cleanEmail, cleanPassword);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Credenciales incorrectas');
      return;
    }

    if (onLoginSuccess && result.user) {
      onLoginSuccess(result.user.email, result.user.role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md space-y-6">
        
        {/* Cabecera Corporativa Sobria */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xs mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Factoría Bruce S.A.
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sistema Integrado de Control de Asistencia RFID & Business Intelligence
          </p>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Acceso Exclusivo Administrativo • Planta Industrial
          </div>
        </div>

        {/* Tarjeta de Formulario Tradicional y Limpio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingrese su correo institucional y clave de acceso para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
            {/* Mensaje de Error si las credenciales no coinciden */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Campo Correo Corporativo */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block font-semibold text-slate-700"
              >
                Correo Corporativo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="ej. cpunlay@grupobruce.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Campo Contraseña de Seguridad */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block font-semibold text-slate-700"
              >
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors font-mono"
                />
              </div>
            </div>

            {/* Botón de Envío */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-xs"
              >
                {isLoading ? (
                  <span>Validando credenciales...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer institucional */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          © {new Date().getFullYear()} Factoría Bruce S.A. • Trujillo, Perú
        </p>
      </div>
    </div>
  );
};
