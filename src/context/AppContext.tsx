import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type {
  Worker,
  WorkerStatus,
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
  LoginResult,
} from '../types';
import {
  INITIAL_REQUESTS,
  INITIAL_VACATION_NOTIFICATIONS,
  ADMIN_USERS,
} from '../data/mockData';
import {
  mapAsistenciaToAttendanceRecord,
  calculateWorkerMonthlyStatsFromSql,
} from '../utils/attendanceStatsCalculator';
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
  login: (email: string, password?: string, role?: AdminRole) => LoginResult;
  logout: () => void;
  setAdminRole: (role: AdminRole) => void;

  // Visual Theme (Strictly Light / White)
  theme: ThemeMode;
  toggleTheme: () => void;

  // Datos del Sistema (Sincronizado con SQL Server)
  workers: Worker[];
  isLoadingWorkers: boolean;
  workersError: string | null;
  loading: boolean;
  error: string | null;
  reloadWorkers: () => Promise<void>;
  fetchWorkers: () => Promise<void>;
  // Asistencias desde SQL Server (http://localhost:5216/api/Asistencias)
  asistencias: any[];
  attendanceLogs: AttendanceRecord[];
  isLoadingAttendances: boolean;
  attendancesError: string | null;
  reloadAttendances: () => Promise<void>;
  fetchAttendances: () => Promise<void>;
  requests: RequestItem[];
  paperSlips: PaperSlipRecord[];
  isLoadingPaperSlips?: boolean;
  paperSlipsError?: string | null;
  fetchPaperSlips?: () => Promise<void>;
  addPaperSlip: (slip: Omit<PaperSlipRecord, 'id' | 'folioNumber' | 'submittedDate'>) => Promise<PaperSlipRecord>;
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
  fetchWorkerAttendances: (workerId: number | string) => Promise<void>;
  getWorkerStats: (workerId: number | string, monthYear?: string) => WorkerMonthlyStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mapeador de datos para normalizar respuestas de SQL Server / ASP.NET Core API
const mapWorkerData = (item: any): Worker => {
  const id = Number(item.id ?? item.Id ?? item.ID ?? 0);
  const rawFechaIngreso =
    item.fecha_ingreso ||
    item.Fecha_Ingreso ||
    item.fechaIngreso ||
    item.FechaIngreso ||
    item.hireDate ||
    item.HireDate;

  // Normalizar fecha a formato YYYY-MM-DD
  let fechaIngreso = new Date().toISOString().split('T')[0];
  if (rawFechaIngreso) {
    fechaIngreso = String(rawFechaIngreso).split('T')[0];
  }

  const rawNombres = item.nombres || item.Nombres || '';
  const rawApellidos = item.apellidos || item.Apellidos || '';
  const combinedName = rawNombres && rawApellidos ? `${rawNombres} ${rawApellidos}`.trim() : (rawNombres || rawApellidos);

  return {
    ...item,
    id,
    code: item.code || item.Code || item.codigo || item.Codigo || `FBR-${id.toString().padStart(4, '0')}`,
    name: item.name || item.Name || combinedName || item.nombre || item.Nombre || 'Colaborador',
    nombres: rawNombres || undefined,
    apellidos: rawApellidos || undefined,
    dni: String(item.dni ?? item.Dni ?? item.DNI ?? ''),
    email: item.email || item.Email || item.correo || item.Correo || '',
    phone: item.phone || item.Phone || item.telefono || item.Telefono || '',
    type: (item.type || item.Type || item.tipo || item.Tipo || 'TRABAJADOR_REGULAR') as WorkerType,
    department: item.department || item.Department || item.departamento || item.Departamento || 'Operaciones & Planta',
    position: item.position || item.Position || item.cargo || item.Cargo || item.puesto || item.Puesto || 'Operario',
    rfidTag: item.rfidTag || item.RfidTag || item.tagRFID || item.TagRFID || item.rfid || item.RFID || '',
    status: (item.status || item.Status || item.estado || item.Estado || 'ACTIVO') as WorkerStatus,
    avatarUrl:
      item.avatarUrl ||
      item.AvatarUrl ||
      item.foto ||
      item.Foto ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    fecha_ingreso: fechaIngreso,
    hireDate: item.hireDate || item.HireDate ? String(item.hireDate || item.HireDate).split('T')[0] : fechaIngreso,
    vacationDaysAvailable:
      item.vacationDaysAvailable ??
      item.VacationDaysAvailable ??
      item.diasVacaciones ??
      item.DiasVacaciones ??
      0,
    scheduleType: item.scheduleType || item.ScheduleType || 'ESTANDAR',
    customSchedule: item.customSchedule || item.CustomSchedule,
    contractorCompany: item.contractorCompany || item.ContractorCompany || item.empresaContratista || item.EmpresaContratista,
    contractExpiry: item.contractExpiry || item.ContractExpiry || item.vencimientoContrato || item.VencimientoContrato,
    sctrStatus: item.sctrStatus || item.SctrStatus,
    projectAssigned: item.projectAssigned || item.ProjectAssigned,
    supervisorName: item.supervisorName || item.SupervisorName,
  };
};

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

  // Estado de Trabajadores obtenido de la Base de Datos SQL Server
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState<boolean>(true);
  const [workersError, setWorkersError] = useState<string | null>(null);

  // Referencia mutable a workers para evitar reconexiones de SignalR y dependencias circulares
  const workersRef = useRef<Worker[]>(workers);
  useEffect(() => {
    workersRef.current = workers;
  }, [workers]);

  // Estado de Asistencias desde la Base de Datos SQL Server
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState<boolean>(true);
  const [attendancesError, setAttendancesError] = useState<string | null>(null);

  // Trabajador seleccionado para dashboard de efectividad
  const [selectedWorkerForStats, setSelectedWorkerForStats] = useState<number>(1);

  // Carga del historial completo de asistencias de un trabajador específico desde SQL Server
  const fetchWorkerAttendances = useCallback(async (workerId: number | string) => {
    if (!workerId) return;
    try {
      const response = await fetch(
        `http://localhost:5216/api/asistencias?trabajadorId=${workerId}`
      );
      if (!response.ok) return;

      const data = await response.json();
      if (Array.isArray(data)) {
        // Mapear registros crudos a AttendanceRecord con valores por defecto seguros
        const mappedRecords: AttendanceRecord[] = data.map((item: any) =>
          item.timeFormatted ? item : mapAsistenciaToAttendanceRecord(item, workersRef.current)
        );

        setAttendanceLogs((prev) => {
          // Mantener marcaciones de otros trabajadores y actualizar con el historial del trabajador seleccionado
          const otherWorkers = prev.filter(
            (rec) =>
              Number(rec.workerId ?? (rec as any).WorkerId ?? (rec as any).trabajadorId) !==
              Number(workerId)
          );
          return [...otherWorkers, ...mappedRecords];
        });
      }
    } catch (err) {
      console.error('Error al consultar http://localhost:5216/api/asistencias:', err);
    }
  }, []);

  // Carga de datos reales desde SQL Server (Web API .NET / REST)
  const fetchWorkers = useCallback(async () => {
    setIsLoadingWorkers(true);
    setWorkersError(null);
    try {
      const response = await fetch('http://localhost:5216/api/Trabajadores');
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const list: Worker[] = Array.isArray(data) ? data.map(mapWorkerData) : [];
      setWorkers(list);

      // Si hay trabajadores, fijar el primero para las estadísticas individuales
      if (list.length > 0) {
        const initialWorkerId = list[0].id;
        setSelectedWorkerForStats(initialWorkerId);
      }
    } catch (err: any) {
      console.error('Error al consultar http://localhost:5216/api/Trabajadores:', err);
      const errorMsg =
        err?.message ||
        'No se pudo conectar con el endpoint de SQL Server en http://localhost:5216/api/Trabajadores.';
      setWorkersError(errorMsg);
    } finally {
      setIsLoadingWorkers(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Carga general de asistencias de toda la planta desde SQL Server (sin filtro de trabajadorId)
  const fetchAttendances = useCallback(async () => {
    setIsLoadingAttendances(true);
    setAttendancesError(null);
    try {
      const response = await fetch('http://localhost:5216/api/asistencias');
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const rawLogs = Array.isArray(data) ? data : [];
      const mappedLogs: AttendanceRecord[] = rawLogs.map((item: any) =>
        item.timeFormatted ? item : mapAsistenciaToAttendanceRecord(item, workersRef.current)
      );

      setAttendanceLogs(mappedLogs);
    } catch (err: any) {
      console.error('Error al consultar http://localhost:5216/api/asistencias:', err);
      const errorMsg =
        err?.message ||
        'No se pudo conectar con el endpoint de Asistencias en SQL Server (http://localhost:5216/api/asistencias).';
      setAttendancesError(errorMsg);
    } finally {
      setIsLoadingAttendances(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // Conexión WebSockets en tiempo real vía SignalR (http://localhost:5216/hubs/attendance)
  useEffect(() => {
    let isCancelled = false;

    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5216/hubs/attendance', {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    // Suscripción al evento ReceiveNewAttendance emitido por C# al detectar un nuevo acceso RFID
    connection.on('ReceiveNewAttendance', (data: any) => {
      console.log('📡 [SignalR WebSockets] Evento ReceiveNewAttendance recibido:', data);

      if (data && workersRef.current.length > 0) {
        try {
          const newRecord = mapAsistenciaToAttendanceRecord(data, workersRef.current);
          setAttendanceLogs((prev) => {
            if (prev.some((p) => p.id === newRecord.id)) return prev;
            return [newRecord, ...prev];
          });
        } catch (e) {
          console.warn('Error al mapear asistencia recibida por SignalR:', e);
        }
      }

      // Re-sincronizar con SQL Server para actualizar todas las estadísticas y tablas
      fetchAttendances();
    });

    const startConnection = async () => {
      try {
        await connection.start();
        if (!isCancelled) {
          console.log('🟢 [SignalR WebSockets] Conectado exitosamente a http://localhost:5216/hubs/attendance');
        } else {
          connection.stop().catch(() => {});
        }
      } catch (err: any) {
        if (!isCancelled) {
          const msg = err?.message || String(err);
          // Ignorar de forma silenciosa si la detención fue durante negociación por ciclo de render
          if (!msg.includes('stopped during negotiation')) {
            console.warn('🟡 [SignalR WebSockets] Hub aún no disponible (reintentando en segundo plano)...');
          }
        }
      }
    };

    startConnection();

    return () => {
      isCancelled = true;
      // Detener limpiamente sin emitir error durante la negociación
      connection.stop().catch(() => {});
    };
  }, [fetchAttendances]);

  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  // Estado de Papeletas desde SQL Server (http://localhost:5216/api/Papeletas)
  const [paperSlips, setPaperSlips] = useState<PaperSlipRecord[]>([]);
  const [isLoadingPaperSlips, setIsLoadingPaperSlips] = useState<boolean>(true);
  const [paperSlipsError, setPaperSlipsError] = useState<string | null>(null);

  // Carga de papeletas oficiales desde el endpoint en C# ASP.NET Core
  const fetchPaperSlips = useCallback(async () => {
    setIsLoadingPaperSlips(true);
    setPaperSlipsError(null);
    try {
      const response = await fetch('http://localhost:5216/api/Papeletas');
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setPaperSlips(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error al consultar http://localhost:5216/api/Papeletas:', err);
      const errorMsg =
        err?.message ||
        'No se pudo conectar con el endpoint de Papeletas en http://localhost:5216/api/Papeletas.';
      setPaperSlipsError(errorMsg);
    } finally {
      setIsLoadingPaperSlips(false);
    }
  }, []);

  // Cargar las papeletas al iniciar la aplicación
  useEffect(() => {
    fetchPaperSlips();
  }, [fetchPaperSlips]);
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

  // Sincronizar asistencias cuando cambie el trabajador seleccionado
  useEffect(() => {
    if (selectedWorkerForStats) {
      fetchWorkerAttendances(selectedWorkerForStats);
    }
  }, [selectedWorkerForStats, fetchWorkerAttendances]);

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

  const login = (email: string, password?: string, explicitRole?: AdminRole): LoginResult => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    let matchedUser: AdminUser | null = null;

    // Reglas estrictas de autenticación corporativa
    if (cleanEmail === 'cpunlay@grupobruce.com' && cleanPassword === '12345CPunLay') {
      matchedUser = {
        email: 'cpunlay@grupobruce.com',
        name: 'Carlos Pun Lay',
        role: 'GERENCIA',
        title: 'Gerente General & Operaciones',
        department: 'Gerencia General',
      };
    } else if (cleanEmail === 'rrhh@grupobruce.com' && cleanPassword === '12345RRHH') {
      matchedUser = {
        email: 'rrhh@grupobruce.com',
        name: 'Mesías Mariños',
        role: 'RRHH',
        title: 'Jefe de Gestión Humana & Bienestar',
        department: 'Recursos Humanos',
      };
    }

    if (!matchedUser) {
      setIsAuthenticated(false);
      return {
        success: false,
        message: 'Credenciales incorrectas',
      };
    }

    const resolvedRole: AdminRole = explicitRole || matchedUser.role;

    setIsAuthenticated(true);
    setCurrentUser(matchedUser.email);
    setAdminRoleState(resolvedRole);

    localStorage.setItem('fb_rfid_auth', 'true');
    localStorage.setItem('fb_rfid_user', matchedUser.email);
    localStorage.setItem('fb_rfid_role', resolvedRole);

    if (resolvedRole === 'GERENCIA') {
      setCurrentView('dashboard_bi');
    } else {
      setCurrentView('dashboard');
    }

    return {
      success: true,
      user: matchedUser,
    };
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
    // Extirpación Financiera: Garantizar que no se envíe baseSalary a C#
    const { baseSalary, ...cleanPayload } = workerData as any;
    try {
      const response = await fetch('http://localhost:5216/api/Trabajadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload),
      });
      if (response.ok) {
        const result = await response.json();
        const created = mapWorkerData(result);
        setWorkers((prev) => [created, ...prev]);
        return created;
      }
    } catch (error) {
      console.warn('Error al persistir en API SQL Server, usando servicio en memoria como fallback:', error);
    }
    const created = await personnelService.create(cleanPayload);
    setWorkers((prev) => [created, ...prev]);
    return created;
  };

  const updateWorker = async (id: number, data: Partial<Worker>): Promise<Worker> => {
    // Extirpación Financiera: Garantizar que no se envíe baseSalary a C#
    const { baseSalary, ...cleanData } = data as any;
    try {
      const response = await fetch(`http://localhost:5216/api/Trabajadores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });
      if (response.ok) {
        let updated: Worker;
        try {
          const result = await response.json();
          updated = mapWorkerData(result);
        } catch {
          const current = workers.find((w) => w.id === id);
          updated = mapWorkerData({ ...current, ...cleanData, id });
        }
        setWorkers((prev) => prev.map((w) => (w.id === id ? updated : w)));
        return updated;
      }
    } catch (error) {
      console.warn('Error al actualizar en API SQL Server, usando servicio en memoria como fallback:', error);
    }
    const updated = await personnelService.update(id, cleanData);
    setWorkers((prev) => prev.map((w) => (w.id === id ? updated : w)));
    return updated;
  };

  const deleteWorker = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:5216/api/Trabajadores/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWorkers((prev) => prev.filter((w) => w.id !== id));
        if (selectedWorkerForStats === id) {
          const remaining = workers.filter((w) => w.id !== id);
          if (remaining.length > 0) {
            setSelectedWorkerForStats(remaining[0].id);
          }
        }
        return true;
      }
    } catch (error) {
      console.warn('Error al eliminar en API SQL Server, usando servicio en memoria como fallback:', error);
    }
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

  const addPaperSlip = async (
    slipData: Omit<PaperSlipRecord, 'id' | 'folioNumber' | 'submittedDate'>
  ): Promise<PaperSlipRecord> => {
    const nextFolioNumber = `PAP-2026-${(paperSlips.length + 44).toString().padStart(4, '0')}`;
    const submittedDate = new Date().toISOString().split('T')[0];
    const generatedId = `SLIP-${Date.now().toString().slice(-4)}`;

    const newSlip: PaperSlipRecord = {
      ...slipData,
      id: generatedId,
      folioNumber: nextFolioNumber,
      submittedDate,
    };

    try {
      const response = await fetch('http://localhost:5216/api/Papeletas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlip),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
      }

      // Procesar respuesta del servidor si retorna la entidad persistida
      let createdSlip: PaperSlipRecord = newSlip;
      try {
        const data = await response.json();
        if (data && typeof data === 'object') {
          createdSlip = { ...newSlip, ...data };
        }
      } catch {
        // En caso de 200/204 OK sin body JSON
      }

      // Actualizar el estado sumando la nueva papeleta
      setPaperSlips((prev) => [createdSlip, ...prev]);

      // Re-sincronizar con SQL Server para asegurar correlativos y persistencia
      fetchPaperSlips();
      return createdSlip;
    } catch (error) {
      console.error('Error al registrar papeleta en http://localhost:5216/api/Papeletas:', error);
      // Fallback local en memoria para no interrumpir la experiencia de usuario
      setPaperSlips((prev) => [newSlip, ...prev]);
      return newSlip;
    }
  };

  const markNotificationRead = (id: string) => {
    setVacationNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Cálculo de estadísticas de asistencia, tardanzas y faltas basado exclusivamente en la data real de SQL Server
  const getWorkerStats = useCallback(
    (workerId: number | string, monthYear?: string): WorkerMonthlyStats => {
      return calculateWorkerMonthlyStatsFromSql(
        workerId,
        workers,
        attendanceLogs,
        paperSlips,
        monthYear
      );
    },
    [workers, attendanceLogs, paperSlips]
  );

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
        isLoadingWorkers,
        workersError,
        loading: isLoadingWorkers,
        error: workersError,
        reloadWorkers: fetchWorkers,
        fetchWorkers,
        asistencias: attendanceLogs,
        attendanceLogs,
        isLoadingAttendances,
        attendancesError,
        reloadAttendances: fetchAttendances,
        fetchAttendances,
        requests,
        paperSlips,
        isLoadingPaperSlips,
        paperSlipsError,
        fetchPaperSlips,
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
        fetchWorkerAttendances,
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
