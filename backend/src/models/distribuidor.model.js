import { crearModeloCrud } from './crud.model.js';

export const distribuidorModel = crearModeloCrud({
  tabla: 'distribuidores',
  campos: ['cedula', 'nombre', 'apellidos', 'marca_id', 'telefono', 'email', 'activo'],
  sqlListar: `
    SELECT d.*, m.nombre AS marca
    FROM distribuidores d
    JOIN marcas m ON m.id = d.marca_id
    ORDER BY d.apellidos, d.nombre`,
});
