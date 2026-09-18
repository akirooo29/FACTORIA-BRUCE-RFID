import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  Bell,
  UserCheck,
  HardHat,
  Calendar,
  Sun,
  Moon,
  Palmtree,
  Check,
  Clock,
} from 'lucide-react';
import type { WorkerType } from '../../types';

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
    attendanceLogs,
    vacationNotifications,
    markNotificationRead,
    setCurrentView,
    setSelectedWorkerForStats,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'VACACIONES' | 'RFID'>('VACACIONES');

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
      setCurrentDate(
        now.toLocaleDateString('es-PE', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
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
    <header className="h-20 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Terminal Selector & Hardware Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Gateway RFID Beacon (Administrative Mode) */}
        <button
          type="button"
          onClick={() => setIsAntennaConnected(!isAntennaConnected)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
            isAntennaConnected
              ? 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700'
              : 'bg-zinc-200 text-zinc-500 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
          }`}
          title="Estado del enlace con hardware RFID en planta"
        >
          {isAntennaConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-400"></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Gateway RFID Online</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Gateway Desconectado</span>
            </>
          )}
        </button>

        {/* Terminal Selector Dropdown */}
        <div className="hidden lg:flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300">
          <span className="text-zinc-400 font-medium">Terminal Activo:</span>
          <select
            value={activeTerminal}
            onChange={(e) => setActiveTerminal(e.target.value)}
            className="bg-transparent border-none text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer pr-1"
          >
            {terminals.map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions: Theme Toggle, Clock, Role Switcher, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* THEME TOGGLE: LIGHT / DARK MODE */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
          title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-zinc-900" />
              <span className="hidden sm:inline">Modo Oscuro</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-zinc-100" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          )}
        </button>

        {/* Real-time Clock */}
        <div className="hidden md:flex flex-col items-end px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-wider">
            {currentTime}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 capitalize">
            <Calendar className="w-2.5 h-2.5" />
            {currentDate}
          </div>
        </div>

        {/* ROLE PERSPECTIVE SWITCHER */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveUserRole('EMPLEADO_INTERNO' as WorkerType)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeUserRole === 'EMPLEADO_INTERNO'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Empleado</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveUserRole('CONTRATISTA' as WorkerType)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeUserRole === 'CONTRATISTA'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contratista</span>
          </button>
        </div>

        {/* Corporate Notifications & Vacation Panel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-105"
            title="Notificaciones operativas y de vacaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadVacationCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                {unreadVacationCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black dark:bg-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-4 z-50 text-zinc-900 dark:text-zinc-100 animate-fadeIn">
              
              {/* Header & Tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                  Panel de Notificaciones
                </span>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded-full font-bold border border-zinc-200 dark:border-zinc-700">
                  Factoría Bruce
                </span>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center gap-1 my-2.5 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveNotifTab('VACACIONES')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
                    activeNotifTab === 'VACACIONES'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Palmtree className="w-3.5 h-3.5" />
                  <span>Vacaciones ({unreadVacationCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotifTab('RFID')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
                    activeNotifTab === 'RFID'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Accesos ({attendanceLogs.length})</span>
                </button>
              </div>

              {/* VACATION NOTIFICATIONS CONTENT */}
              {activeNotifTab === 'VACACIONES' && (
                <div className="py-1 space-y-2 max-h-72 overflow-y-auto">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                    Avisos normativos de cumplimiento de 1 año de contrato para goce de 30 días de vacaciones.
                  </div>

                  {vacationNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border text-xs transition-all ${
                        notif.read
                          ? 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 opacity-80'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                            <Palmtree className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white leading-tight">
                              {notif.workerName}
                            </p>
                            <span className="text-[10px] text-zinc-500">{notif.workerPosition}</span>
                          </div>
                        </div>

                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(notif.id)}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            title="Marcar como leída"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400">{notif.date}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWorkerForStats(notif.workerId);
                            setCurrentView('effectiveness');
                            setShowNotifications(false);
                          }}
                          className="text-[10px] font-bold text-zinc-900 dark:text-white hover:underline"
                        >
                          Ver ficha de efectividad →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RFID REAL-TIME LOGS CONTENT */}
              {activeNotifTab === 'RFID' && (
                <div className="py-1 space-y-2 max-h-72 overflow-y-auto">
                  {attendanceLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{log.workerName}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {log.scanType} • {log.terminalLocation.split('(')[0]}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-900 dark:text-zinc-100 font-bold shrink-0">
                        {log.timeFormatted}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-zinc-200 dark:border-zinc-800">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Administrador"
            className="w-9 h-9 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shadow-sm"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              Ing. Carlos Mendoza
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              Supervisor General
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
