const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const obtenerToken = () => localStorage.getItem('token');
export const guardarToken = (token) => localStorage.setItem('token', token);
export const borrarToken = () => localStorage.removeItem('token');

/**
 * Unica puerta de salida hacia la API: agrega el token, convierte a JSON
 * y transforma los errores en Error con el mensaje que manda el backend.
 */
export async function peticion(ruta, { metodo = 'GET', cuerpo } = {}) {
  const token = obtenerToken();

  let respuesta;
  try {
    respuesta = await fetch(API + ruta, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API este corriendo.');
  }

  // Token vencido o invalido: se cierra la sesion y se vuelve al login.
  if (respuesta.status === 401 && !ruta.startsWith('/auth/login')) {
    borrarToken();
    window.location.assign('/login');
    throw new Error('La sesion expiro');
  }

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new Error(datos?.mensaje ?? `Error ${respuesta.status}`);
  return datos;
}

export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, cuerpo) => peticion(ruta, { metodo: 'POST', cuerpo }),
  put: (ruta, cuerpo) => peticion(ruta, { metodo: 'PUT', cuerpo }),
  delete: (ruta) => peticion(ruta, { metodo: 'DELETE' }),
};

