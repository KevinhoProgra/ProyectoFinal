import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/cliente';
import { useAuth } from '../auth/contexto';

const claseCampo =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

// Valores iniciales de un formulario vacio, segun la definicion de los campos.
const formularioVacio = (campos) =>
  Object.fromEntries(campos.map((campo) => [campo.nombre, campo.tipo === 'checkbox' ? true : '']));

/**
 * Tabla con alta, edicion y borrado para cualquier recurso simple de la API.
 * Se configura con `campos`; asi marcas, tipos, estados y distribuidores usan
 * la misma pantalla en vez de repetir cuatro veces el mismo codigo.
 *
 * campos   = [{ nombre, etiqueta, tipo?, requerido?, opciones? }]
 * columnas = opcional, para mostrar en la tabla algo distinto a los campos
 *            (por ejemplo el nombre de la marca en vez de marca_id)
 */
function TablaCrud({ titulo, descripcion, ruta, modulo, campos, columnas }) {
  const { tienePermiso } = useAuth();

  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [datos, setDatos] = useState(null); // null = formulario cerrado
  const [editandoId, setEditandoId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cabeceras = columnas ?? campos.map((campo) => ({ clave: campo.nombre, etiqueta: campo.etiqueta }));

  // Recarga tras guardar o borrar. Los llamadores ya manejan el error.
  const cargar = useCallback(async () => setFilas(await api.get(ruta)), [ruta]);

  // La bandera evita actualizar el estado si el componente ya se desmonto.
  useEffect(() => {
    let vigente = true;
    api.get(ruta)
      .then((datos) => vigente && setFilas(datos))
      .catch((fallo) => vigente && setError(fallo.message))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [ruta]);

  function abrirNuevo() {
    setEditandoId(null);
    setDatos(formularioVacio(campos));
  }

  function abrirEdicion(fila) {
    setEditandoId(fila.id);
    setDatos(Object.fromEntries(campos.map((campo) => [campo.nombre, fila[campo.nombre] ?? ''])));
  }

  function cerrar() {
    setDatos(null);
    setEditandoId(null);
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    // Los campos opcionales vacios se mandan como null, no como cadena vacia.
    const cuerpo = Object.fromEntries(
      campos.map((campo) => {
        const valor = datos[campo.nombre];
        if (campo.tipo === 'checkbox') return [campo.nombre, Boolean(valor)];
        return [campo.nombre, valor === '' ? (campo.requerido ? '' : null) : valor];
      }),
    );

    try {
      if (editandoId) await api.put(`${ruta}/${editandoId}`, cuerpo);
      else await api.post(ruta, cuerpo);
      cerrar();
      await cargar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(fila) {
    const etiqueta = fila.nombre ?? fila.id;
    if (!confirm(`¿Eliminar "${etiqueta}"?`)) return;
    setError('');
    try {
      await api.delete(`${ruta}/${fila.id}`);
      await cargar();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  const mostrar = (fila, clave) => {
    const valor = fila[clave];
    if (typeof valor === 'boolean' || valor === 1 || valor === 0) {
      const campo = campos.find((c) => c.nombre === clave);
      if (campo?.tipo === 'checkbox') return valor ? 'Sí' : 'No';
    }
    return valor === null || valor === '' ? <span className="text-gray-400">—</span> : valor;
  };

  if (cargando) return <p className="text-gray-500">Cargando {titulo.toLowerCase()}...</p>;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
          {descripcion && <p className="text-sm text-gray-600 mt-0.5">{descripcion}</p>}
        </div>
        {tienePermiso(`${modulo}.crear`) && !datos && (
          <button
            onClick={abrirNuevo}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Agregar
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {datos && (
        <form onSubmit={guardar} className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 space-y-4">
          <p className="text-sm font-medium text-gray-700">
            {editandoId ? 'Editando registro' : 'Nuevo registro'}
          </p>

          <div className="flex flex-wrap gap-4">
            {campos.map((campo) => (
              <div key={campo.nombre} className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {campo.etiqueta}{campo.requerido ? ' *' : ''}
                </label>

                {campo.tipo === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(datos[campo.nombre])}
                    onChange={(evento) => setDatos({ ...datos, [campo.nombre]: evento.target.checked })}
                    className="h-5 w-5 mt-2 accent-blue-600"
                  />
                ) : campo.tipo === 'select' ? (
                  <select
                    value={datos[campo.nombre]}
                    onChange={(evento) => setDatos({ ...datos, [campo.nombre]: evento.target.value })}
                    required={campo.requerido}
                    className={claseCampo}
                  >
                    <option value="">Seleccione...</option>
                    {campo.opciones.map((opcion) => (
                      <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={campo.tipo ?? 'text'}
                    value={datos[campo.nombre]}
                    onChange={(evento) => setDatos({ ...datos, [campo.nombre]: evento.target.value })}
                    required={campo.requerido}
                    className={claseCampo}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={cerrar}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
            <tr>
              {cabeceras.map((cabecera) => (
                <th key={cabecera.clave} className="px-4 py-3">{cabecera.etiqueta}</th>
              ))}
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filas.map((fila) => (
              <tr key={fila.id} className="hover:bg-gray-50">
                {cabeceras.map((cabecera) => (
                  <td key={cabecera.clave} className="px-4 py-3">{mostrar(fila, cabecera.clave)}</td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    {tienePermiso(`${modulo}.editar`) && (
                      <button onClick={() => abrirEdicion(fila)} className="text-blue-600 hover:text-blue-800 font-medium">
                        Editar
                      </button>
                    )}
                    {tienePermiso(`${modulo}.eliminar`) && (
                      <button onClick={() => eliminar(fila)} className="text-red-600 hover:text-red-800 font-medium">
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filas.length === 0 && (
              <tr>
                <td colSpan={cabeceras.length + 1} className="px-4 py-8 text-center text-gray-500">
                  Todavía no hay registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TablaCrud;
