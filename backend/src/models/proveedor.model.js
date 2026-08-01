import { crearModeloCrud } from './crud.model.js';

export const proveedorModel = crearModeloCrud({
  tabla: 'proveedores',
  campos: ['cedula_juridica', 'nombre_empresa', 'contacto', 'telefono', 'email', 'direccion', 'activo'],
  orden: 'nombre_empresa',
});
