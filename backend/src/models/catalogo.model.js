import { pool } from '../config/db.js';
import { crearModeloCrud } from './crud.model.js';
import { ErrorApi } from '../utils/ErrorApi.js';

export const marcaModel = crearModeloCrud({
  tabla: 'marcas',
  campos: ['nombre', 'pais', 'activo'],
  orden: 'nombre',
});

export const tipoVehiculoModel = crearModeloCrud({
  tabla: 'tipos_vehiculo',
  campos: ['nombre'],
  orden: 'nombre',
});

export const estadoVehiculoModel = crearModeloCrud({
  tabla: 'estados_vehiculo',
  campos: ['nombre'],
  orden: 'id',
});

/**
 * Los estados de vehiculo no vienen precargados: se registran desde el sistema.
 * Vender o recibir un vehiculo necesita algunos con nombre exacto, asi que si
 * falta alguno se avisa con claridad en vez de fallar con un error de SQL.
 */
export async function idEstadoVehiculo(nombre, conexion = pool) {
  const [[fila]] = await conexion.query('SELECT id FROM estados_vehiculo WHERE nombre = ?', [nombre]);
  if (!fila) {
    throw new ErrorApi(409, `Falta el estado "${nombre}" en el catálogo de estados de vehículo. Regístralo antes de continuar.`);
  }
  return fila.id;
}

// Todos los catalogos en una sola peticion, para llenar los <select> del frontend.
export async function catalogosCompletos() {
  const [marcas] = await pool.query('SELECT id, nombre FROM marcas WHERE activo = TRUE ORDER BY nombre');
  const [tipos] = await pool.query('SELECT id, nombre FROM tipos_vehiculo ORDER BY nombre');
  const [estados] = await pool.query('SELECT id, nombre FROM estados_vehiculo ORDER BY id');
  const [roles] = await pool.query('SELECT id, nombre FROM roles WHERE activo = TRUE ORDER BY nombre');
  return { marcas, tipos_vehiculo: tipos, estados_vehiculo: estados, roles };
}
