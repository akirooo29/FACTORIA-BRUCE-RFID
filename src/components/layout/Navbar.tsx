import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  Bell,
  Sun,
  Moon,
  Clock,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    activeUserRole,
    setActiveUserRole,
    isAntennaConnected,
    setIsAntennaConnected,
    activeTerminal,
    setActiveTerminal,
    vacationNotifications,
    currentUser,
    logout,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const terminals = [
    'TRM-01 (Puerta Principal - Torniquete A)',
    'TRM-02 (Acceso Vehicular & Contratistas)',
    'TRM-03 (Taller Central de Mecanizado)',
    'TRM-04 (Almacén Central y Despacho)',
  ];

  const unreadVacationCount = vacationNotifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Izquierda: Selector de Terminal y Estado RFID */}
      <div className="flex items-center gap-3">
        {/* Indicador de Antena */}
        <button
          type="button"
          onClick={() => setIsAntennaConnected(!isAntennaConnected)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            isAntennaConnected
              ? 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          }`}
          title="Alternar estado de enlace de antenas RFID"
        >
          {isAntennaConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">RFID Conectado</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">RFID Offline</span>
            </>
          )}
        </button>

        {/* Selector de Terminal Activo */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">
          <span className="text-[11px] text-slate-400">Terminal:</span>
          <select
            value={activeTerminal}
            onChange={(e) => setActiveTerminal(e.target.value)}
            className="bg-transparent border-none text-slate-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            {terminals.map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Derecha: Selector de Rol, Tema, Reloj, Notificaciones y Salir */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Selector de Rol de Sesión */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveUserRole('EMPLEADO_INTERNO')}
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
              activeUserRole === 'EMPLEADO_INTERNO'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Planilla
          </button>
          <button
            type="button"
            onClick={() => setActiveUserRole('CONTRATISTA')}
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
              activeUserRole === 'CONTRATISTA'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Contratista
          </button>
        </div>

        {/* Reloj de Planta */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{currentTime}</span>
        </div>

        {/* Botón Modo Claro / Oscuro */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition-colors cursor-pointer"
          title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notificaciones */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Avisos del Sistema"
          >
            <Bell className="w-4 h-4" />
            {unreadVacationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-bold">
                {unreadVacationCount}
              </span>
            )}
          </button>

          {/* Menú Dropdown de Notificaciones */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md p-4 text-xs z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Avisos & Notificaciones</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vacationNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">{notif.workerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perfil de Usuario & Botón Cerrar Sesión */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {currentUser || 'admin'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Factoría Bruce
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors cursor-pointer"
            title="Cerrar sesión del sistema"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
