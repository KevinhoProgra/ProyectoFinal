import { crearModeloCrud } from './crud.model.js';

// El listado sale de la vista (marca y tipo ya resueltos a texto);
// obtener() sigue devolviendo la fila cruda con los *_id para el formulario de edicion.
export const vehiculoModel = crearModeloCrud({
  tabla: 'vehiculos',
  campos: [
    'vin', 'placa', 'marca_id', 'modelo', 'anio', 'color',
    'tipo_id', 'estado_id', 'distribuidor_id', 'kilometraje',
    'precio_costo', 'precio_venta',
  ],
  sqlListar: 'SELECT * FROM vw_vehiculos_detalle ORDER BY marca, modelo',
});
