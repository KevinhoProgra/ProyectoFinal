import jwt from 'jsonwebtoken';
import { ErrorApi } from '../utils/ErrorApi.js';

// Lee el header "Authorization: Bearer <token>" y deja los datos en req.usuario.
export function verificarToken(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ErrorApi(401, 'No se envió el token de autenticación');

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ErrorApi(401, 'Token inválido o expirado');
  }
  next();
}

// Los permisos viajan dentro del token, asi no hay que consultar la BD en cada peticion.
// Contra: si cambias los permisos de un rol, el usuario debe volver a iniciar sesion.
export function requierePermiso(clave) {
  return (req, res, next) => {
    if (!req.usuario?.permisos?.includes(clave)) {
      throw new ErrorApi(403, `No tienes el permiso requerido: ${clave}`);
    }
    next();
  };
}
