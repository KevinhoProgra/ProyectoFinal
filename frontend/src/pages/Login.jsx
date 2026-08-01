import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/contexto';

function Login() {
  const { usuario, cargando, iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const [datos, setDatos] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">Cargando...</div>;
  }
  if (usuario) return <Navigate to="/" replace />;

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value });

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await iniciarSesion(datos.usuario.trim(), datos.password);
      navegar('/', { replace: true });
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-3xl">🚗</span>
            <h1 className="text-3xl font-bold text-blue-600 tracking-wide">AutoInventory</h1>
          </div>

          <form
            onSubmit={enviar}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-5"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900">Iniciar sesión</h2>
              <p className="text-sm text-gray-600 mt-1">Ingresa tus credenciales para continuar.</p>
            </div>

            {error && (
              <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="usuario"
                name="usuario"
                value={datos.usuario}
                onChange={cambiar}
                required
                autoFocus
                autoComplete="username"
                placeholder="admin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={datos.password}
                onChange={cambiar}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      <footer className="bg-white text-center py-3 border-t border-gray-200 text-sm text-gray-500">
        <p>AutoInventory 2026</p>
      </footer>
    </div>
  );
}

export default Login;
