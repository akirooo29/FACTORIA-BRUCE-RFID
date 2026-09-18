import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Worker,
  AttendanceRecord,
  RequestItem,
  WorkerType,
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
  generateMonthlyStats,
} from '../data/mockData';
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
  theme: ThemeMode;
  toggleTheme: () => void;
  workers: Worker[];
  attendanceLogs: AttendanceRecord[];
  requests: RequestItem[];
  paperSlips: PaperSlipRecord[];
  addPaperSlip: (slip: Omit<PaperSlipRecord, 'id' | 'folioNumber' | 'submittedDate'>) => PaperSlipRecord;
  vacationNotifications: VacationNotification[];
  markNotificationRead: (id: string) => void;
  activeUserRole: WorkerType;
  setActiveUserRole: (role: WorkerType) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  activeTerminal: string;
  setActiveTerminal: (term: string) => void;
  processRfidScan: (rfidTag: string, scanTypeOverride?: ScanType) => ScanResult;
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorkerStatus: (id: string, status: Worker['status']) => void;
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
  selectedWorkerForStats: string;
  setSelectedWorkerForStats: (workerId: string) => void;
  getWorkerStats: (workerId: string) => WorkerMonthlyStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: Default 'light'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('fb_rfid_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [paperSlips, setPaperSlips] = useState<PaperSlipRecord[]>(INITIAL_PAPER_SLIPS);
  const [vacationNotifications, setVacationNotifications] = useState<VacationNotification[]>(INITIAL_VACATION_NOTIFICATIONS);
  
  // Active session perspective: Internal Employee vs Contractor
  const [activeUserRole, setActiveUserRole] = useState<WorkerType>('EMPLEADO_INTERNO');
  
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeTerminal, setActiveTerminal] = useState<string>('TRM-01 (Puerta Principal - Torniquete A)');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAntennaConnected, setIsAntennaConnected] = useState<boolean>(true);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  // Selected worker for individual effectiveness dashboard
  const [selectedWorkerForStats, setSelectedWorkerForStats] = useState<string>('W-001');

  // Modal alert when contractor tries to access restricted internal benefits
  const [activeContractorWarningModal, setActiveContractorWarningModal] = useState<boolean>(false);
  const [attemptedRestrictedSection, setAttemptedRestrictedSection] = useState<string | null>(null);

  // Sync theme with HTML document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('fb_rfid_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
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

    // Search worker by RFID tag, Code, or DNI
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

    if (foundWorker.status === 'BLOQUEADO' || foundWorker.status === 'INACTIVO') {
      rfidAudio.playError();
      const res: ScanResult = {
        success: false,
        message: `El colaborador ${foundWorker.name} se encuentra en estado ${foundWorker.status}. Pase de seguridad bloqueado.`,
        worker: foundWorker,
        status: 'DENEGADO',
      };
      setLastScanResult(res);
      return res;
    }

    // Automatic toggle or override for scan type
    const lastWorkerLog = attendanceLogs.find((log: AttendanceRecord) => log.workerId === foundWorker.id);
    const scanType: ScanType = scanTypeOverride || (lastWorkerLog && lastWorkerLog.scanType === 'ENTRADA' ? 'SALIDA' : 'ENTRADA');

    // Calculate Punctuality for ENTRADA based on 7:30 AM / 7:35 AM rules:
    // - ≤ 07:30:00 AM: A_TIEMPO
    // - 07:30:01 - 07:35:00 AM: TARDANZA_DESCUENTO (computable discount)
    // - > 07:35:00 AM: PUERTA_CERRADA (Falta por defecto; requiere autorización exclusiva)
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

    // Audio feedback
    rfidAudio.playSuccess();

    // Prepend new attendance record
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

  const addWorker = (workerData: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...workerData,
      id: `W-${(workers.length + 1).toString().padStart(3, '0')}`,
    };
    setWorkers((prev) => [newWorker, ...prev]);
  };

  const updateWorkerStatus = (id: string, status: Worker['status']) => {
    setWorkers((prev) => prev.map((w: Worker) => (w.id === id ? { ...w, status } : w)));
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

  const getWorkerStats = (workerId: string): WorkerMonthlyStats => {
    return generateMonthlyStats(workerId, workers);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        workers,
        attendanceLogs,
        requests,
        paperSlips,
        addPaperSlip,
        vacationNotifications,
        markNotificationRead,
        activeUserRole,
        setActiveUserRole,
        currentView,
        setCurrentView,
        activeTerminal,
        setActiveTerminal,
        processRfidScan,
        addWorker,
        updateWorkerStatus,
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
