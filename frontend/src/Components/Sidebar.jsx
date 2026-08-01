import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/contexto';

// permiso null = visible para cualquier usuario con sesion.
const OPCIONES = [
  { nombre: 'Panel', ruta: '/', icono: '📊', permiso: null },
  { nombre: 'Vehículos', ruta: '/vehiculos', icono: '🚗', permiso: 'vehiculos.ver' },
  { nombre: 'Catálogos', ruta: '/catalogos', icono: '🏷️', permiso: 'vehiculos.ver' },
  { nombre: 'Clientes', ruta: '/clientes', icono: '👥', permiso: 'clientes.ver' },
  { nombre: 'Distribuidores', ruta: '/distribuidores', icono: '🏢', permiso: 'distribuidores.ver' },
  { nombre: 'Proveedores', ruta: '/proveedores', icono: '📦', permiso: 'proveedores.ver' },
  { nombre: 'Repuestos', ruta: '/repuestos', icono: '⚙️', permiso: 'repuestos.ver' },
  { nombre: 'Reportes', ruta: '/reportes', icono: '💰', permiso: 'reportes.ver' },
];

function Sidebar() {
  const { tienePermiso } = useAuth();
  const visibles = OPCIONES.filter((opcion) => !opcion.permiso || tienePermiso(opcion.permiso));

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col p-4 border-r border-slate-800">
      <ul className="space-y-2">
        {visibles.map((opcion) => (
          <li key={opcion.ruta}>
            <NavLink
              to={opcion.ruta}
              end={opcion.ruta === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{opcion.icono}</span>
              <span>{opcion.nombre}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
