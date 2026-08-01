import { useAuth } from '../auth/contexto';

function Navbar() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between shadow-sm">
      <header className="flex items-center gap-2">
        <span className="text-xl">🚗</span>
        <h2 className="text-xl font-bold text-blue-600 tracking-wide">AutoInventory</h2>
      </header>

      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="font-medium text-gray-700 text-sm">{usuario.nombre}</p>
          <p className="text-xs text-gray-500">{usuario.rol}</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
