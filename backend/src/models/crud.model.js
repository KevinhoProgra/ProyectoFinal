import { pool } from '../config/db.js';
import { ErrorApi } from '../utils/ErrorApi.js';

// Deja pasar solo las columnas permitidas: evita que alguien mande
// campos que no le corresponden (por ejemplo rol_id desde un formulario publico).
function filtrar(datos, campos) {
  return Object.fromEntries(
    Object.entries(datos ?? {}).filter(([campo, valor]) => campos.includes(campo) && valor !== undefined),
  );
}

/**
 * Genera las 5 operaciones basicas de una tabla.
 * tabla      nombre real en la BD
 * campos     columnas que el cliente puede enviar
 * sqlListar  consulta opcional para el listado (util cuando hace falta JOIN)
 */
export function crearModeloCrud({ tabla, campos, sqlListar, orden = 'id' }) {
  return {
    async listar() {
      const [filas] = await pool.query(sqlListar ?? `SELECT * FROM ${tabla} ORDER BY ${orden}`);
      return filas;
    },

    // Devuelve la fila cruda (con los *_id), que es lo que necesita un formulario de edicion.
    async obtener(id) {
      const [filas] = await pool.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id]);
      return filas[0] ?? null;
    },

    async crear(datos) {
      const limpio = filtrar(datos, campos);
      if (!Object.keys(limpio).length) throw new ErrorApi(400, 'No se envió ningún campo válido');

      const [resultado] = await pool.query(`INSERT INTO ${tabla} SET ?`, [limpio]);
      return this.obtener(resultado.insertId);
    },

    async actualizar(id, datos) {
      const limpio = filtrar(datos, campos);
      if (!Object.keys(limpio).length) throw new ErrorApi(400, 'No se envió ningún campo válido');

      const [resultado] = await pool.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [limpio, id]);
      return resultado.affectedRows ? this.obtener(id) : null;
    },

    async eliminar(id) {
      const [resultado] = await pool.query(`DELETE FROM ${tabla} WHERE id = ?`, [id]);
      return resultado.affectedRows > 0;
    },
  };
}
