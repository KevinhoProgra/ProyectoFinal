import { pool } from '../config/db.js';
import { crearModeloCrud } from './crud.model.js';

export const rolModel = {
  ...crearModeloCrud({
    tabla: 'roles',
    campos: ['nombre', 'descripcion', 'activo'],
    sqlListar: `
      SELECT r.*, COUNT(rp.permiso_id) AS cantidad_permisos
      FROM roles r
      LEFT JOIN rol_permiso rp ON rp.rol_id = r.id
      GROUP BY r.id
      ORDER BY r.nombre`,
  }),

  async permisosDe(rolId) {
    const [filas] = await pool.query(
      `SELECT p.id, p.clave, p.modulo, p.accion, p.descripcion
       FROM rol_permiso rp
       JOIN permisos p ON p.id = rp.permiso_id
       WHERE rp.rol_id = ?
       ORDER BY p.modulo, p.accion`,
      [rolId],
    );
    return filas;
  },

  // Reemplaza los permisos del rol por la lista enviada.
  async asignarPermisos(rolId, permisoIds) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      await conexion.query('DELETE FROM rol_permiso WHERE rol_id = ?', [rolId]);
      if (permisoIds.length) {
        await conexion.query('INSERT INTO rol_permiso (rol_id, permiso_id) VALUES ?', [
          permisoIds.map((permisoId) => [rolId, permisoId]),
        ]);
      }
      await conexion.commit();
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
    return this.permisosDe(rolId);
  },
};

export async function listarPermisos() {
  const [filas] = await pool.query('SELECT * FROM permisos ORDER BY modulo, accion');
  return filas;
}
