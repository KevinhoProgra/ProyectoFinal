import { useEffect, useState } from 'react';
import { api } from '../api/cliente';
import TablaCrud from '../Components/TablaCrud';

function Distribuidores() {
  const [marcas, setMarcas] = useState(null);

  // Un distribuidor trabaja para una marca, asi que primero hay que tenerlas.
  useEffect(() => {
    api.get('/catalogos').then((catalogos) => setMarcas(catalogos.marcas)).catch(() => setMarcas([]));
  }, []);

  if (!marcas) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Distribuidores</h1>
        <p className="text-gray-600 mt-1">Personas que distribuyen vehículos de una marca.</p>
      </div>

      {marcas.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          No hay marcas registradas. Agrega al menos una en Catálogos antes de crear un distribuidor.
        </div>
      )}

      <TablaCrud
        titulo="Listado"
        ruta="/distribuidores"
        modulo="distribuidores"
        campos={[
          { nombre: 'cedula', etiqueta: 'Cédula', requerido: true },
          { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
          { nombre: 'apellidos', etiqueta: 'Apellidos', requerido: true },
          { nombre: 'marca_id', etiqueta: 'Marca', tipo: 'select', opciones: marcas, requerido: true },
          { nombre: 'telefono', etiqueta: 'Teléfono' },
          { nombre: 'email', etiqueta: 'Email', tipo: 'email' },
          { nombre: 'activo', etiqueta: 'Activo', tipo: 'checkbox' },
        ]}
        columnas={[
          { clave: 'cedula', etiqueta: 'Cédula' },
          { clave: 'nombre', etiqueta: 'Nombre' },
          { clave: 'apellidos', etiqueta: 'Apellidos' },
          { clave: 'marca', etiqueta: 'Marca' },
          { clave: 'telefono', etiqueta: 'Teléfono' },
          { clave: 'email', etiqueta: 'Email' },
        ]}
      />
    </div>
  );
}

export default Distribuidores;
