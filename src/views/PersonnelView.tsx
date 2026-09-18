import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import type { Worker, WorkerType, WorkerStatus } from '../types';
import {
  Users,
  Search,
  UserPlus,
  HardHat,
  UserCheck,
  X,
  Gauge,
} from 'lucide-react';

export const PersonnelView: React.FC = () => {
  const { workers, addWorker, updateWorkerStatus, setSelectedWorkerForStats, setCurrentView } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | WorkerType>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New worker form state
  const [newWorker, setNewWorker] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    type: 'EMPLEADO_INTERNO' as WorkerType,
    department: 'Operaciones & Planta',
    position: '',
    rfidTag: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'ACTIVO' as WorkerStatus,
    baseSalary: 3500,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    contractorCompany: '',
    contractExpiry: '',
    sctrStatus: 'VIGENTE' as 'VIGENTE' | 'POR_VENCER' | 'VENCIDO',
    projectAssigned: '',
  });

  const departments = Array.from(new Set(workers.map((w: Worker) => w.department)));

  const filteredWorkers = workers.filter((w: Worker) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.dni.includes(searchTerm) ||
      w.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.contractorCompany && w.contractorCompany.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || w.type === typeFilter;
    const matchesDept = departmentFilter === 'ALL' || w.department === departmentFilter;

    return matchesSearch && matchesType && matchesDept;
  });

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.dni || !newWorker.position) return;

    addWorker({
      code: newWorker.type === 'EMPLEADO_INTERNO' ? `FBR-${Math.floor(1000 + Math.random() * 9000)}` : `CNT-${Math.floor(2000 + Math.random() * 8000)}`,
      name: newWorker.name,
      dni: newWorker.dni,
      email: newWorker.email || `${newWorker.name.toLowerCase().replace(/\s+/g, '.')}@factoriabruce.com`,
      phone: newWorker.phone || '+51 900 000 000',
      type: newWorker.type,
      department: newWorker.department,
      position: newWorker.position,
      rfidTag: newWorker.rfidTag,
      status: newWorker.status,
      avatarUrl: newWorker.avatarUrl,
      baseSalary: Number(newWorker.baseSalary) || 3500,
      hireDate: newWorker.type === 'EMPLEADO_INTERNO' ? new Date().toISOString().split('T')[0] : undefined,
      vacationDaysAvailable: newWorker.type === 'EMPLEADO_INTERNO' ? 15 : undefined,
      contractorCompany: newWorker.type === 'CONTRATISTA' ? newWorker.contractorCompany || 'Servicios Especializados S.A.C.' : undefined,
      contractExpiry: newWorker.type === 'CONTRATISTA' ? newWorker.contractExpiry || '2026-12-31' : undefined,
      sctrStatus: newWorker.type === 'CONTRATISTA' ? newWorker.sctrStatus : undefined,
      projectAssigned: newWorker.type === 'CONTRATISTA' ? newWorker.projectAssigned || 'Mantenimiento General' : undefined,
    });

    setShowAddModal(false);
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
      contractorCompany: '',
      contractExpiry: '',
      sctrStatus: 'VIGENTE',
      projectAssigned: '',
    });
  };

  const handleInspectEffectiveness = (workerId: string) => {
    setSelectedWorkerForStats(workerId);
    setCurrentView('effectiveness');
  };

  const internalCount = workers.filter((w: Worker) => w.type === 'EMPLEADO_INTERNO').length;
  const contractorCount = workers.filter((w: Worker) => w.type === 'CONTRATISTA').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Gestión y Padrón de Personal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Administración de colaboradores internos de planilla y personal contratista tercerizado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Colaborador</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, DNI, tag RFID o empresa..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Todos ({workers.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('EMPLEADO_INTERNO')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'EMPLEADO_INTERNO'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Planilla ({internalCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('CONTRATISTA')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'CONTRATISTA'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Contratistas ({contractorCount})
            </button>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-black dark:focus:border-white"
            >
              <option value="ALL">Todas las Áreas</option>
              {departments.map((deptName: string) => (
                <option key={deptName} value={deptName} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {deptName}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Personnel Modern Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Colaborador / DNI</th>
                <th className="py-3.5 px-4">Régimen</th>
                <th className="py-3.5 px-4">Área & Cargo</th>
                <th className="py-3.5 px-4">Tag RFID</th>
                <th className="py-3.5 px-4">Empresa / SCTR</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredWorkers.map((worker: Worker) => (
                <tr
                  key={worker.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedWorker(worker)}
                >
                  {/* Worker & Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.avatarUrl}
                        alt={worker.name}
                        className="w-9 h-9 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 group-hover:border-black dark:group-hover:border-white shrink-0 transition-colors"
                      />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block">
                          {worker.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          DNI: {worker.dni} • Cod: {worker.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Worker Type Badge */}
                  <td className="py-3 px-4">
                    <Badge value={worker.type} size="sm" />
                  </td>

                  {/* Position & Department */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-zinc-900 dark:text-white block">{worker.position}</span>
                    <span className="text-[11px] text-zinc-500">{worker.department}</span>
                  </td>

                  {/* RFID Tag */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 rounded-md">
                      {worker.rfidTag}
                    </span>
                  </td>

                  {/* Contractor info */}
                  <td className="py-3 px-4">
                    {worker.type === 'CONTRATISTA' ? (
                      <div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[180px]">
                          {worker.contractorCompany}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-zinc-400">SCTR:</span>
                          <Badge value={worker.sctrStatus || 'VIGENTE'} size="sm" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic">Planilla Factoría Bruce</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <Badge value={worker.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectEffectiveness(worker.id);
                      }}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 inline-flex items-center gap-1"
                      title="Ver dashboard mensual de efectividad"
                    >
                      <Gauge className="w-3 h-3" />
                      <span>KPIs</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorker(worker);
                      }}
                      className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL FOR SELECTED WORKER */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedWorker.avatarUrl}
                  alt={selectedWorker.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-300 dark:border-zinc-700 shadow-sm"
                />
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                    {selectedWorker.name}
                  </h3>
                  <p className="text-xs text-zinc-500">{selectedWorker.position}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge value={selectedWorker.type} size="sm" />
                    <Badge value={selectedWorker.status} size="sm" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-500 block text-[10px]">DNI / Identificación:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">{selectedWorker.dni}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Código Interno:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">{selectedWorker.code}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Tag de Tarjeta RFID:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">{selectedWorker.rfidTag}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Departamento / Área:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{selectedWorker.department}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Correo Corporativo:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate block">{selectedWorker.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Teléfono de Contacto:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{selectedWorker.phone}</span>
                </div>
              </div>

              {/* SPECIFIC FIELDS FOR CONTRACTORS */}
              {selectedWorker.type === 'CONTRATISTA' ? (
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                    <HardHat className="w-4 h-4" />
                    <span>Información de Proveedor & Póliza</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-zinc-700 dark:text-zinc-300">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Empresa Contratista:</span>
                      <span className="font-semibold">{selectedWorker.contractorCompany}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Vigencia del Contrato:</span>
                      <span className="font-mono">{selectedWorker.contractExpiry || '31/12/2026'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Estado Póliza SCTR:</span>
                      <Badge value={selectedWorker.sctrStatus || 'VIGENTE'} size="sm" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Proyecto Asignado:</span>
                      <span>{selectedWorker.projectAssigned || 'Mantenimiento General'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                    <span>Régimen Laboral Interno</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-zinc-700 dark:text-zinc-300">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Fecha de Ingreso:</span>
                      <span className="font-mono">{selectedWorker.hireDate || '15/03/2021'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Vacaciones Pendientes:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {selectedWorker.vacationDaysAvailable ?? 15} días disponibles
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleInspectEffectiveness(selectedWorker.id);
                    setSelectedWorker(null);
                  }}
                  className="px-3 py-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Ver Efectividad</span>
                </button>

                {selectedWorker.status === 'ACTIVO' ? (
                  <button
                    type="button"
                    onClick={() => {
                      updateWorkerStatus(selectedWorker.id, 'BLOQUEADO');
                      setSelectedWorker({ ...selectedWorker, status: 'BLOQUEADO' });
                    }}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-rose-700 dark:text-rose-400 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-xl"
                  >
                    Bloquear Pase
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      updateWorkerStatus(selectedWorker.id, 'ACTIVO');
                      setSelectedWorker({ ...selectedWorker, status: 'ACTIVO' });
                    }}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-emerald-700 dark:text-emerald-400 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-xl"
                  >
                    Reactivar Pase
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORKER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Registrar Nuevo Colaborador</h3>
                  <p className="text-xs text-zinc-500">Asignar credencial RFID y vincular a régimen laboral.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="py-4 space-y-4 text-xs">
              {/* Type Selection */}
              <div>
                <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">Tipo de Vínculo:</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      newWorker.type === 'EMPLEADO_INTERNO'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="workerType"
                      checked={newWorker.type === 'EMPLEADO_INTERNO'}
                      onChange={() => setNewWorker({ ...newWorker, type: 'EMPLEADO_INTERNO' })}
                      className="hidden"
                    />
                    <UserCheck className="w-4 h-4" />
                    <span>Planilla Interna</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      newWorker.type === 'CONTRATISTA'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="workerType"
                      checked={newWorker.type === 'CONTRATISTA'}
                      onChange={() => setNewWorker({ ...newWorker, type: 'CONTRATISTA' })}
                      className="hidden"
                    />
                    <HardHat className="w-4 h-4" />
                    <span>Contratista Tercerizado</span>
                  </label>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    placeholder="Ej: Ing. Jorge Alarcón"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">DNI / Documento *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newWorker.dni}
                    onChange={(e) => setNewWorker({ ...newWorker, dni: e.target.value })}
                    placeholder="Ej: 47291834"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Cargo / Puesto *</label>
                  <input
                    type="text"
                    required
                    value={newWorker.position}
                    onChange={(e) => setNewWorker({ ...newWorker, position: e.target.value })}
                    placeholder="Ej: Supervisor de Calderería"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Área / Depto</label>
                  <select
                    value={newWorker.department}
                    onChange={(e) => setNewWorker({ ...newWorker, department: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  >
                    <option value="Operaciones & Planta">Operaciones & Planta</option>
                    <option value="Mantenimiento & Torno">Mantenimiento & Torno</option>
                    <option value="Control de Calidad">Control de Calidad</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Seguridad y Medio Ambiente (HSE)">Seguridad y Medio Ambiente (HSE)</option>
                    <option value="Logística & Montacargas">Logística & Montacargas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Tag Tarjeta RFID</label>
                  <input
                    type="text"
                    required
                    value={newWorker.rfidTag}
                    onChange={(e) => setNewWorker({ ...newWorker, rfidTag: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-mono font-bold focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Sueldo Base Mensual (S/)</label>
                  <input
                    type="number"
                    value={newWorker.baseSalary}
                    onChange={(e) => setNewWorker({ ...newWorker, baseSalary: Number(e.target.value) || 3500 })}
                    placeholder="3500"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              {/* Specific Contractor inputs */}
              {newWorker.type === 'CONTRATISTA' && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 space-y-3">
                  <span className="font-bold text-zinc-900 dark:text-white block">Datos del Proveedor Contratista:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-500 font-medium mb-1">Empresa Contratista</label>
                      <input
                        type="text"
                        value={newWorker.contractorCompany}
                        onChange={(e) => setNewWorker({ ...newWorker, contractorCompany: e.target.value })}
                        placeholder="Ej: Electromecánica del Norte S.A.C."
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 font-medium mb-1">Proyecto Asignado</label>
                      <input
                        type="text"
                        value={newWorker.projectAssigned}
                        onChange={(e) => setNewWorker({ ...newWorker, projectAssigned: e.target.value })}
                        placeholder="Ej: Montaje Estructura Nave 3"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold rounded-xl shadow-sm transition-all active:scale-95"
                >
                  Guardar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
