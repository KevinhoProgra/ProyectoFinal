import { useEffect, useState } from 'react';
import { api, guardarToken, borrarToken, obtenerToken } from '../api/cliente';
import { AuthContext } from './contexto';

export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(null);
  // Solo hay que esperar si existe un token que validar.
  const [cargando, setCargando] = useState(() => Boolean(obtenerToken()));

  // Al recargar la pagina el estado de React se pierde, pero el token sigue en
  // localStorage: se le pregunta al backend si todavia sirve.
  useEffect(() => {
    if (!obtenerToken()) return;
    api.get('/auth/perfil')
      .then(setUsuario)
      .catch(() => borrarToken())
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(nombreUsuario, password) {
    const datos = await api.post('/auth/login', { usuario: nombreUsuario, password });
    guardarToken(datos.token);
    setUsuario(datos.usuario);
  }

  function cerrarSesion() {
    borrarToken();
    setUsuario(null);
  }

  const tienePermiso = (clave) => usuario?.permisos?.includes(clave) ?? false;

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  );
}
