import React, { useState } from 'react';
import { Lock, Mail, CheckCircle2, Shield, BarChart3, Users } from 'lucide-react';
import type { AdminRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (email: string, role?: AdminRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('cpunlay@grupobruce.com');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('GERENCIA');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreset = (presetEmail: string, role: AdminRole) => {
    setEmail(presetEmail);
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Por favor ingrese su correo corporativo.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const role: AdminRole = cleanEmail === 'cpunlay@grupobruce.com' ? 'GERENCIA' : 'RRHH';
      onLoginSuccess(cleanEmail, role);
    }, 200);
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

        {/* Tarjeta de Formulario Minimalista */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Seleccionar Perfil de Acceso
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Elija un entorno administrativo o ingrese sus credenciales
            </p>
          </div>

          {/* Selector de Perfiles Empresariales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectPreset('cpunlay@grupobruce.com', 'GERENCIA')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'GERENCIA' && email === 'cpunlay@grupobruce.com'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/10'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-1.5 rounded-lg ${
                  selectedRole === 'GERENCIA' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  <BarChart3 className="w-4 h-4" />
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  selectedRole === 'GERENCIA' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}>
                  BI Analítica
                </span>
              </div>
              <p className="font-bold text-xs leading-tight">Gerencia General</p>
              <p className={`text-[11px] mt-0.5 truncate ${
                selectedRole === 'GERENCIA' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                cpunlay@grupobruce.com
              </p>
              <p className={`text-[10px] mt-1.5 leading-snug line-clamp-2 ${
                selectedRole === 'GERENCIA' ? 'text-slate-300/90' : 'text-slate-500'
              }`}>
                KPIs ejecutivos, ausentismo, impacto económico y puntualidad.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('rrhh@grupobruce.com', 'RRHH')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'RRHH' && email === 'rrhh@grupobruce.com'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/10'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-1.5 rounded-lg ${
                  selectedRole === 'RRHH' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  <Users className="w-4 h-4" />
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  selectedRole === 'RRHH' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}>
                  Operativo
                </span>
              </div>
              <p className="font-bold text-xs leading-tight">Recursos Humanos</p>
              <p className={`text-[11px] mt-0.5 truncate ${
                selectedRole === 'RRHH' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                rrhh@grupobruce.com
              </p>
              <p className={`text-[10px] mt-1.5 leading-snug line-clamp-2 ${
                selectedRole === 'RRHH' ? 'text-slate-300/90' : 'text-slate-500'
              }`}>
                Gestión de personal, horarios, papeletas y control RFID.
              </p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs">
                {errorMessage}
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value.toLowerCase().includes('cpunlay')) {
                      setSelectedRole('GERENCIA');
                    } else if (e.target.value.toLowerCase().includes('rrhh')) {
                      setSelectedRole('RRHH');
                    }
                  }}
                  placeholder="ej. cpunlay@grupobruce.com o rrhh@grupobruce.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors font-mono"
                />
              </div>
            </div>

            {/* Botón Sólido */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-xs"
              >
                {isLoading ? (
                  <span>Autenticando en Servidor...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Ingresar a {selectedRole === 'GERENCIA' ? 'Panel de Gerencia (BI)' : 'Panel de RRHH (Operativo)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Información de Demostración */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              Perfiles Oficiales Disponibles:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                <span className="font-bold text-slate-800 block">Gerencia:</span>
                <span className="font-mono text-slate-600">cpunlay@grupobruce.com</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                <span className="font-bold text-slate-800 block">Recursos Humanos:</span>
                <span className="font-mono text-slate-600">rrhh@grupobruce.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer institucional */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          © {new Date().getFullYear()} Factoría Bruce S.A. • Trujillo, Perú
        </p>
      </div>
    </div>
  );
};
