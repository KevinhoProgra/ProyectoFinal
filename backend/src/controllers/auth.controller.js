import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioModel } from '../models/usuario.model.js';
import { registrar } from '../middlewares/bitacora.js';
import { ErrorApi } from '../utils/ErrorApi.js';

// Login y perfil devuelven exactamente la misma forma, para que el frontend
// pueda restaurar la sesion al recargar sin tener que normalizar nada.
const datosSesion = (usuario, permisos) => ({
  id: usuario.id,
  usuario: usuario.usuario,
  nombre: `${usuario.nombre} ${usuario.apellidos}`,
  rol: usuario.rol,
  permisos,
});

export const authController = {
  async login(req, res) {
    const { usuario, password } = req.body;
    if (!usuario || !password) throw new ErrorApi(400, 'Usuario y contraseña son obligatorios');

    const encontrado = await usuarioModel.buscarPorUsuario(usuario);

    // Mismo mensaje si no existe o si la clave esta mal: no le decimos a un
    // atacante cuales usuarios son validos.
    const valido = encontrado && (await bcrypt.compare(password, encontrado.password_hash));
    if (!valido || !encontrado.activo) {
      await registrar({ accion: 'login_fallido', detalle: `Intento con usuario: ${usuario}`, ip: req.ip });
      throw new ErrorApi(401, 'Usuario o contraseña incorrectos');
    }

    const permisos = await usuarioModel.permisosDe(encontrado.id);
    const token = jwt.sign(
      { id: encontrado.id, usuario: encontrado.usuario, rol: encontrado.rol, permisos },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRA },
    );

    await usuarioModel.registrarAcceso(encontrado.id);
    await registrar({ usuario_id: encontrado.id, accion: 'login_ok', ip: req.ip });

    res.json({ token, usuario: datosSesion(encontrado, permisos) });
  },

  // Sirve para que el frontend valide al recargar la pagina si el token sigue vivo.
  async perfil(req, res) {
    const usuario = await usuarioModel.obtener(req.usuario.id);
    if (!usuario) throw new ErrorApi(404, 'Usuario no encontrado');
    res.json(datosSesion(usuario, req.usuario.permisos));
  },
};
