import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  Bell,
  Clock,
  LogOut,
  BarChart3,
  Users,
  Shield,
} from 'lucide-react';
import type { AdminRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    adminRole,
    setAdminRole,
    activeAdminUser,
    isAntennaConnected,
    setIsAntennaConnected,
    vacationNotifications,
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

  const unreadCount = vacationNotifications.filter((n) => !n.read).length;

  const handleSwitchRole = (newRole: AdminRole) => {
    setAdminRole(newRole);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Izquierda: Estado de Hardware RFID en Puerta Principal */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsAntennaConnected(!isAntennaConnected)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            isAntennaConnected
              ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
          title="Alternar estado de enlace de antena RFID (Simulación de hardware)"
        >
          {isAntennaConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5 text-slate-700" />
              <span className="font-semibold text-slate-900">Entrada Principal</span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-mono">• RFID UHF Conectado</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Entrada Principal</span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-mono">• Desconectado</span>
            </>
          )}
        </button>

        {/* Badge Institucional */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>Factoría Bruce S.A.</span>
        </div>
      </div>

      {/* Derecha: Conmutador de Entorno (Gerencia BI / RRHH Operativo), Reloj, Notificaciones y Usuario */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Selector Dinámico de Entorno: Gerencia (BI) vs RRHH (Operativo) */}
        <div className="relative">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchRole('GERENCIA')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                adminRole === 'GERENCIA'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cambiar a perspectiva de Gerencia General (Business Intelligence)"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-800" />
              <span>Gerencia (BI)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('RRHH')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                adminRole === 'RRHH'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cambiar a perspectiva de Recursos Humanos (Operativo)"
            >
              <Users className="w-3.5 h-3.5 text-slate-800" />
              <span>RRHH (Operativo)</span>
            </button>
          </div>
        </div>

        {/* Reloj de Planta */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">{currentTime}</span>
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Avisos del Sistema"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Menú Dropdown de Notificaciones */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-lg p-4 text-xs z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900">Avisos del Sistema</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vacationNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{notif.workerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perfil de Usuario & Botón Cerrar Sesión */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {activeAdminUser.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {activeAdminUser.email}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Cerrar sesión del sistema"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline text-[11px]">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
