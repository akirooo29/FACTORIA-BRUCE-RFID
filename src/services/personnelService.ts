import type { Worker } from '../types';
import { INITIAL_WORKERS } from '../data/mockData';

/**
 * SERVICIO DE GESTIÓN DE PERSONAL (CRUD API CLIENT)
 * 
 * Estructurado para conectarse directamente a un Backend REST (C# ASP.NET Core Web API o Node.js/Express)
 * con persistencia en Base de Datos relacional (ej. SQL Server, PostgreSQL).
 * 
 * Cuando el backend esté listo, cambiar USE_MOCK_API a false y configurar API_BASE_URL.
 */

export const API_BASE_URL = 'http://localhost:5000/api/trabajadores';
const USE_MOCK_API = true; // Cambiar a false al desplegar backend real

// Estado en memoria simulando la tabla 'Trabajadores' de SQL Server
let inMemoryWorkers: Worker[] = [...INITIAL_WORKERS];

export const personnelService = {
  /**
   * Obtiene todos los trabajadores registrados.
   * Backend SQL: SELECT * FROM Trabajadores ORDER BY Id DESC
   */
  async getAll(): Promise<Worker[]> {
    if (!USE_MOCK_API) {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Error al consultar lista de trabajadores');
      return await response.json();
    }
    // Simular latencia de red corporativa (80ms)
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...inMemoryWorkers];
  },

  /**
   * Obtiene un trabajador por su ID único numérico.
   * Backend SQL: SELECT * FROM Trabajadores WHERE Id = @Id
   */
  async getById(id: number): Promise<Worker | null> {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) return null;
      return await response.json();
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
    const found = inMemoryWorkers.find((w) => w.id === id);
    return found ? { ...found } : null;
  },

  /**
   * Registra un nuevo colaborador.
   * Backend SQL: INSERT INTO Trabajadores (...) VALUES (...); SELECT SCOPE_IDENTITY();
   */
  async create(workerData: Omit<Worker, 'id'>): Promise<Worker> {
    if (!USE_MOCK_API) {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData),
      });
      if (!response.ok) throw new Error('Error al registrar nuevo trabajador en la base de datos');
      return await response.json();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    // Asignar ID autoincremental único entero (IDENTITY de SQL Server)
    const maxId = inMemoryWorkers.reduce((max, w) => Math.max(max, Number(w.id) || 0), 0);
    const newWorker: Worker = {
      ...workerData,
      id: maxId + 1,
      hireDate: workerData.fecha_ingreso,
    };
    inMemoryWorkers = [newWorker, ...inMemoryWorkers];
    return newWorker;
  },

  /**
   * Actualiza los datos de un trabajador existente.
   * Backend SQL: UPDATE Trabajadores SET ... WHERE Id = @Id
   */
  async update(id: number, data: Partial<Worker>): Promise<Worker> {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Error al actualizar el trabajador con ID ${id}`);
      return await response.json();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = inMemoryWorkers.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`Trabajador con ID ${id} no encontrado en el sistema.`);
    }

    const updatedWorker: Worker = {
      ...inMemoryWorkers[index],
      ...data,
      id, // Preservar ID inmutable
      hireDate: data.fecha_ingreso || inMemoryWorkers[index].fecha_ingreso,
    };

    inMemoryWorkers[index] = updatedWorker;
    return updatedWorker;
  },

  /**
   * Elimina un trabajador del padrón.
   * Backend SQL: DELETE FROM Trabajadores WHERE Id = @Id
   */
  async delete(id: number): Promise<boolean> {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Error al eliminar el trabajador con ID ${id}`);
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const initialLen = inMemoryWorkers.length;
    inMemoryWorkers = inMemoryWorkers.filter((w) => w.id !== id);
    return inMemoryWorkers.length < initialLen;
  },
};
