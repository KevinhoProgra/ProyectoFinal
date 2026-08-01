import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { ErrorApi } from '../utils/ErrorApi.js';

const CAMPOS = ['cedula', 'nombre', 'apellidos', 'usuario', 'email', 'telefono', 'rol_id', 'activo'];
const RONDAS_BCRYPT = 10;

// Nunca se selecciona password_hash salvo en el login.
const SELECT_PUBLICO = `
  SELECT u.id, u.cedula, u.nombre, u.apellidos, u.usuario, u.email, u.telefono,
         u.rol_id, r.nombre AS rol, u.activo, u.ultimo_acceso, u.creado_en
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id`;

function filtrar(datos) {
  return Object.fromEntries(
    Object.entries(datos ?? {}).filter(([campo, valor]) => CAMPOS.includes(campo) && valor !== undefined),
  );
}

export const usuarioModel = {
  async listar() {
    const [filas] = await pool.query(`${SELECT_PUBLICO} ORDER BY u.apellidos, u.nombre`);
    return filas;
  },

  async obtener(id) {
    const [filas] = await pool.query(`${SELECT_PUBLICO} WHERE u.id = ?`, [id]);
    return filas[0] ?? null;
  },

  // Solo para el login: es el unico lugar donde se lee el hash.
  async buscarPorUsuario(usuario) {
    const [filas] = await pool.query(
      `SELECT u.id, u.usuario, u.nombre, u.apellidos, u.password_hash, u.activo, u.rol_id, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.usuario = ?`,
      [usuario],
    );
    return filas[0] ?? null;
  },

  async permisosDe(usuarioId) {
    const [filas] = await pool.query('SELECT permiso FROM vw_permisos_usuario WHERE usuario_id = ?', [usuarioId]);
    return filas.map((fila) => fila.permiso);
  },

  async crear({ password, ...datos }) {
    if (!password || password.length < 8) {
      throw new ErrorApi(400, 'La contraseña es obligatoria y debe tener al menos 8 caracteres');
    }
    const limpio = filtrar(datos);
    limpio.password_hash = await bcrypt.hash(password, RONDAS_BCRYPT);

    const [resultado] = await pool.query('INSERT INTO usuarios SET ?', [limpio]);
    return this.obtener(resultado.insertId);
  },

  async actualizar(id, { password, ...datos }) {
    const limpio = filtrar(datos);
    if (password) {
      if (password.length < 8) throw new ErrorApi(400, 'La contraseña debe tener al menos 8 caracteres');
      limpio.password_hash = await bcrypt.hash(password, RONDAS_BCRYPT);
    }
    if (!Object.keys(limpio).length) throw new ErrorApi(400, 'No se envió ningún campo válido');

    const [resultado] = await pool.query('UPDATE usuarios SET ? WHERE id = ?', [limpio, id]);
    return resultado.affectedRows ? this.obtener(id) : null;
  },

  // Baja logica: si el usuario ya registro ventas, borrarlo de verdad rompe el historial.
  async eliminar(id) {
    const [resultado] = await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },

  async registrarAcceso(id) {
    await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [id]);
  },
};
