import { pool } from '../config/db.js';
import { ErrorApi } from '../utils/ErrorApi.js';
import { idEstadoVehiculo } from './catalogo.model.js';

const redondear = (numero) => Math.round(numero * 100) / 100;

// Correlativo tipo FAC-2026-0001.
// ponytail: con muchos usuarios simultaneos dos ventas podrian calcular el mismo
// numero; el UNIQUE lo rechaza y la transaccion se revierte. Si eso llega a pasar
// seguido, cambiar a una tabla de consecutivos con SELECT ... FOR UPDATE.
async function siguienteFactura(conexion) {
  const [[fila]] = await conexion.query('SELECT IFNULL(MAX(id), 0) + 1 AS siguiente FROM ventas');
  const anio = new Date().getFullYear();
  return `FAC-${anio}-${String(fila.siguiente).padStart(4, '0')}`;
}

export const ventaModel = {
  async listar() {
    const [filas] = await pool.query(`
      SELECT v.id, v.numero_factura, v.fecha, v.subtotal, v.descuento, v.impuesto, v.total,
             v.metodo_pago, v.estado,
             CONCAT_WS(' ', c.nombre, c.apellidos) AS cliente,
             CONCAT_WS(' ', u.nombre, u.apellidos) AS vendedor,
             COUNT(vd.id) AS cantidad_vehiculos
      FROM ventas v
      JOIN clientes c ON c.id = v.cliente_id
      JOIN usuarios u ON u.id = v.usuario_id
      LEFT JOIN venta_detalle vd ON vd.venta_id = v.id
      GROUP BY v.id
      ORDER BY v.fecha DESC`);
    return filas;
  },

  async obtener(id) {
    const [[venta]] = await pool.query(
      `SELECT v.*, CONCAT_WS(' ', c.nombre, c.apellidos) AS cliente, c.cedula AS cedula_cliente,
              CONCAT_WS(' ', u.nombre, u.apellidos) AS vendedor
       FROM ventas v
       JOIN clientes c ON c.id = v.cliente_id
       JOIN usuarios u ON u.id = v.usuario_id
       WHERE v.id = ?`,
      [id],
    );
    if (!venta) return null;

    const [detalle] = await pool.query(
      `SELECT vd.id, vd.vehiculo_id, vd.precio_unitario, vd.descuento,
              ve.vin, ve.placa, ve.modelo, ve.anio, m.nombre AS marca, t.nombre AS tipo
       FROM venta_detalle vd
       JOIN vehiculos ve ON ve.id = vd.vehiculo_id
       JOIN marcas m ON m.id = ve.marca_id
       JOIN tipos_vehiculo t ON t.id = ve.tipo_id
       WHERE vd.venta_id = ?`,
      [id],
    );
    return { ...venta, detalle };
  },

  /**
   * Crea la factura completa dentro de una transaccion: si algo falla, no queda nada a medias.
   * El precio SIEMPRE se toma de la base, nunca del cliente.
   * detalle = [{ vehiculo_id, descuento }]
   */
  async crear({ cliente_id, usuario_id, metodo_pago, observaciones, detalle }) {
    if (!Array.isArray(detalle) || !detalle.length) {
      throw new ErrorApi(400, 'La venta debe incluir al menos un vehículo');
    }

    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();

      // Se resuelve primero: si el catalogo no lo tiene, falla antes de facturar.
      const estadoVendido = await idEstadoVehiculo('Vendido', conexion);

      const ids = detalle.map((linea) => linea.vehiculo_id);
      const [vehiculos] = await conexion.query(
        `SELECT v.id, v.precio_venta, e.nombre AS estado
         FROM vehiculos v
         JOIN estados_vehiculo e ON e.id = v.estado_id
         WHERE v.id IN (?) FOR UPDATE`,
        [ids],
      );

      if (vehiculos.length !== ids.length) throw new ErrorApi(400, 'Alguno de los vehículos no existe');
      const vendido = vehiculos.find((vehiculo) => vehiculo.estado === 'Vendido');
      if (vendido) throw new ErrorApi(409, `El vehículo ${vendido.id} ya fue vendido`);

      const numero_factura = await siguienteFactura(conexion);
      const [cabecera] = await conexion.query(
        'INSERT INTO ventas (numero_factura, cliente_id, usuario_id, metodo_pago, observaciones) VALUES (?, ?, ?, ?, ?)',
        [numero_factura, cliente_id, usuario_id, metodo_pago ?? 'efectivo', observaciones ?? null],
      );
      const ventaId = cabecera.insertId;

      const lineas = detalle.map((linea) => {
        const vehiculo = vehiculos.find((v) => v.id === Number(linea.vehiculo_id));
        return [ventaId, vehiculo.id, vehiculo.precio_venta, Number(linea.descuento ?? 0)];
      });
      await conexion.query(
        'INSERT INTO venta_detalle (venta_id, vehiculo_id, precio_unitario, descuento) VALUES ?',
        [lineas],
      );

      const subtotal = redondear(lineas.reduce((suma, [, , precio]) => suma + Number(precio), 0));
      const descuento = redondear(lineas.reduce((suma, [, , , desc]) => suma + desc, 0));
      const impuesto = redondear((subtotal - descuento) * Number(process.env.IVA));
      const total = redondear(subtotal - descuento + impuesto);

      await conexion.query('UPDATE ventas SET subtotal = ?, descuento = ?, impuesto = ?, total = ? WHERE id = ?', [
        subtotal, descuento, impuesto, total, ventaId,
      ]);

      await conexion.query('UPDATE vehiculos SET estado_id = ? WHERE id IN (?)', [estadoVendido, ids]);

      await conexion.commit();
      return this.obtener(ventaId);
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },

  // Solo se editan los datos de cabecera; el detalle no se toca para no descuadrar los totales.
  async actualizar(id, { metodo_pago, estado, observaciones }) {
    const [resultado] = await pool.query(
      `UPDATE ventas SET
         metodo_pago   = IFNULL(?, metodo_pago),
         estado        = IFNULL(?, estado),
         observaciones = IFNULL(?, observaciones)
       WHERE id = ?`,
      [metodo_pago ?? null, estado ?? null, observaciones ?? null, id],
    );
    return resultado.affectedRows ? this.obtener(id) : null;
  },

  // Anular en vez de borrar: la factura queda en el historial y los vehiculos vuelven a estar disponibles.
  async anular(id) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      const [resultado] = await conexion.query("UPDATE ventas SET estado = 'anulada' WHERE id = ?", [id]);
      if (resultado.affectedRows) {
        const estadoDisponible = await idEstadoVehiculo('Disponible', conexion);
        await conexion.query(
          `UPDATE vehiculos SET estado_id = ?
           WHERE id IN (SELECT vehiculo_id FROM venta_detalle WHERE venta_id = ?)`,
          [estadoDisponible, id],
        );
      }
      await conexion.commit();
      return resultado.affectedRows > 0;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },
};
