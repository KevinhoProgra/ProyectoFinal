import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexto';

// Envuelve las rutas privadas. Si se le pasa un permiso, ademas verifica que el
// usuario lo tenga; el backend lo revisa igual, esto solo evita mostrar la pantalla.
export function RutaProtegida({ permiso }) {
  const { usuario, cargando, tienePermiso } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">
        Cargando...
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;

  if (permiso && !tienePermiso(permiso)) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <p className="text-4xl">🔒</p>
        <h2 className="text-xl font-bold text-gray-900 mt-3">Sin acceso</h2>
        <p className="text-gray-600 mt-1">
          Tu rol no tiene permiso para ver esta sección.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
