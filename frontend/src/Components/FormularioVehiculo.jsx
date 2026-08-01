import { useEffect, useState } from 'react';
import { api } from '../api/cliente';

const VACIO = {
  vin: '', placa: '', marca_id: '', modelo: '', anio: new Date().getFullYear(),
  color: '', tipo_id: '', estado_id: '', distribuidor_id: '', kilometraje: 0,
  precio_costo: '', precio_venta: '',
};

const claseCampo =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

function Campo({ etiqueta, children, ancho = '' }) {
  return (
    <div className={ancho}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{etiqueta}</label>
      {children}
    </div>
  );
}

/**
 * Modal de alta y edicion. Si recibe vehiculoId consulta el registro crudo
 * (con los *_id), porque el listado viene de una vista que solo trae los nombres.
 */
function FormularioVehiculo({ vehiculoId, catalogos, distribuidores, alGuardar, alCerrar }) {
  const [datos, setDatos] = useState(VACIO);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(Boolean(vehiculoId));
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!vehiculoId) return;
    api.get(`/vehiculos/${vehiculoId}`)
      .then((vehiculo) => setDatos({ ...VACIO, ...vehiculo, placa: vehiculo.placa ?? '', color: vehiculo.color ?? '', distribuidor_id: vehiculo.distribuidor_id ?? '' }))
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false));
  }, [vehiculoId]);

  // Cerrar con Escape. No se cierra al hacer clic afuera para no perder
  // por accidente un formulario a medio llenar.
  useEffect(() => {
    const alPresionar = (evento) => evento.key === 'Escape' && alCerrar();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [alCerrar]);

  const cambiar = (evento) => setDatos({ ...datos, [evento.target.name]: evento.target.value });

  // estados_vehiculo tambien hace falta: la columna estado_id tiene un valor por
  // defecto que apunta a la primera fila, y sin esa fila el INSERT falla.
  const faltantes = [
    ['marcas', catalogos.marcas],
    ['tipos de vehículo', catalogos.tipos_vehiculo],
    ['estados de vehículo', catalogos.estados_vehiculo],
  ].filter(([, lista]) => !lista.length).map(([nombre]) => nombre);

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    // Los <select> y <input> siempre devuelven texto. Las columnas que aceptan
    // NULL se mandan como null; las que son NOT NULL con valor por defecto se
    // omiten, porque mandarlas nulas hace fallar el INSERT.
    const cuerpo = {
      ...datos,
      placa: datos.placa.trim() || null,
      color: datos.color.trim() || null,
      distribuidor_id: datos.distribuidor_id || null,
      kilometraje: datos.kilometraje === '' ? 0 : datos.kilometraje,
    };
    delete cuerpo.id;
    if (!cuerpo.estado_id) delete cuerpo.estado_id;

    try {
      if (vehiculoId) await api.put(`/vehiculos/${vehiculoId}`, cuerpo);
      else await api.post('/vehiculos', cuerpo);
      alGuardar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {vehiculoId ? 'Editar vehículo' : 'Nuevo vehículo'}
          </h2>
          <button onClick={alCerrar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        {cargando ? (
          <p className="p-6 text-gray-500">Cargando...</p>
        ) : (
          <form onSubmit={enviar} className="p-6 space-y-5">
            {error && (
              <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</p>
            )}

            {/* Los catalogos no vienen precargados: se registran desde el sistema. */}
            {faltantes.length > 0 && (
              <p className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
                Faltan catálogos: {faltantes.join(', ')}. Registra al menos uno de cada uno para poder guardar.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Campo etiqueta="Número de serie (VIN) *" ancho="md:col-span-2">
                <input name="vin" value={datos.vin} onChange={cambiar} required maxLength={17} className={claseCampo} />
              </Campo>

              <Campo etiqueta="Placa">
                <input name="placa" value={datos.placa} onChange={cambiar} maxLength={10} className={claseCampo} />
              </Campo>

              <Campo etiqueta="Marca *">
                <select name="marca_id" value={datos.marca_id} onChange={cambiar} required className={claseCampo}>
                  <option value="">Seleccione...</option>
                  {catalogos.marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
              </Campo>

              <Campo etiqueta="Modelo *">
                <input name="modelo" value={datos.modelo} onChange={cambiar} required className={claseCampo} />
              </Campo>

              <Campo etiqueta="Año *">
                <input name="anio" type="number" min={1950} max={2100} value={datos.anio} onChange={cambiar} required className={claseCampo} />
              </Campo>

              <Campo etiqueta="Tipo *">
                <select name="tipo_id" value={datos.tipo_id} onChange={cambiar} required className={claseCampo}>
                  <option value="">Seleccione...</option>
                  {catalogos.tipos_vehiculo.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </Campo>

              <Campo etiqueta="Estado">
                <select name="estado_id" value={datos.estado_id} onChange={cambiar} className={claseCampo}>
                  <option value="">Disponible (por defecto)</option>
                  {catalogos.estados_vehiculo.map((estado) => (
                    <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                  ))}
                </select>
              </Campo>

              <Campo etiqueta="Color">
                <input name="color" value={datos.color} onChange={cambiar} className={claseCampo} />
              </Campo>

              <Campo etiqueta="Kilometraje">
                <input name="kilometraje" type="number" min={0} value={datos.kilometraje} onChange={cambiar} className={claseCampo} />
              </Campo>

              <Campo etiqueta="Distribuidor">
                <select name="distribuidor_id" value={datos.distribuidor_id} onChange={cambiar} className={claseCampo}>
                  <option value="">Sin distribuidor</option>
                  {distribuidores.map((distribuidor) => (
                    <option key={distribuidor.id} value={distribuidor.id}>
                      {distribuidor.nombre} {distribuidor.apellidos} ({distribuidor.marca})
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo etiqueta="Precio de costo *">
                <input name="precio_costo" type="number" min={0} step="0.01" value={datos.precio_costo} onChange={cambiar} required className={claseCampo} />
              </Campo>

              <Campo etiqueta="Precio de venta *">
                <input name="precio_venta" type="number" min={0} step="0.01" value={datos.precio_venta} onChange={cambiar} required className={claseCampo} />
              </Campo>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={alCerrar}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {enviando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FormularioVehiculo;
