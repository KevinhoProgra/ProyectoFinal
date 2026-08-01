import TablaCrud from '../Components/TablaCrud';

// Estos tres nombres los busca el backend por texto exacto al facturar
// y al recibir un vehiculo en el taller.
const ESTADOS_QUE_USA_EL_SISTEMA = ['Disponible', 'Vendido', 'En mantenimiento'];

function Catalogos() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
        <p className="text-gray-600 mt-1">
          Listas base que alimentan el formulario de vehículos. Registra al menos una marca,
          un tipo y los estados antes de ingresar vehículos.
        </p>
      </div>

      <TablaCrud
        titulo="Marcas"
        descripcion="Marcas de vehículos con las que trabaja la empresa."
        ruta="/marcas"
        modulo="vehiculos"
        campos={[
          { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
          { nombre: 'pais', etiqueta: 'País' },
          { nombre: 'activo', etiqueta: 'Activa', tipo: 'checkbox' },
        ]}
      />

      <TablaCrud
        titulo="Tipos de vehículo"
        descripcion="Por ejemplo: Sedán, SUV, Pick-up, Motocicleta."
        ruta="/tipos-vehiculo"
        modulo="vehiculos"
        campos={[{ nombre: 'nombre', etiqueta: 'Nombre', requerido: true }]}
      />

      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          El sistema busca estos estados por nombre exacto al vender y al recibir un vehículo
          en el taller: <strong>{ESTADOS_QUE_USA_EL_SISTEMA.join(', ')}</strong>.
          Puedes agregar los que quieras además de esos.
        </div>

        <TablaCrud
          titulo="Estados de vehículo"
          descripcion="En qué situación está cada vehículo dentro del inventario."
          ruta="/estados-vehiculo"
          modulo="vehiculos"
          campos={[{ nombre: 'nombre', etiqueta: 'Nombre', requerido: true }]}
        />
      </div>
    </div>
  );
}

export default Catalogos;
