import { pool } from '../config/db.js';
import { ErrorApi } from '../utils/ErrorApi.js';
import { idEstadoVehiculo } from './catalogo.model.js';

async function siguienteCodigo(conexion) {
  const [[fila]] = await conexion.query('SELECT IFNULL(MAX(id), 0) + 1 AS siguiente FROM mantenimientos');
  return `MNT-${new Date().getFullYear()}-${String(fila.siguiente).padStart(4, '0')}`;
}

export const mantenimientoModel = {
  async listar() {
    const [filas] = await pool.query('SELECT * FROM vw_mantenimientos_costo ORDER BY fecha_ingreso DESC');
    return filas;
  },

  async obtener(id) {
    const [[mantenimiento]] = await pool.query(
      `SELECT m.*, CONCAT_WS(' ', c.nombre, c.apellidos) AS cliente,
              CONCAT(ma.nombre, ' ', v.modelo) AS vehiculo, v.placa, v.vin,
              CONCAT_WS(' ', u.nombre, u.apellidos) AS mecanico
       FROM mantenimientos m
       JOIN clientes c ON c.id = m.cliente_id
       JOIN vehiculos v ON v.id = m.vehiculo_id
       JOIN marcas ma ON ma.id = v.marca_id
       JOIN usuarios u ON u.id = m.usuario_id
       WHERE m.id = ?`,
      [id],
    );
    if (!mantenimiento) return null;

    const [repuestos] = await pool.query(
      `SELECT mr.repuesto_id, r.codigo, r.nombre, mr.cantidad, mr.precio_unitario,
              (mr.cantidad * mr.precio_unitario) AS subtotal
       FROM mantenimiento_repuesto mr
       JOIN repuestos r ON r.id = mr.repuesto_id
       WHERE mr.mantenimiento_id = ?`,
      [id],
    );
    return { ...mantenimiento, repuestos };
  },

  /**
   * Crea la orden y descuenta el stock de los repuestos en una sola transaccion.
   * repuestos = [{ repuesto_id, cantidad }]
   */
  async crear({ vehiculo_id, cliente_id, usuario_id, descripcion_problema, diagnostico, monto_mano_obra, repuestos = [] }) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();

      const estadoEnMantenimiento = await idEstadoVehiculo('En mantenimiento', conexion);
      const codigo = await siguienteCodigo(conexion);
      const [resultado] = await conexion.query(
        `INSERT INTO mantenimientos
           (codigo, vehiculo_id, cliente_id, usuario_id, descripcion_problema, diagnostico, monto_mano_obra)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [codigo, vehiculo_id, cliente_id, usuario_id, descripcion_problema, diagnostico ?? null, monto_mano_obra ?? 0],
      );
      const mantenimientoId = resultado.insertId;

      for (const linea of repuestos) {
        const cantidad = Number(linea.cantidad ?? 1);

        const [[repuesto]] = await conexion.query('SELECT id, precio_venta FROM repuestos WHERE id = ? FOR UPDATE', [
          linea.repuesto_id,
        ]);
        if (!repuesto) throw new ErrorApi(400, `El repuesto ${linea.repuesto_id} no existe`);

        // El WHERE con stock >= cantidad evita dejar el inventario en negativo.
        const [descuento] = await conexion.query(
          'UPDATE repuestos SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [cantidad, repuesto.id, cantidad],
        );
        if (!descuento.affectedRows) throw new ErrorApi(409, `Stock insuficiente del repuesto ${repuesto.id}`);

        await conexion.query(
          'INSERT INTO mantenimiento_repuesto (mantenimiento_id, repuesto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [mantenimientoId, repuesto.id, cantidad, repuesto.precio_venta],
        );
      }

      await conexion.query('UPDATE vehiculos SET estado_id = ? WHERE id = ?', [estadoEnMantenimiento, vehiculo_id]);

      await conexion.commit();
      return this.obtener(mantenimientoId);
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },

  async actualizar(id, { diagnostico, monto_mano_obra, estado, fecha_entrega }) {
    const [resultado] = await pool.query(
      `UPDATE mantenimientos SET
         diagnostico     = IFNULL(?, diagnostico),
         monto_mano_obra = IFNULL(?, monto_mano_obra),
         estado          = IFNULL(?, estado),
         fecha_entrega   = IFNULL(?, fecha_entrega)
       WHERE id = ?`,
      [diagnostico ?? null, monto_mano_obra ?? null, estado ?? null, fecha_entrega ?? null, id],
    );
    if (!resultado.affectedRows) return null;

    // Al entregar el vehiculo vuelve a estar disponible.
    if (estado === 'entregado') {
      await pool.query(
        `UPDATE vehiculos SET estado_id = ?
         WHERE id = (SELECT vehiculo_id FROM mantenimientos WHERE id = ?)`,
        [await idEstadoVehiculo('Disponible'), id],
      );
    }
    return this.obtener(id);
  },
};
