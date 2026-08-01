import { pool } from '../config/db.js';

// Casi todos los reportes salen de las vistas creadas en el script SQL.
export const reporteModel = {
  // Tarjetas del Dashboard.
  async resumen() {
    const [[fila]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM vehiculos) AS total_vehiculos,
        (SELECT COUNT(*) FROM vehiculos v
           JOIN estados_vehiculo e ON e.id = v.estado_id
          WHERE e.nombre = 'Disponible') AS vehiculos_disponibles,
        (SELECT COUNT(*) FROM clientes WHERE activo = TRUE) AS clientes_activos,
        (SELECT IFNULL(SUM(total), 0) FROM ventas
          WHERE estado <> 'anulada'
            AND YEAR(fecha) = YEAR(CURDATE())
            AND MONTH(fecha) = MONTH(CURDATE())) AS ventas_del_mes,
        (SELECT COUNT(*) FROM mantenimientos
          WHERE estado IN ('recibido', 'en_proceso')) AS mantenimientos_activos,
        (SELECT COUNT(*) FROM repuestos
          WHERE activo = TRUE AND stock <= stock_minimo) AS repuestos_bajo_stock`);
    return fila;
  },

  async ingresosMensuales() {
    const [filas] = await pool.query('SELECT * FROM vw_ingresos_mensuales ORDER BY periodo DESC');
    return filas;
  },

  async ventasDetalle() {
    const [filas] = await pool.query('SELECT * FROM vw_ventas_detalle ORDER BY fecha DESC');
    return filas;
  },

  async vehiculos() {
    const [filas] = await pool.query('SELECT * FROM vw_vehiculos_detalle ORDER BY estado, marca');
    return filas;
  },

  async repuestosBajoStock() {
    const [filas] = await pool.query('SELECT * FROM vw_repuestos_bajo_stock ORDER BY faltante DESC');
    return filas;
  },

  async mantenimientos() {
    const [filas] = await pool.query('SELECT * FROM vw_mantenimientos_costo ORDER BY fecha_ingreso DESC');
    return filas;
  },

  async bitacora(limite = 100) {
    const [filas] = await pool.query(
      `SELECT b.*, CONCAT_WS(' ', u.nombre, u.apellidos) AS usuario
       FROM bitacora b
       LEFT JOIN usuarios u ON u.id = b.usuario_id
       ORDER BY b.fecha DESC
       LIMIT ?`,
      [Number(limite)],
    );
    return filas;
  },
};
