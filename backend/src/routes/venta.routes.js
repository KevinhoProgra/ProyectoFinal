import { Router } from 'express';
import { ventaController } from '../controllers/venta.controller.js';
import { requierePermiso } from '../middlewares/auth.js';

const router = Router();

router.get('/', requierePermiso('ventas.ver'), ventaController.listar);
router.get('/:id', requierePermiso('ventas.ver'), ventaController.obtener);
router.post('/', requierePermiso('ventas.crear'), ventaController.crear);
router.put('/:id', requierePermiso('ventas.editar'), ventaController.actualizar);
// DELETE anula la factura, no la borra.
router.delete('/:id', requierePermiso('ventas.eliminar'), ventaController.eliminar);

export default router;
