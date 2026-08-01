import { crearModeloCrud } from './crud.model.js';

export const clienteModel = crearModeloCrud({
  tabla: 'clientes',
  campos: ['cedula', 'nombre', 'apellidos', 'email', 'telefono', 'direccion', 'activo'],
  orden: 'apellidos, nombre',
});
