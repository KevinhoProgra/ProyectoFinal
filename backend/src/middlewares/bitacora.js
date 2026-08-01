import { pool } from '../config/db.js';

const ACCIONES = { POST: 'crear', PUT: 'editar', DELETE: 'eliminar' };

export async function registrar({ usuario_id = null, accion, tabla_afectada = null, registro_id = null, detalle = null, ip = null }) {
  try {
    await pool.query(
      'INSERT INTO bitacora (usuario_id, accion, tabla_afectada, registro_id, detalle, ip) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario_id, accion, tabla_afectada, registro_id, detalle, ip],
    );
  } catch (error) {
    // La bitacora nunca debe tumbar la peticion principal.
    console.error('No se pudo escribir en la bitacora:', error.message);
  }
}

// Registra automaticamente toda peticion que modifica datos y termina bien.
export function auditar(req, res, next) {
  res.on('finish', () => {
    const accion = ACCIONES[req.method];
    if (!accion || res.statusCode >= 400 || !req.usuario) return;

    const ruta = req.originalUrl.split('?')[0];
    const ultimo = ruta.split('/').pop();

    registrar({
      usuario_id: req.usuario.id,
      accion,
      tabla_afectada: ruta.split('/')[2] ?? null,
      registro_id: /^\d+$/.test(ultimo) ? ultimo : null,
      detalle: `${req.method} ${ruta}`,
      ip: req.ip,
    });
  });
  next();
}
