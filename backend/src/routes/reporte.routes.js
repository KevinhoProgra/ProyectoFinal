import { Router } from 'express';
import { reporteController } from '../controllers/reporte.controller.js';
import { requierePermiso } from '../middlewares/auth.js';

const router = Router();

router.get('/resumen', requierePermiso('reportes.ver'), reporteController.resumen);
router.get('/ingresos-mensuales', requierePermiso('reportes.ver'), reporteController.ingresosMensuales);
router.get('/ventas', requierePermiso('reportes.ver'), reporteController.ventas);
router.get('/vehiculos', requierePermiso('reportes.ver'), reporteController.vehiculos);
router.get('/repuestos-bajo-stock', requierePermiso('reportes.ver'), reporteController.repuestosBajoStock);
router.get('/mantenimientos', requierePermiso('reportes.ver'), reporteController.mantenimientos);

export default router;
