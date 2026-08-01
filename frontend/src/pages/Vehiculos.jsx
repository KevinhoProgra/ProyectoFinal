import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/cliente';
import { useAuth } from '../auth/contexto';
import FormularioVehiculo from '../Components/FormularioVehiculo';

const colones = new Intl.NumberFormat('es-CR', {
  style: 'currency', currency: 'CRC', maximumFractionDigits: 0,
});

const COLOR_ESTADO = {
  'Disponible': 'bg-green-100 text-green-800',
  'Reservado': 'bg-yellow-100 text-yellow-800',
  'Vendido': 'bg-blue-100 text-blue-800',
  'En mantenimiento': 'bg-orange-100 text-orange-800',
  'Fuera de servicio': 'bg-red-100 text-red-800',
};

function Vehiculos() {
  const { tienePermiso } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [distribuidores, setDistribuidores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [formulario, setFormulario] = useState(null); // { id } | { id: null } | null

  async function cargarVehiculos() {
    setVehiculos(await api.get('/vehiculos'));
  }

  useEffect(() => {
    Promise.all([
      api.get('/vehiculos'),
      api.get('/catalogos'),
      // El rol Mecanico no tiene permiso de distribuidores: si falla, se sigue sin ellos.
      api.get('/distribuidores').catch(() => []),
    ])
      .then(([listaVehiculos, listaCatalogos, listaDistribuidores]) => {
        setVehiculos(listaVehiculos);
        setCatalogos(listaCatalogos);
        setDistribuidores(listaDistribuidores);
      })
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return vehiculos.filter((vehiculo) => {
      const coincideEstado = !filtroEstado || vehiculo.estado === filtroEstado;
      const coincideTexto =
        !texto ||
        [vehiculo.vin, vehiculo.placa, vehiculo.marca, vehiculo.modelo, vehiculo.color]
          .some((campo) => campo?.toLowerCase().includes(texto));
      return coincideEstado && coincideTexto;
    });
  }, [vehiculos, busqueda, filtroEstado]);

  async function eliminar(vehiculo) {
    if (!confirm(`¿Eliminar el ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa ?? vehiculo.vin})?`)) return;
    try {
      await api.delete(`/vehiculos/${vehiculo.id}`);
      await cargarVehiculos();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  async function alGuardar() {
    setFormulario(null);
    setError('');
    await cargarVehiculos();
  }

  if (cargando) return <p className="text-gray-500">Cargando vehículos...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-600 mt-1">
            {filtrados.length} de {vehiculos.length} vehículos en el inventario.
          </p>
        </div>

        {tienePermiso('vehiculos.crear') && (
          <button
            onClick={() => setFormulario({ id: null })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo vehículo
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por VIN, placa, marca, modelo o color..."
          className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filtroEstado}
          onChange={(evento) => setFiltroEstado(evento.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          {catalogos.estados_vehiculo.map((estado) => (
            <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Kilometraje</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Precio venta</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.map((vehiculo) => (
              <tr key={vehiculo.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{vehiculo.marca} {vehiculo.modelo}</p>
                  <p className="text-xs text-gray-500">
                    {vehiculo.vin}{vehiculo.color ? ` · ${vehiculo.color}` : ''}
                  </p>
                </td>
                <td className="px-4 py-3">{vehiculo.placa ?? <span className="text-gray-400">Sin placa</span>}</td>
                <td className="px-4 py-3">{vehiculo.tipo}</td>
                <td className="px-4 py-3">{vehiculo.anio}</td>
                <td className="px-4 py-3">{vehiculo.kilometraje.toLocaleString('es-CR')} km</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${COLOR_ESTADO[vehiculo.estado] ?? 'bg-gray-100 text-gray-800'}`}>
                    {vehiculo.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{colones.format(vehiculo.precio_venta)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    {tienePermiso('vehiculos.editar') && (
                      <button
                        onClick={() => setFormulario({ id: vehiculo.id })}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                    )}
                    {tienePermiso('vehiculos.eliminar') && (
                      <button
                        onClick={() => eliminar(vehiculo)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  {vehiculos.length === 0
                    ? 'Todavía no hay vehículos registrados.'
                    : 'Ningún vehículo coincide con la búsqueda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formulario && (
        <FormularioVehiculo
          vehiculoId={formulario.id}
          catalogos={catalogos}
          distribuidores={distribuidores}
          alGuardar={alGuardar}
          alCerrar={() => setFormulario(null)}
        />
      )}
    </div>
  );
}

export default Vehiculos;
