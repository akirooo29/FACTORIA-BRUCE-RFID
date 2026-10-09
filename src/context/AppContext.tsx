import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Worker,
  AttendanceRecord,
  RequestItem,
  WorkerType,
  AdminRole,
  AdminUser,
  ScanType,
  ScanStatus,
  AttendancePunctuality,
  ThemeMode,
  WorkerMonthlyStats,
  PaperSlipRecord,
  VacationNotification,
} from '../types';
import {
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_REQUESTS,
  INITIAL_PAPER_SLIPS,
  INITIAL_VACATION_NOTIFICATIONS,
  ADMIN_USERS,
  generateMonthlyStats,
} from '../data/mockData';
import { personnelService } from '../services/personnelService';
import { rfidAudio } from '../utils/audio';

interface ScanResult {
  success: boolean;
  message: string;
  worker?: Worker;
  record?: AttendanceRecord;
  status: ScanStatus;
  punctuality?: AttendancePunctuality;
}

interface AppContextType {
  // Autenticación Administrativa & Perfiles
  isAuthenticated: boolean;
  currentUser: string | null;
  adminRole: AdminRole;
  activeAdminUser: AdminUser;
  login: (email: string, role?: AdminRole) => void;
  logout: () => void;
  setAdminRole: (role: AdminRole) => void;

  // Visual Theme (Strictly Light / White)
  theme: ThemeMode;
  toggleTheme: () => void;

  // Datos del Sistema
  workers: Worker[];
  attendanceLogs: AttendanceRecord[];
  requests: RequestItem[];
  paperSlips: PaperSlipRecord[];
  addPaperSlip: (slip: Omit<PaperSlipRecord, 'id' | 'folioNumber' | 'submittedDate'>) => PaperSlipRecord;
  vacationNotifications: VacationNotification[];
  markNotificationRead: (id: string) => void;

  // Navegación & Control de Vistas
  currentView: string;
  setCurrentView: (view: string) => void;
  activeTerminal: string;
  setActiveTerminal: (term: string) => void;
  processRfidScan: (rfidTag: string, scanTypeOverride?: ScanType) => ScanResult;

  // Retrocompatibilidad
  activeUserRole: WorkerType;
  setActiveUserRole: (role: WorkerType) => void;
  
  // Operaciones CRUD de Personal
  addWorker: (worker: Omit<Worker, 'id'>) => Promise<Worker>;
  updateWorker: (id: number, data: Partial<Worker>) => Promise<Worker>;
  deleteWorker: (id: number) => Promise<boolean>;

  addRequest: (req: Omit<RequestItem, 'id' | 'submittedDate'>) => RequestItem;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isAntennaConnected: boolean;
  setIsAntennaConnected: React.Dispatch<React.SetStateAction<boolean>>;
  lastScanResult: ScanResult | null;
  clearLastScan: () => void;
  activeContractorWarningModal: boolean;
  setActiveContractorWarningModal: (show: boolean) => void;
  attemptedRestrictedSection: string | null;
  setAttemptedRestrictedSection: (section: string | null) => void;
  selectedWorkerForStats: number;
  setSelectedWorkerForStats: (workerId: number) => void;
  getWorkerStats: (workerId: number | string) => WorkerMonthlyStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fb_rfid_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('fb_rfid_user') || 'rrhh@grupobruce.com';
  });

  const [adminRole, setAdminRoleState] = useState<AdminRole>(() => {
    const savedRole = localStorage.getItem('fb_rfid_role');
    if (savedRole === 'GERENCIA' || savedRole === 'RRHH') return savedRole;
    const user = localStorage.getItem('fb_rfid_user');
    return user === 'cpunlay@grupobruce.com' ? 'GERENCIA' : 'RRHH';
  });

  // Tema Estrictamente Blanco / Claro (Obligatorio)
  const theme: ThemeMode = 'light';

  useEffect(() => {
    // Forzar siempre modo claro y fondo blanco
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.removeItem('fb_rfid_theme');
  }, []);

  const toggleTheme = () => {
    // Modo oscuro eliminado por requerimiento empresarial
  };

  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [paperSlips, setPaperSlips] = useState<PaperSlipRecord[]>(INITIAL_PAPER_SLIPS);
  const [vacationNotifications, setVacationNotifications] = useState<VacationNotification[]>(INITIAL_VACATION_NOTIFICATIONS);

  // Vista activa inicial según el perfil
  const [currentView, setCurrentView] = useState<string>(() => {
    const savedRole = localStorage.getItem('fb_rfid_role');
    return savedRole === 'GERENCIA' ? 'dashboard_bi' : 'dashboard';
  });

  const [activeTerminal, setActiveTerminal] = useState<string>('Entrada Principal (Torniquete 1)');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAntennaConnected, setIsAntennaConnected] = useState<boolean>(true);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  // Trabajador seleccionado para dashboard de efectividad
  const [selectedWorkerForStats, setSelectedWorkerForStats] = useState<number>(1);

  const [activeContractorWarningModal, setActiveContractorWarningModal] = useState<boolean>(false);
  const [attemptedRestrictedSection, setAttemptedRestrictedSection] = useState<string | null>(null);

  // Rol activo (compatibilidad)
  const [activeUserRole, setActiveUserRole] = useState<WorkerType>('TRABAJADOR_REGULAR');

  const activeAdminUser: AdminUser =
    (currentUser && ADMIN_USERS[currentUser]) ||
    (adminRole === 'GERENCIA' ? ADMIN_USERS['cpunlay@grupobruce.com'] : ADMIN_USERS['rrhh@grupobruce.com']);

  const setAdminRole = (role: AdminRole) => {
    setAdminRoleState(role);
    localStorage.setItem('fb_rfid_role', role);
    if (role === 'GERENCIA') {
      setCurrentUser('cpunlay@grupobruce.com');
      localStorage.setItem('fb_rfid_user', 'cpunlay@grupobruce.com');
      setCurrentView('dashboard_bi');
    } else {
      setCurrentUser('rrhh@grupobruce.com');
      localStorage.setItem('fb_rfid_user', 'rrhh@grupobruce.com');
      setCurrentView('dashboard');
    }
  };

  const login = (email: string, explicitRole?: AdminRole) => {
    const cleanEmail = email.trim().toLowerCase();
    const resolvedRole: AdminRole =
      explicitRole || (cleanEmail === 'cpunlay@grupobruce.com' ? 'GERENCIA' : 'RRHH');

    setIsAuthenticated(true);
    setCurrentUser(cleanEmail);
    setAdminRoleState(resolvedRole);

    localStorage.setItem('fb_rfid_auth', 'true');
    localStorage.setItem('fb_rfid_user', cleanEmail);
    localStorage.setItem('fb_rfid_role', resolvedRole);

    if (resolvedRole === 'GERENCIA') {
      setCurrentView('dashboard_bi');
    } else {
      setCurrentView('dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('fb_rfid_auth');
    localStorage.removeItem('fb_rfid_user');
    localStorage.removeItem('fb_rfid_role');
  };

  const clearLastScan = () => setLastScanResult(null);

  const processRfidScan = (rawTag: string, scanTypeOverride?: ScanType): ScanResult => {
    const cleanTag = rawTag.trim();
    if (!cleanTag) {
      rfidAudio.playError();
      const res: ScanResult = {
        success: false,
        message: 'Código de tarjeta vacío o ilegible.',
        status: 'NO_REGISTRADO',
      };
      setLastScanResult(res);
      return res;
    }

    // Buscar trabajador por RFID, Código o DNI
    const foundWorker = workers.find(
      (w: Worker) =>
        w.rfidTag.toLowerCase() === cleanTag.toLowerCase() ||
        w.code.toLowerCase() === cleanTag.toLowerCase() ||
        w.dni === cleanTag
    );

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateFormatted = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (!foundWorker) {
      rfidAudio.playError();
      const res: ScanResult = {
        success: false,
        message: `Tarjeta "${cleanTag}" no registrada en el padrón de Factoría Bruce. Acceso denegado.`,
        status: 'NO_REGISTRADO',
      };
      setLastScanResult(res);
      return res;
    }

    if (foundWorker.status === 'INACTIVO') {
      rfidAudio.playError();
      const res: ScanResult = {
        success: false,
        message: `El colaborador ${foundWorker.name} se encuentra en estado INACTIVO. Acceso denegado.`,
        worker: foundWorker,
        status: 'DENEGADO',
      };
      setLastScanResult(res);
      return res;
    }

    const lastWorkerLog = attendanceLogs.find((log: AttendanceRecord) => log.workerId === foundWorker.id);
    const scanType: ScanType = scanTypeOverride || (lastWorkerLog && lastWorkerLog.scanType === 'ENTRADA' ? 'SALIDA' : 'ENTRADA');

    // Regla de puntualidad y tolerancia: Entrada ≤ 07:30 AM / Tolerancia hasta 07:35 AM
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    const standardEntryMinutes = 7 * 60 + 30; // 07:30 AM = 450 mins
    const toleranceLimitMinutes = 7 * 60 + 35; // 07:35 AM = 455 mins

    let punctuality: AttendancePunctuality = 'A_TIEMPO';
    let delayMinutes = 0;

    if (scanType === 'ENTRADA') {
      if (currentTotalMinutes <= standardEntryMinutes) {
        punctuality = 'A_TIEMPO';
        delayMinutes = 0;
      } else if (currentTotalMinutes <= toleranceLimitMinutes) {
        punctuality = 'TARDANZA_DESCUENTO';
        delayMinutes = currentTotalMinutes - standardEntryMinutes;
      } else {
        punctuality = 'PUERTA_CERRADA';
        delayMinutes = currentTotalMinutes - standardEntryMinutes;
      }
    }

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      workerId: foundWorker.id,
      workerName: foundWorker.name,
      workerType: foundWorker.type,
      workerPosition: foundWorker.position,
      workerDepartment: foundWorker.department,
      contractorCompany: foundWorker.contractorCompany,
      avatarUrl: foundWorker.avatarUrl,
      rfidTag: foundWorker.rfidTag,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted,
      scanType,
      status: 'AUTORIZADO',
      punctuality,
      delayMinutes,
      terminalId: activeTerminal.split(' ')[0],
      terminalLocation: activeTerminal,
      notes:
        scanType === 'ENTRADA'
          ? punctuality === 'A_TIEMPO'
            ? 'Ingreso puntual a tiempo (≤ 07:30:00 AM)'
            : punctuality === 'TARDANZA_DESCUENTO'
            ? `Tardanza con descuento (+${delayMinutes} min sobre 07:30 AM)`
            : `Puerta cerrada (> 07:35 AM - ${delayMinutes} min). Falta por defecto.`
          : 'Salida de jornada registrada',
    };

    rfidAudio.playSuccess();
    setAttendanceLogs((prev) => [newRecord, ...prev]);

    const punctualityMessage =
      scanType === 'ENTRADA'
        ? punctuality === 'A_TIEMPO'
          ? 'Ingreso Puntual Registrado'
          : `Ingreso Registrado con Tardanza (+${delayMinutes} min)`
        : 'Salida Registrada Correctamente';

    const result: ScanResult = {
      success: true,
      message: `${punctualityMessage} - Pase Autorizado`,
      worker: foundWorker,
      record: newRecord,
      status: 'AUTORIZADO',
      punctuality,
    };

    setLastScanResult(result);
    return result;
  };

  const addWorker = async (workerData: Omit<Worker, 'id'>): Promise<Worker> => {
    const created = await personnelService.create(workerData);
    setWorkers((prev) => [created, ...prev]);
    return created;
  };

  const updateWorker = async (id: number, data: Partial<Worker>): Promise<Worker> => {
    const updated = await personnelService.update(id, data);
    setWorkers((prev) => prev.map((w) => (w.id === id ? updated : w)));
    return updated;
  };

  const deleteWorker = async (id: number): Promise<boolean> => {
    const success = await personnelService.delete(id);
    if (success) {
      setWorkers((prev) => prev.filter((w) => w.id !== id));
      if (selectedWorkerForStats === id) {
        const remaining = workers.filter((w) => w.id !== id);
        if (remaining.length > 0) {
          setSelectedWorkerForStats(remaining[0].id);
        }
      }
    }
    return success;
  };

  const addRequest = (reqData: Omit<RequestItem, 'id' | 'submittedDate'>): RequestItem => {
    const newReq: RequestItem = {
      ...reqData,
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      submittedDate: new Date().toISOString().split('T')[0],
    };
    setRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const addPaperSlip = (
    slipData: Omit<PaperSlipRecord, 'id' | 'folioNumber' | 'submittedDate'>
  ): PaperSlipRecord => {
    const nextFolioNumber = `PAP-2026-${(paperSlips.length + 44).toString().padStart(4, '0')}`;
    const newSlip: PaperSlipRecord = {
      ...slipData,
      id: `SLIP-${Date.now().toString().slice(-4)}`,
      folioNumber: nextFolioNumber,
      submittedDate: new Date().toISOString().split('T')[0],
    };
    setPaperSlips((prev) => [newSlip, ...prev]);
    return newSlip;
  };

  const markNotificationRead = (id: string) => {
    setVacationNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getWorkerStats = (workerId: number | string): WorkerMonthlyStats => {
    return generateMonthlyStats(workerId, workers);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        adminRole,
        activeAdminUser,
        login,
        logout,
        setAdminRole,
        theme,
        toggleTheme,
        workers,
        attendanceLogs,
        requests,
        paperSlips,
        addPaperSlip,
        vacationNotifications,
        markNotificationRead,
        currentView,
        setCurrentView,
        activeTerminal,
        setActiveTerminal,
        processRfidScan,
        activeUserRole,
        setActiveUserRole,
        addWorker,
        updateWorker,
        deleteWorker,
        addRequest,
        sidebarCollapsed,
        setSidebarCollapsed,
        isAntennaConnected,
        setIsAntennaConnected,
        lastScanResult,
        clearLastScan,
        activeContractorWarningModal,
        setActiveContractorWarningModal,
        attemptedRestrictedSection,
        setAttemptedRestrictedSection,
        selectedWorkerForStats,
        setSelectedWorkerForStats,
        getWorkerStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
