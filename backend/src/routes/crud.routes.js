import { Router } from 'express';
import { requierePermiso } from '../middlewares/auth.js';

// Arma las 5 rutas REST de un recurso y les pone el permiso que corresponde.
// modulo debe coincidir con la columna "modulo" de la tabla permisos.
export function crearRutasCrud(controlador, modulo) {
  const router = Router();

  router.get('/', requierePermiso(`${modulo}.ver`), controlador.listar);
  router.get('/:id', requierePermiso(`${modulo}.ver`), controlador.obtener);
  router.post('/', requierePermiso(`${modulo}.crear`), controlador.crear);
  router.put('/:id', requierePermiso(`${modulo}.editar`), controlador.actualizar);
  router.delete('/:id', requierePermiso(`${modulo}.eliminar`), controlador.eliminar);

  return router;
}
