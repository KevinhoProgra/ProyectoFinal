import { Router } from 'express';
import { mantenimientoController } from '../controllers/mantenimiento.controller.js';
import { requierePermiso } from '../middlewares/auth.js';

const router = Router();

// Sin DELETE: una orden se cancela cambiando su estado, no se borra.
router.get('/', requierePermiso('mantenimientos.ver'), mantenimientoController.listar);
router.get('/:id', requierePermiso('mantenimientos.ver'), mantenimientoController.obtener);
router.post('/', requierePermiso('mantenimientos.crear'), mantenimientoController.crear);
router.put('/:id', requierePermiso('mantenimientos.editar'), mantenimientoController.actualizar);

export default router;
