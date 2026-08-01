import { ErrorApi } from '../utils/ErrorApi.js';

// Traduce los errores de MySQL a respuestas entendibles para el frontend.
// Se usa el numero (errno) y no el nombre: MySQL y MariaDB le ponen nombres
// distintos al mismo numero y el nombre que reporta el driver no siempre calza.
const ERRORES_MYSQL = {
  1054: [400, 'Se envió un campo que no existe en la tabla'],
  1048: [400, 'Falta un campo obligatorio'],
  1062: [409, 'Ya existe un registro con ese valor (cédula, código o email repetido)'],
  1264: [400, 'Un valor está fuera del rango permitido'],
  1364: [400, 'Falta un campo obligatorio'],
  1366: [400, 'Un valor tiene un formato inválido'],
  1406: [400, 'Un valor supera el largo permitido'],
  1451: [409, 'No se puede eliminar: otros registros dependen de este'],
  1452: [400, 'El registro relacionado que enviaste no existe'],
  3819: [400, 'Un valor no cumple las reglas de la base de datos'], // CHECK en MySQL 8
  4025: [400, 'Un valor no cumple las reglas de la base de datos'], // CHECK en MariaDB
};

const ERRORES_CONEXION = ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR'];

export function noEncontrado(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function manejadorErrores(err, req, res, next) {
  if (err instanceof ErrorApi) {
    return res.status(err.estado).json({ mensaje: err.message });
  }

  if (ERRORES_CONEXION.includes(err.code)) {
    console.error(err);
    return res.status(503).json({ mensaje: 'No hay conexión con la base de datos' });
  }

  const conocido = ERRORES_MYSQL[err.errno];
  if (conocido) {
    // El detalle tecnico va a la consola del servidor, no a la pantalla del usuario.
    console.error(`[${err.errno}] ${err.sqlMessage}`);
    const [estado, mensaje] = conocido;
    return res.status(estado).json({ mensaje });
  }

  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}
