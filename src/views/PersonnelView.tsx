import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import type { Worker, WorkerType } from '../types';
import {
  calculateWorkedDays,
  evaluateWorkerVacation,
} from '../utils/vacationCalculator';
import {
  CustomScheduleEditor,
  calculateWeeklyTotalHours,
} from '../components/personnel/CustomScheduleEditor';
import { DEFAULT_PRACTICANTE_SCHEDULE } from '../data/mockData';
import {
  Users,
  Search,
  UserPlus,
  HardHat,
  X,
  Gauge,
  Pencil,
  Trash2,
  AlertTriangle,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Calculator,
} from 'lucide-react';

export const PersonnelView: React.FC = () => {
  const {
    workers,
    addWorker,
    updateWorker,
    deleteWorker,
    setSelectedWorkerForStats,
    setCurrentView,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | WorkerType>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [showConfidentialSalaries, setShowConfidentialSalaries] = useState<boolean>(false);

  // Modales
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Toggle de visibilidad de sueldo dentro de modales
  const [showSalaryInModal, setShowSalaryInModal] = useState<boolean>(false);

  // Estado para el formulario de Nuevo Colaborador
  const [newWorker, setNewWorker] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    type: 'TRABAJADOR_REGULAR' as WorkerType,
    department: 'Operaciones & Planta',
    position: '',
    rfidTag: 'RFID-100201',
    status: 'ACTIVO' as Worker['status'],
    baseSalary: 3500,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    contractorCompany: '',
    contractExpiry: '2026-12-31',
    sctrStatus: 'VIGENTE' as 'VIGENTE' | 'POR_VENCER' | 'VENCIDO',
    projectAssigned: '',
    scheduleType: 'ESTANDAR' as 'ESTANDAR' | 'PERSONALIZADO',
    customSchedule: DEFAULT_PRACTICANTE_SCHEDULE,
  });

  // Estado temporal para edición
  const [editForm, setEditForm] = useState<Partial<Worker>>({});

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const departments = Array.from(new Set(workers.map((w: Worker) => w.department)));

  const filteredWorkers = workers.filter((w: Worker) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      w.name.toLowerCase().includes(q) ||
      w.dni.includes(q) ||
      w.rfidTag.toLowerCase().includes(q) ||
      String(w.id).includes(q) ||
      (w.contractorCompany && w.contractorCompany.toLowerCase().includes(q));

    const matchesType =
      typeFilter === 'ALL' ||
      w.type === typeFilter ||
      (typeFilter === 'TRABAJADOR_REGULAR' && w.type === 'EMPLEADO_INTERNO');

    const matchesDept = departmentFilter === 'ALL' || w.department === departmentFilter;

    return matchesSearch && matchesType && matchesDept;
  });

  // Handlers CRUD
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.dni || !newWorker.position) return;

    const fechaIngresoFinal = newWorker.fecha_ingreso || new Date().toISOString().split('T')[0];
    const daysEmployed = calculateWorkedDays(fechaIngresoFinal);
    const vacationDays = newWorker.type === 'TRABAJADOR_REGULAR' && daysEmployed >= 365 ? 30 : 0;

    let codePrefix = 'FBR';
    if (newWorker.type === 'CONTRATISTA') codePrefix = 'CNT';
    if (newWorker.type === 'PRACTICANTE') codePrefix = 'PRC';

    await addWorker({
      code: `${codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newWorker.name,
      dni: newWorker.dni,
      email: newWorker.email || `${newWorker.name.toLowerCase().replace(/\s+/g, '.')}@factoriabruce.com`,
      phone: newWorker.phone || '+51 900 000 000',
      type: newWorker.type,
      department: newWorker.department,
      position: newWorker.position,
      rfidTag: newWorker.rfidTag,
      status: 'ACTIVO',
      avatarUrl: newWorker.avatarUrl,
      baseSalary: newWorker.baseSalary ? Number(newWorker.baseSalary) : undefined,
      fecha_ingreso: fechaIngresoFinal,
      hireDate: fechaIngresoFinal,
      vacationDaysAvailable: vacationDays,
      scheduleType: newWorker.type === 'PRACTICANTE' ? 'PERSONALIZADO' : 'ESTANDAR',
      customSchedule: newWorker.type === 'PRACTICANTE' ? newWorker.customSchedule : undefined,
      contractorCompany: newWorker.type === 'CONTRATISTA' ? newWorker.contractorCompany : undefined,
      contractExpiry: newWorker.type === 'CONTRATISTA' ? newWorker.contractExpiry : undefined,
      sctrStatus: newWorker.type === 'CONTRATISTA' ? newWorker.sctrStatus : undefined,
      projectAssigned: newWorker.type === 'CONTRATISTA' ? newWorker.projectAssigned : undefined,
    });

    setShowAddModal(false);
    showToast(`Colaborador ${newWorker.name} registrado con éxito.`);
    // Reset
    setNewWorker({
      name: '',
      dni: '',
      email: '',
      phone: '',
      type: 'TRABAJADOR_REGULAR',
      department: 'Operaciones & Planta',
      position: '',
      rfidTag: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'ACTIVO',
      baseSalary: 3500,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      contractorCompany: '',
      contractExpiry: '2026-12-31',
      sctrStatus: 'VIGENTE',
      projectAssigned: '',
      scheduleType: 'ESTANDAR',
      customSchedule: DEFAULT_PRACTICANTE_SCHEDULE,
    });
  };

  const handleOpenEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setEditForm({
      ...worker,
      customSchedule: worker.customSchedule || DEFAULT_PRACTICANTE_SCHEDULE,
    });
    setShowSalaryInModal(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    await updateWorker(editingWorker.id, {
      ...editForm,
      scheduleType: editForm.type === 'PRACTICANTE' ? 'PERSONALIZADO' : 'ESTANDAR',
    });

    setEditingWorker(null);
    showToast(`Datos de ${editForm.name} actualizados correctamente.`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingWorker) return;
    await deleteWorker(deletingWorker.id);
    setDeletingWorker(null);
    showToast(`Colaborador ${deletingWorker.name} eliminado de la base de datos.`);
  };

  const handleInspectEffectiveness = (workerId: number) => {
    setSelectedWorkerForStats(workerId);
    setCurrentView('effectiveness');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{notificationMsg}</span>
        </div>
      )}

      {/* Header Corporativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Padrón General de Personal & Gestión de Horarios
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Administración de Trabajadores Regulares, Contratistas y Practicantes con vinculación RFID UHF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle de Visualización de Sueldos Confidenciales */}
          <button
            type="button"
            onClick={() => setShowConfidentialSalaries(!showConfidentialSalaries)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              showConfidentialSalaries
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Mostrar u ocultar los sueldos base para cálculo de BI"
          >
            {showConfidentialSalaries ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showConfidentialSalaries ? 'Ocultar Sueldos Base' : 'Mostrar Sueldos Base'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAddModal(true);
              setShowSalaryInModal(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Colaborador</span>
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, DNI, código RFID o cargo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Filtro por Tipo de Personal */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="TRABAJADOR_REGULAR">Trabajador (Regular)</option>
              <option value="CONTRATISTA">Contratista</option>
              <option value="PRACTICANTE">Practicante</option>
            </select>
          </div>

          {/* Filtro por Departamento */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Área:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">Todas las Áreas</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen de Conteo */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Mostrando <strong>{filteredWorkers.length}</strong> de <strong>{workers.length}</strong> colaboradores registrados</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-slate-800"></span> Regulares: {workers.filter(w => w.type === 'TRABAJADOR_REGULAR' || w.type === 'EMPLEADO_INTERNO').length}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span> Contratistas: {workers.filter(w => w.type === 'CONTRATISTA').length}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Practicantes: {workers.filter(w => w.type === 'PRACTICANTE').length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Colaboradores */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-3">DNI / Código</th>
                <th className="py-3 px-3">Tipo & Condición</th>
                <th className="py-3 px-3">Área / Posición</th>
                <th className="py-3 px-3">Régimen Horario</th>
                {showConfidentialSalaries && (
                  <th className="py-3 px-3 text-right">Sueldo Base (BI)</th>
                )}
                <th className="py-3 px-3">Tag RFID</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredWorkers.map((worker) => {
                const isPracticante = worker.type === 'PRACTICANTE';
                const isContratista = worker.type === 'CONTRATISTA';
                const isRegular = worker.type === 'TRABAJADOR_REGULAR' || worker.type === 'EMPLEADO_INTERNO';

                // Costo por minuto (Fórmula: Sueldo / 8h / 60min)
                const costPerMinute = worker.baseSalary
                  ? Math.round(((worker.baseSalary / 30) / (8 * 60)) * 1000) / 1000
                  : null;

                return (
                  <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Nombre y Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.avatarUrl}
                          alt={worker.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedWorker(worker)}
                            className="font-bold text-slate-900 hover:underline text-left cursor-pointer truncate block"
                          >
                            {worker.name}
                          </button>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {worker.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DNI y Código */}
                    <td className="py-3 px-3 font-mono text-slate-700">
                      <div>{worker.dni}</div>
                      <div className="text-[10px] text-slate-400">{worker.code}</div>
                    </td>

                    {/* Tipo & Badge */}
                    <td className="py-3 px-3">
                      <Badge value={worker.type} size="sm" />
                      {isContratista && worker.contractorCompany && (
                        <span className="block text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5">
                          {worker.contractorCompany}
                        </span>
                      )}
                    </td>

                    {/* Área / Posición */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{worker.position}</div>
                      <div className="text-[11px] text-slate-500">{worker.department}</div>
                    </td>

                    {/* Régimen Horario */}
                    <td className="py-3 px-3">
                      {isRegular && (
                        <div className="text-[11px] text-slate-700">
                          <span className="font-semibold block">Horario Estándar</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            L-V: 16:30 | Sáb: 13:00
                          </span>
                        </div>
                      )}

                      {isContratista && (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold block">Turno Proveedor</span>
                          <span className="text-[10px] text-slate-500">
                            Póliza: {worker.sctrStatus || 'VIGENTE'}
                          </span>
                        </div>
                      )}

                      {isPracticante && (
                        <div className="text-[11px] text-blue-900">
                          <span className="font-semibold block flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            Personalizado
                          </span>
                          <span className="text-[10px] text-blue-700 font-mono">
                            {worker.customSchedule
                              ? `${calculateWeeklyTotalHours(worker.customSchedule)} hrs / sem`
                              : 'Por definir'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Sueldo Base Opcional (Confidencial BI) */}
                    {showConfidentialSalaries && (
                      <td className="py-3 px-3 text-right font-mono">
                        {worker.baseSalary ? (
                          <div>
                            <span className="font-bold text-slate-900">
                              S/. {worker.baseSalary.toLocaleString('es-PE')}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              S/. {costPerMinute}/min
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No asignado</span>
                        )}
                      </td>
                    )}

                    {/* RFID Tag */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                        {worker.rfidTag}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleInspectEffectiveness(worker.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Ver KPIs de Efectividad"
                        >
                          <Gauge className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(worker)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Editar Colaborador"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingWorker(worker)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Eliminar Colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTRAR NUEVO COLABORADOR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-xl p-6 text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registrar Nuevo Colaborador
                  </h3>
                  <p className="text-xs text-slate-500">
                    Definición de tipo, horarios corporativos y asignación de credencial RFID.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4 text-xs">
              {/* Select con las tres opciones requeridas */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold">
                  Tipo de Colaborador (Condición Laboral): *
                </label>
                <select
                  value={newWorker.type}
                  onChange={(e) => {
                    const selected = e.target.value as WorkerType;
                    setNewWorker({
                      ...newWorker,
                      type: selected,
                      scheduleType: selected === 'PRACTICANTE' ? 'PERSONALIZADO' : 'ESTANDAR',
                    });
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
                >
                  <option value="TRABAJADOR_REGULAR">Trabajador (Regular)</option>
                  <option value="CONTRATISTA">Contratista</option>
                  <option value="PRACTICANTE">Practicante</option>
                </select>
              </div>

              {/* LÓGICA CONDICIONAL DE HORARIOS Y BENEFICIOS */}

              {/* 1. Trabajador Regular -> Horario Estándar */}
              {newWorker.type === 'TRABAJADOR_REGULAR' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span>Horario Estándar de Planta (Factoría Bruce)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    • <strong>Lunes a Viernes:</strong> Salida a las <strong>16:30 hrs</strong> (Jornada diaria reglamentaria).
                  </p>
                  <p className="text-[11px] text-slate-600">
                    • <strong>Sábados:</strong> Salida a las <strong>13:00 hrs</strong> (Media jornada operativa).
                  </p>
                </div>
              )}

              {/* 2. Contratista -> Datos de la empresa proveedora */}
              {newWorker.type === 'CONTRATISTA' && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                    <HardHat className="w-4 h-4 text-amber-700" />
                    <span>Régimen Especial Contratista Externo</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    * No aplica asignación de vacaciones ni descansos médicos corporativos con cargo a Factoría Bruce S.A.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Empresa Contratista: *</label>
                      <input
                        type="text"
                        required
                        value={newWorker.contractorCompany}
                        onChange={(e) => setNewWorker({ ...newWorker, contractorCompany: e.target.value })}
                        placeholder="Ej. Electromecánica del Norte S.A.C."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Vencimiento de Contrato: *</label>
                      <input
                        type="date"
                        required
                        value={newWorker.contractExpiry}
                        onChange={(e) => setNewWorker({ ...newWorker, contractExpiry: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Practicante -> Submódulo de Horario Personalizado */}
              {newWorker.type === 'PRACTICANTE' && (
                <CustomScheduleEditor
                  schedule={newWorker.customSchedule}
                  onChange={(updated) => setNewWorker({ ...newWorker, customSchedule: updated })}
                />
              )}

              {/* Datos Generales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Nombre Completo: *</label>
                  <input
                    type="text"
                    required
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    placeholder="Ej. Martín Ramos Quispe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">DNI (8 dígitos): *</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={newWorker.dni}
                    onChange={(e) => setNewWorker({ ...newWorker, dni: e.target.value })}
                    placeholder="72819230"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tag Tarjeta RFID UHF: *</label>
                  <input
                    type="text"
                    required
                    value={newWorker.rfidTag}
                    onChange={(e) => setNewWorker({ ...newWorker, rfidTag: e.target.value })}
                    placeholder="RFID-100201"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Cargo / Posición: *</label>
                  <input
                    type="text"
                    required
                    value={newWorker.position}
                    onChange={(e) => setNewWorker({ ...newWorker, position: e.target.value })}
                    placeholder="Técnico CNC / Practicante Mecánico"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Departamento / Área: *</label>
                  <select
                    value={newWorker.department}
                    onChange={(e) => setNewWorker({ ...newWorker, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="Operaciones & Planta">Operaciones & Planta</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Mantenimiento & Torno">Mantenimiento & Torno</option>
                    <option value="Control de Calidad">Control de Calidad</option>
                    <option value="Seguridad y Medio Ambiente (HSE)">Seguridad y Medio Ambiente (HSE)</option>
                    <option value="Tecnología & Redes">Tecnología & Redes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Fecha de Ingreso: *</label>
                  <input
                    type="date"
                    required
                    value={newWorker.fecha_ingreso}
                    onChange={(e) => setNewWorker({ ...newWorker, fecha_ingreso: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                {/* CAMPO OPCIONAL: SUELDO BASE (OCULTO POR DEFECTO PARA CÁLCULO DE BI) */}
                <div className="space-y-1 sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-slate-600" />
                      <span>Sueldo Base Mensual (Opcional - Business Intelligence)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSalaryInModal(!showSalaryInModal)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showSalaryInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSalaryInModal ? 'Ocultar' : 'Ver Sueldo'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2">
                    Dato confidencial utilizado estrictamente en el módulo de BI para calcular el impacto económico: <strong>(Sueldo / 8h / 60min = costo por minuto de tardanza)</strong>.
                  </p>

                  <div className="relative">
                    <input
                      type={showSalaryInModal ? 'number' : 'password'}
                      min="1025"
                      step="50"
                      value={newWorker.baseSalary || ''}
                      onChange={(e) => setNewWorker({ ...newWorker, baseSalary: Number(e.target.value) })}
                      placeholder="Ej. 3500.00"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  {newWorker.baseSalary && showSalaryInModal && (
                    <div className="mt-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 flex justify-between">
                      <span>Costo referencial por minuto:</span>
                      <strong className="text-slate-900">
                        S/. {Math.round(((newWorker.baseSalary / 30) / (8 * 60)) * 1000) / 1000} / min
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR COLABORADOR */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-xl p-6 text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                  <Pencil className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Modificar Ficha de {editingWorker.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Actualización de horarios, tipo de vinculación y parámetros salariales.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Select Tipo */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold">
                  Tipo de Colaborador: *
                </label>
                <select
                  value={editForm.type || 'TRABAJADOR_REGULAR'}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as WorkerType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
                >
                  <option value="TRABAJADOR_REGULAR">Trabajador (Regular)</option>
                  <option value="CONTRATISTA">Contratista</option>
                  <option value="PRACTICANTE">Practicante</option>
                </select>
              </div>

              {/* Lógica condicional de horario en edición */}
              {editForm.type === 'PRACTICANTE' && (
                <CustomScheduleEditor
                  schedule={editForm.customSchedule || DEFAULT_PRACTICANTE_SCHEDULE}
                  onChange={(updated) => setEditForm({ ...editForm, customSchedule: updated })}
                />
              )}

              {editForm.type === 'CONTRATISTA' && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                    <HardHat className="w-4 h-4 text-amber-700" />
                    <span>Datos del Proveedor Contratista</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Empresa Contratista:</label>
                      <input
                        type="text"
                        value={editForm.contractorCompany || ''}
                        onChange={(e) => setEditForm({ ...editForm, contractorCompany: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Vencimiento de Contrato:</label>
                      <input
                        type="date"
                        value={editForm.contractExpiry || ''}
                        onChange={(e) => setEditForm({ ...editForm, contractExpiry: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos generales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">DNI / Documento:</label>
                  <input
                    type="text"
                    required
                    value={editForm.dni || ''}
                    onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tag Tarjeta RFID:</label>
                  <input
                    type="text"
                    required
                    value={editForm.rfidTag || ''}
                    onChange={(e) => setEditForm({ ...editForm, rfidTag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Cargo / Posición:</label>
                  <input
                    type="text"
                    required
                    value={editForm.position || ''}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Departamento:</label>
                  <select
                    value={editForm.department || 'Operaciones & Planta'}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Operaciones & Planta">Operaciones & Planta</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Mantenimiento & Torno">Mantenimiento & Torno</option>
                    <option value="Control de Calidad">Control de Calidad</option>
                    <option value="Seguridad y Medio Ambiente (HSE)">Seguridad y Medio Ambiente (HSE)</option>
                    <option value="Tecnología & Redes">Tecnología & Redes</option>
                  </select>
                </div>

                {/* Sueldo Base Oculto en Edición */}
                <div className="sm:col-span-2 space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-slate-600" />
                      <span>Sueldo Base Mensual (Confidencial BI)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSalaryInModal(!showSalaryInModal)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showSalaryInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSalaryInModal ? 'Ocultar' : 'Ver Sueldo'}</span>
                    </button>
                  </div>

                  <input
                    type={showSalaryInModal ? 'number' : 'password'}
                    value={editForm.baseSalary || ''}
                    onChange={(e) => setEditForm({ ...editForm, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FICHA DETALLADA DEL COLABORADOR */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-2xl shadow-xl p-6 text-slate-900">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorker.avatarUrl}
                  alt={selectedWorker.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedWorker.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID #{selectedWorker.id} • DNI: {selectedWorker.dni}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge value={selectedWorker.type} size="sm" />
                    <Badge value={selectedWorker.status} size="sm" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold">Cargo:</span>
                  <span className="font-bold text-slate-900">{selectedWorker.position}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold">Departamento:</span>
                  <span className="font-bold text-slate-900">{selectedWorker.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold">Credencial RFID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedWorker.rfidTag}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold">Fecha de Ingreso:</span>
                  <span className="font-mono text-slate-900">{selectedWorker.fecha_ingreso}</span>
                </div>
              </div>

              {/* Detalle de Horario según Tipo */}
              {selectedWorker.type === 'PRACTICANTE' && selectedWorker.customSchedule && (
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-blue-900 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-700" />
                      Horario Semanal de Prácticas
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
                      {calculateWeeklyTotalHours(selectedWorker.customSchedule)} hrs / semana
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {Object.entries(selectedWorker.customSchedule).map(([day, config]) => (
                      <div
                        key={day}
                        className={`p-1.5 rounded border text-center ${
                          config.enabled ? 'bg-white border-blue-200 text-slate-900 font-medium' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <span className="block text-[10px] font-bold">{day.slice(0, 3)}</span>
                        {config.enabled ? (
                          <span className="font-mono text-[10px]">{config.startTime} - {config.endTime}</span>
                        ) : (
                          <span className="text-[10px]">Libre</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vacaciones según regla legal 365 días para trabajadores regulares */}
              {(selectedWorker.type === 'TRABAJADOR_REGULAR' || selectedWorker.type === 'EMPLEADO_INTERNO') && (
                (() => {
                  const vac = evaluateWorkerVacation(selectedWorker);
                  return (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          Habilitación Vacacional (Regla Legal 365 días)
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${vac.badgeColorClass}`}>
                          {vac.statusLabel}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Días Computados:</span>
                          <span className="font-mono font-medium">{vac.daysEmployed} de 365 días</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Vacaciones Disponibles:</span>
                          <span className="font-bold text-slate-900">{vac.displaySummary}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Proveedor Contratista */}
              {selectedWorker.type === 'CONTRATISTA' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-800 block text-xs">Datos del Proveedor Contratista</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Empresa:</span>
                      <span className="font-medium text-slate-900">{selectedWorker.contractorCompany}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Póliza SCTR:</span>
                      <Badge value={selectedWorker.sctrStatus || 'VIGENTE'} size="sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleInspectEffectiveness(selectedWorker.id);
                  setSelectedWorker(null);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Ver Efectividad KPIs</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMACIÓN DE ELIMINACIÓN */}
      {deletingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-xl p-6 text-slate-900">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Confirmar Eliminación de Colaborador
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  ¿Está seguro de eliminar a <strong>{deletingWorker.name}</strong> (DNI: <strong>{deletingWorker.dni}</strong>)?
                </p>
                <p className="text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 text-[11px] mt-2">
                  Esta acción desvinculará de forma permanente su credencial RFID <strong>{deletingWorker.rfidTag}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDeletingWorker(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
