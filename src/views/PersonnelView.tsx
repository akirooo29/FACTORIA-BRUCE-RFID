import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import type { Worker, WorkerType } from '../types';
import {
  calculateWorkedDays,
  evaluateWorkerVacation,
} from '../utils/vacationCalculator';
import {
  Users,
  Search,
  UserPlus,
  HardHat,
  UserCheck,
  X,
  Gauge,
  Pencil,
  Trash2,
  AlertTriangle,
  Calendar,
  Building,
  Eye,
  CheckCircle2,
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

  // Modales
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Estado para el formulario de Nuevo Colaborador
  const [newWorker, setNewWorker] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    type: 'EMPLEADO_INTERNO' as WorkerType,
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

    const matchesType = typeFilter === 'ALL' || w.type === typeFilter;
    const matchesDept = departmentFilter === 'ALL' || w.department === departmentFilter;

    return matchesSearch && matchesType && matchesDept;
  });

  // Handlers CRUD
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.dni || !newWorker.position) return;

    const fechaIngresoFinal = newWorker.fecha_ingreso || new Date().toISOString().split('T')[0];

    // Calculamos si con su fecha de ingreso supera los 365 días
    const daysEmployed = calculateWorkedDays(fechaIngresoFinal);
    const vacationDays = newWorker.type === 'EMPLEADO_INTERNO' && daysEmployed >= 365 ? 30 : 0;

    await addWorker({
      code:
        newWorker.type === 'EMPLEADO_INTERNO'
          ? `FBR-${Math.floor(1000 + Math.random() * 9000)}`
          : `CNT-${Math.floor(2000 + Math.random() * 8000)}`,
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
      baseSalary: Number(newWorker.baseSalary) || 3500,
      fecha_ingreso: fechaIngresoFinal,
      hireDate: fechaIngresoFinal,
      vacationDaysAvailable: vacationDays,
      contractorCompany: newWorker.type === 'CONTRATISTA' ? newWorker.contractorCompany || 'Servicios Especializados S.A.C.' : undefined,
      contractExpiry: newWorker.type === 'CONTRATISTA' ? newWorker.contractExpiry || '2026-12-31' : undefined,
      sctrStatus: newWorker.type === 'CONTRATISTA' ? newWorker.sctrStatus : undefined,
      projectAssigned: newWorker.type === 'CONTRATISTA' ? newWorker.projectAssigned || 'Mantenimiento General' : undefined,
    });

    setShowAddModal(false);
    showToast('Colaborador registrado exitosamente en la base de datos.');

    // Reset form
    setNewWorker({
      name: '',
      dni: '',
      email: '',
      phone: '',
      type: 'EMPLEADO_INTERNO',
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
    });
  };

  const handleOpenEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setEditForm({
      name: worker.name,
      dni: worker.dni,
      email: worker.email,
      phone: worker.phone,
      position: worker.position,
      department: worker.department,
      type: worker.type,
      fecha_ingreso: worker.fecha_ingreso || worker.hireDate || '2025-01-01',
      baseSalary: worker.baseSalary || 3500,
      rfidTag: worker.rfidTag,
      contractorCompany: worker.contractorCompany || '',
      contractExpiry: worker.contractExpiry || '',
      sctrStatus: worker.sctrStatus || 'VIGENTE',
      projectAssigned: worker.projectAssigned || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    const fechaIngresoFinal = editForm.fecha_ingreso || editingWorker.fecha_ingreso;
    const daysEmployed = calculateWorkedDays(fechaIngresoFinal);
    const isEligible = daysEmployed >= 365;

    await updateWorker(editingWorker.id, {
      ...editForm,
      fecha_ingreso: fechaIngresoFinal,
      hireDate: fechaIngresoFinal,
      // Aplicar regla de 365 días estricta
      vacationDaysAvailable:
        editForm.type === 'EMPLEADO_INTERNO'
          ? isEligible
            ? (editingWorker.vacationDaysAvailable && editingWorker.vacationDaysAvailable > 0 ? editingWorker.vacationDaysAvailable : 30)
            : 0
          : 0,
    });

    setEditingWorker(null);
    showToast(`Trabajador ID #${editingWorker.id} actualizado correctamente.`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingWorker) return;
    const id = deletingWorker.id;
    await deleteWorker(id);
    setDeletingWorker(null);
    if (selectedWorker?.id === id) {
      setSelectedWorker(null);
    }
    showToast(`Trabajador ID #${id} eliminado satisfactoriamente.`);
  };

  const handleInspectEffectiveness = (workerId: number) => {
    setSelectedWorkerForStats(workerId);
    setCurrentView('effectiveness');
  };

  const internalCount = workers.filter((w: Worker) => w.type === 'EMPLEADO_INTERNO').length;
  const contractorCount = workers.filter((w: Worker) => w.type === 'CONTRATISTA').length;

  return (
    <div className="space-y-6">
      {/* Toast de notificación de persistencia */}
      {notificationMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-lg border border-slate-700 dark:border-slate-300 shadow-md text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Corporativo Sobrio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gestión de Personal & Padrón Laboral
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administración centralizada de trabajadores en planilla y personal contratista tercerizado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Trabajador</span>
        </button>
      </div>

      {/* Filtros & Barra de Búsqueda Minimalista */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscador */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, nombre, DNI, RFID o contratista..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
            />
          </div>

          {/* Filtro por Régimen */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({workers.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('EMPLEADO_INTERNO')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                typeFilter === 'EMPLEADO_INTERNO'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Planilla ({internalCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('CONTRATISTA')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                typeFilter === 'CONTRATISTA'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Contratistas ({contractorCount})
            </button>
          </div>

          {/* Filtro por Departamento */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
            >
              <option value="ALL">Todas las Áreas</option>
              {departments.map((deptName: string) => (
                <option key={deptName} value={deptName}>
                  {deptName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Limpia y Minimalista Corporativa */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5 w-14 text-center">ID</th>
                <th className="py-3 px-4">Colaborador / Documento</th>
                <th className="py-3 px-4">Régimen</th>
                <th className="py-3 px-4">Cargo & Área</th>
                <th className="py-3 px-4">Fecha Ingreso</th>
                <th className="py-3 px-4">Vacaciones (Regla 365d)</th>
                <th className="py-3 px-4">Credencial RFID</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se encontraron trabajadores con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker: Worker) => {
                  const vacation = evaluateWorkerVacation(worker);
                  return (
                    <tr
                      key={worker.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* ID único numérico (PK SQL Server) */}
                      <td className="py-3 px-3.5 text-center font-mono font-semibold text-slate-500 text-xs">
                        #{worker.id}
                      </td>

                      {/* Colaborador */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={worker.avatarUrl}
                            alt={worker.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {worker.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              DNI: {worker.dni} • Cód: {worker.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Régimen */}
                      <td className="py-3 px-4">
                        <Badge value={worker.type} size="sm" />
                      </td>

                      {/* Cargo y Área */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 dark:text-white block">
                          {worker.position}
                        </span>
                        <span className="text-[11px] text-slate-500">{worker.department}</span>
                      </td>

                      {/* Fecha de Ingreso */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {worker.fecha_ingreso || worker.hireDate || 'N/D'}
                        <span className="block text-[10px] text-slate-400">
                          ({vacation.daysEmployed} días)
                        </span>
                      </td>

                      {/* Vacaciones con Regla Estricta 365 días */}
                      <td className="py-3 px-4">
                        {worker.type === 'CONTRATISTA' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            No aplica (Tercerizado)
                          </span>
                        ) : vacation.isEligibleFor30Days ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              {vacation.vacationDaysAvailable} días (Habilitado)
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Supera 365 días
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              0 días (No habilitado)
                            </span>
                            <span className="block text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                              Faltan {vacation.daysRemainingUntilYear} días para 1 año
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Tag RFID */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded">
                          {worker.rfidTag}
                        </span>
                      </td>

                      {/* Menú de Acciones CRUD (Editar, Eliminar, Ficha, KPIs) */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(worker)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Editar datos del trabajador"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingWorker(worker)}
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Eliminar trabajador de la base de datos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedWorker(worker)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Ver ficha completa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleInspectEffectiveness(worker.id)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Ver dashboard mensual de efectividad"
                          >
                            <Gauge className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: EDITAR TRABAJADOR (CRUD UPDATE) */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  <Pencil className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Editar Colaborador (ID #{editingWorker.id})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modificar datos personales, régimen y fecha de ingreso en SQL Server.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nombre */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  />
                </div>

                {/* DNI */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    DNI / Documento:
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.dni || ''}
                    onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Tag RFID */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tag Tarjeta RFID:
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.rfidTag || ''}
                    onChange={(e) => setEditForm({ ...editForm, rfidTag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Cargo */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Cargo / Puesto:
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.position || ''}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  />
                </div>

                {/* Área / Departamento */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Área / Departamento:
                  </label>
                  <select
                    value={editForm.department || 'Operaciones & Planta'}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  >
                    <option value="Operaciones & Planta">Operaciones & Planta</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Mantenimiento & Torno">Mantenimiento & Torno</option>
                    <option value="Control de Calidad">Control de Calidad</option>
                    <option value="Seguridad y Medio Ambiente (HSE)">Seguridad y Medio Ambiente (HSE)</option>
                    <option value="Tecnología & Redes">Tecnología & Redes</option>
                    <option value="Mantenimiento Eléctrico">Mantenimiento Eléctrico</option>
                  </select>
                </div>

                {/* Fecha de Ingreso (Regla de los 365 días) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Fecha de Ingreso (Hire Date):</span>
                    <span className="text-[10px] text-slate-400">Regla 365 días</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.fecha_ingreso || ''}
                    onChange={(e) => setEditForm({ ...editForm, fecha_ingreso: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Días laborados calculados:{' '}
                    <strong>{calculateWorkedDays(editForm.fecha_ingreso)} días</strong>.
                    {calculateWorkedDays(editForm.fecha_ingreso) < 365
                      ? ' (< 365d: Vacaciones = 0 No habilitado)'
                      : ' (≥ 365d: Vacaciones = 30 Habilitado)'}
                  </p>
                </div>

                {/* Sueldo Base */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Sueldo Base Mensual (S/.):
                  </label>
                  <input
                    type="number"
                    min="1025"
                    step="50"
                    value={editForm.baseSalary || 3500}
                    onChange={(e) => setEditForm({ ...editForm, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Correo */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Teléfono:
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Campos si es Contratista */}
                {editForm.type === 'CONTRATISTA' && (
                  <>
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                        Datos del Proveedor / Contratista:
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Empresa Contratista:
                      </label>
                      <input
                        type="text"
                        value={editForm.contractorCompany || ''}
                        onChange={(e) => setEditForm({ ...editForm, contractorCompany: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Vencimiento Contrato:
                      </label>
                      <input
                        type="date"
                        value={editForm.contractExpiry || ''}
                        onChange={(e) => setEditForm({ ...editForm, contractExpiry: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 rounded-lg font-semibold text-xs transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMACIÓN DE ELIMINACIÓN (CRUD DELETE) */}
      {deletingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg p-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Confirmar Eliminación de Colaborador
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  ¿Está seguro de que desea eliminar al trabajador{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {deletingWorker.name}
                  </strong>{' '}
                  (ID: <strong>#{deletingWorker.id}</strong> - DNI:{' '}
                  <strong>{deletingWorker.dni}</strong>)?
                </p>
                <p className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-md border border-red-200 dark:border-red-900 mt-2">
                  Esta acción desvinculará de forma permanente su credencial RFID{' '}
                  <strong>{deletingWorker.rfidTag}</strong> y eliminará el registro de la
                  base de datos relacional.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingWorker(null)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FICHA DETALLADA DEL TRABAJADOR */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg p-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorker.avatarUrl}
                  alt={selectedWorker.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
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
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Cargo / Función:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedWorker.position}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Departamento / Área:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedWorker.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Credencial RFID:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{selectedWorker.rfidTag}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Sueldo Base:</span>
                  <span className="font-mono text-slate-900 dark:text-white">S/. {selectedWorker.baseSalary || 3500}.00</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Correo Electrónico:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate block">{selectedWorker.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Teléfono:</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedWorker.phone}</span>
                </div>
              </div>

              {/* SECCIÓN ESTRICTA DE VACACIONES SEGÚN REGLA DE 365 DÍAS */}
              {selectedWorker.type === 'EMPLEADO_INTERNO' ? (
                (() => {
                  const vac = evaluateWorkerVacation(selectedWorker);
                  return (
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Habilitación Vacacional (Regla Legal 365 días)
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${vac.badgeColorClass}`}>
                          {vac.statusLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Fecha de Ingreso:</span>
                          <span className="font-mono font-medium">{vac.fechaIngreso}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Días Laborados:</span>
                          <span className="font-mono font-medium">{vac.daysEmployed} de 365 días</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 text-[10px] block">Días de Vacaciones Disponibles:</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {vac.displaySummary}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    <Building className="w-3.5 h-3.5" />
                    <span>Datos del Proveedor Contratista</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Empresa:</span>
                      <span className="font-medium">{selectedWorker.contractorCompany}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Póliza SCTR:</span>
                      <Badge value={selectedWorker.sctrStatus || 'VIGENTE'} size="sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleInspectEffectiveness(selectedWorker.id);
                  setSelectedWorker(null);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Ver Efectividad KPIs</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REGISTRAR NUEVO TRABAJADOR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  <UserPlus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Registrar Nuevo Colaborador
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asignar credencial RFID y vincular a la base de datos de Factoría Bruce.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4 text-xs">
              {/* Selección de Tipo */}
              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1.5">
                  Tipo de Vínculo:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewWorker({ ...newWorker, type: 'EMPLEADO_INTERNO' })}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      newWorker.type === 'EMPLEADO_INTERNO'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-semibold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Planilla Interna</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewWorker({ ...newWorker, type: 'CONTRATISTA' })}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      newWorker.type === 'CONTRATISTA'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-semibold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <HardHat className="w-4 h-4" />
                    <span>Contratista Externo</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nombre */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    placeholder="Ej. Ing. Martín Ramos Quispe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  />
                </div>

                {/* DNI */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    DNI:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={newWorker.dni}
                    onChange={(e) => setNewWorker({ ...newWorker, dni: e.target.value })}
                    placeholder="72819230"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Tag RFID */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tag RFID Asignado:
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorker.rfidTag}
                    onChange={(e) => setNewWorker({ ...newWorker, rfidTag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Cargo */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Cargo / Posición:
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorker.position}
                    onChange={(e) => setNewWorker({ ...newWorker, position: e.target.value })}
                    placeholder="Técnico Metalúrgico"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  />
                </div>

                {/* Área */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Departamento:
                  </label>
                  <select
                    value={newWorker.department}
                    onChange={(e) => setNewWorker({ ...newWorker, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  >
                    <option value="Operaciones & Planta">Operaciones & Planta</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Mantenimiento & Torno">Mantenimiento & Torno</option>
                    <option value="Control de Calidad">Control de Calidad</option>
                    <option value="Seguridad y Medio Ambiente (HSE)">Seguridad y Medio Ambiente (HSE)</option>
                    <option value="Tecnología & Redes">Tecnología & Redes</option>
                  </select>
                </div>

                {/* Fecha de Ingreso (Regla de los 365 días) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Fecha de Ingreso (Hire Date):
                  </label>
                  <input
                    type="date"
                    required
                    value={newWorker.fecha_ingreso}
                    onChange={(e) => setNewWorker({ ...newWorker, fecha_ingreso: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Sueldo Base */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Sueldo Base Mensual (S/.):
                  </label>
                  <input
                    type="number"
                    value={newWorker.baseSalary}
                    onChange={(e) => setNewWorker({ ...newWorker, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
                  />
                </div>

                {/* Datos de contratista si aplica */}
                {newWorker.type === 'CONTRATISTA' && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Empresa Contratista:
                    </label>
                    <input
                      type="text"
                      value={newWorker.contractorCompany}
                      onChange={(e) => setNewWorker({ ...newWorker, contractorCompany: e.target.value })}
                      placeholder="Nombre de la empresa proveedora"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 rounded-lg font-semibold text-xs transition-colors"
                >
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
