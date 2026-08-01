import { Router } from 'express';
import { rolController } from '../controllers/rol.controller.js';
import { crearRutasCrud } from './crud.routes.js';
import { requierePermiso } from '../middlewares/auth.js';

const router = Router();

// Gestion de permisos del rol (pantalla de administracion).
router.get('/:id/permisos', requierePermiso('usuarios.ver'), rolController.permisos);
router.put('/:id/permisos', requierePermiso('usuarios.editar'), rolController.asignarPermisos);

router.use(crearRutasCrud(rolController, 'usuarios'));

export default router;
