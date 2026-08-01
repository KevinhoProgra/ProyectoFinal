import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/cliente';

const colones = new Intl.NumberFormat('es-CR', {
  style: 'currency', currency: 'CRC', maximumFractionDigits: 0,
});

const TABS = [
  { id: 'resumen', nombre: 'Resumen', icono: '📊' },
  { id: 'ventas', nombre: 'Ventas', icono: '💰' },
  { id: 'vehiculos', nombre: 'Vehículos', icono: '🚗' },
  { id: 'mantenimientos', nombre: 'Mantenimientos', icono: '🔧' },
  { id: 'repuestos', nombre: 'Repuestos Bajo Stock', icono: '⚠️' },
  { id: 'ingresos', nombre: 'Ingresos Mensuales', icono: '📈' },
];

function Reportes() {
  const [tabActiva, setTabActiva] = useState('resumen');
  const [resumen, setResumen] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [filtroVentas, setFiltroVentas] = useState({ estado: '', metodo: '', busqueda: '' });
  const [filtroVehiculos, setFiltroVehiculos] = useState({ estado: '', marca: '', busqueda: '' });
  const [filtroMantenimientos, setFiltroMantenimientos] = useState({ estado: '', busqueda: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError('');
    try {
      const [r, v, ve, m, rep, ing] = await Promise.all([
        api.get('/reportes/resumen'),
        api.get('/reportes/vehiculos'),
        api.get('/reportes/ventas'),
        api.get('/reportes/mantenimientos'),
        api.get('/reportes/repuestos-bajo-stock'),
        api.get('/reportes/ingresos-mensuales'),
      ]);
      setResumen(r);
      setVehiculos(ve);
      setVentas(v);
      setMantenimientos(m);
      setRepuestos(rep);
      setIngresos(ing);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }

  // Filtros aplicados
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const coincideEstado = !filtroVentas.estado || venta.estado === filtroVentas.estado;
      const coincideMetodo = !filtroVentas.metodo || venta.metodo_pago === filtroVentas.metodo;
      const coincideBusqueda =
        !filtroVentas.busqueda ||
        [venta.cliente, venta.vendedor, venta.numero_factura, venta.modelo]
          .some((c) => c?.toLowerCase().includes(filtroVentas.busqueda.toLowerCase()));
      return coincideEstado && coincideMetodo && coincideBusqueda;
    });
  }, [ventas, filtroVentas]);

  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((vehiculo) => {
      const coincideEstado = !filtroVehiculos.estado || vehiculo.estado === filtroVehiculos.estado;
      const coincideMarca = !filtroVehiculos.marca || vehiculo.marca === filtroVehiculos.marca;
      const coincideBusqueda =
        !filtroVehiculos.busqueda ||
        [vehiculo.vin, vehiculo.placa, vehiculo.marca, vehiculo.modelo, vehiculo.color]
          .some((c) => c?.toLowerCase().includes(filtroVehiculos.busqueda.toLowerCase()));
      return coincideEstado && coincideMarca && coincideBusqueda;
    });
  }, [vehiculos, filtroVehiculos]);

  const mantenimientosFiltrados = useMemo(() => {
    return mantenimientos.filter((m) => {
      const coincideEstado = !filtroMantenimientos.estado || m.estado === filtroMantenimientos.estado;
      const coincideBusqueda =
        !filtroMantenimientos.busqueda ||
        [m.cliente, m.vehiculo, m.codigo]
          .some((c) => c?.toLowerCase().includes(filtroMantenimientos.busqueda.toLowerCase()));
      return coincideEstado && coincideBusqueda;
    });
  }, [mantenimientos, filtroMantenimientos]);

  if (cargando) return <p className="text-gray-500">Cargando reportes...</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Analiza información de ventas, inventario y operaciones.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {/* Botón para recargar */}
      <button
        onClick={cargarDatos}
        disabled={cargando}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:bg-blue-300"
      >
        {cargando ? 'Cargando...' : '🔄 Actualizar'}
      </button>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              tabActiva === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icono} {tab.nombre}
          </button>
        ))}
      </div>

      {/* Resumen */}
      {tabActiva === 'resumen' && resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold text-sm">Total Vehículos</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{resumen.total_vehiculos}</p>
            <p className="text-xs text-gray-500 mt-1">{resumen.vehiculos_disponibles} disponibles</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold text-sm">Clientes Activos</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{resumen.clientes_activos}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold text-sm">Ventas Este Mes</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{colones.format(resumen.ventas_del_mes)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold text-sm">Mantenimientos Activos</h3>
            <p className="text-3xl font-bold mt-2 text-orange-600">{resumen.mantenimientos_activos}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold text-sm">Repuestos Bajo Stock</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">{resumen.repuestos_bajo_stock}</p>
          </div>
        </div>
      )}

      {/* Ingresos Mensuales */}
      {tabActiva === 'ingresos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3 text-right">Ventas</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Impuesto</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ingresos.map((fila) => (
                <tr key={fila.periodo} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{fila.periodo}</td>
                  <td className="px-4 py-3 text-right">{fila.cantidad_ventas}</td>
                  <td className="px-4 py-3 text-right">{colones.format(fila.subtotal)}</td>
                  <td className="px-4 py-3 text-right">{colones.format(fila.impuesto)}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{colones.format(fila.total_facturado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ventas */}
      {tabActiva === 'ventas' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
            <input
              value={filtroVentas.busqueda}
              onChange={(e) => setFiltroVentas({ ...filtroVentas, busqueda: e.target.value })}
              placeholder="Buscar por cliente, vendedor, factura o modelo..."
              className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filtroVentas.estado}
              onChange={(e) => setFiltroVentas({ ...filtroVentas, estado: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
            <select
              value={filtroVentas.metodo}
              onChange={(e) => setFiltroVentas({ ...filtroVentas, metodo: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="financiamiento">Financiamiento</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Factura</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.map((venta, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{venta.numero_factura}</td>
                    <td className="px-4 py-3">{new Date(venta.fecha).toLocaleDateString('es-CR')}</td>
                    <td className="px-4 py-3">{venta.cliente}</td>
                    <td className="px-4 py-3">{venta.marca} {venta.modelo}</td>
                    <td className="px-4 py-3">{venta.vendedor}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">{venta.metodo_pago}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        venta.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        venta.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>{venta.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{colones.format(venta.total_linea)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ventasFiltradas.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                {ventas.length === 0 ? 'No hay ventas registradas' : 'Ninguna venta coincide con los filtros'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehículos */}
      {tabActiva === 'vehiculos' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
            <input
              value={filtroVehiculos.busqueda}
              onChange={(e) => setFiltroVehiculos({ ...filtroVehiculos, busqueda: e.target.value })}
              placeholder="Buscar por VIN, placa, marca o modelo..."
              className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filtroVehiculos.estado}
              onChange={(e) => setFiltroVehiculos({ ...filtroVehiculos, estado: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {[...new Set(vehiculos.map(v => v.estado))].map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            <select
              value={filtroVehiculos.marca}
              onChange={(e) => setFiltroVehiculos({ ...filtroVehiculos, marca: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las marcas</option>
              {[...new Set(vehiculos.map(v => v.marca))].map(marca => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">VIN</th>
                  <th className="px-4 py-3">Placa</th>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Año</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Precio Venta</th>
                  <th className="px-4 py-3 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehiculosFiltrados.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{v.vin}</td>
                    <td className="px-4 py-3">{v.placa || '-'}</td>
                    <td className="px-4 py-3">{v.marca} {v.modelo}</td>
                    <td className="px-4 py-3">{v.tipo}</td>
                    <td className="px-4 py-3">{v.anio}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">{v.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{colones.format(v.precio_venta)}</td>
                    <td className="px-4 py-3 text-right">{colones.format(v.margen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehiculosFiltrados.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                {vehiculos.length === 0 ? 'No hay vehículos registrados' : 'Ningún vehículo coincide con los filtros'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mantenimientos */}
      {tabActiva === 'mantenimientos' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
            <input
              value={filtroMantenimientos.busqueda}
              onChange={(e) => setFiltroMantenimientos({ ...filtroMantenimientos, busqueda: e.target.value })}
              placeholder="Buscar por cliente, vehículo o código..."
              className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filtroMantenimientos.estado}
              onChange={(e) => setFiltroMantenimientos({ ...filtroMantenimientos, estado: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="recibido">Recibido</option>
              <option value="en_proceso">En Proceso</option>
              <option value="finalizado">Finalizado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Mecanico</th>
                  <th className="px-4 py-3">Fecha Ingreso</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Mano de Obra</th>
                  <th className="px-4 py-3 text-right">Repuestos</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mantenimientosFiltrados.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.codigo}</td>
                    <td className="px-4 py-3">{m.vehiculo}</td>
                    <td className="px-4 py-3">{m.cliente}</td>
                    <td className="px-4 py-3">{m.mecanico}</td>
                    <td className="px-4 py-3">{new Date(m.fecha_ingreso).toLocaleDateString('es-CR')}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        m.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                        m.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                        m.estado === 'finalizado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{m.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{colones.format(m.monto_mano_obra)}</td>
                    <td className="px-4 py-3 text-right">{colones.format(m.costo_repuestos)}</td>
                    <td className="px-4 py-3 text-right font-bold">{colones.format(m.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mantenimientosFiltrados.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                {mantenimientos.length === 0 ? 'No hay mantenimientos registrados' : 'Ningún mantenimiento coincide con los filtros'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Repuestos Bajo Stock */}
      {tabActiva === 'repuestos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Mínimo</th>
                <th className="px-4 py-3 text-right">Faltante</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repuestos.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 bg-red-50">
                  <td className="px-4 py-3 font-mono text-xs">{r.codigo}</td>
                  <td className="px-4 py-3">{r.nombre}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{r.stock}</td>
                  <td className="px-4 py-3 text-right">{r.stock_minimo}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">{r.faltante}</td>
                  <td className="px-4 py-3">{r.proveedor}</td>
                  <td className="px-4 py-3">{r.telefono || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {repuestos.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              ¡Bien! No hay repuestos bajo stock.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reportes;
