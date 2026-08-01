import { Router } from 'express';

import { verificarToken, requierePermiso } from '../middlewares/auth.js';
import { auditar } from '../middlewares/bitacora.js';
import { crearControladorCrud } from '../controllers/crud.controller.js';
import { crearRutasCrud } from './crud.routes.js';

import { marcaModel, tipoVehiculoModel, estadoVehiculoModel, catalogosCompletos } from '../models/catalogo.model.js';
import { clienteModel } from '../models/cliente.model.js';
import { distribuidorModel } from '../models/distribuidor.model.js';
import { proveedorModel } from '../models/proveedor.model.js';
import { vehiculoModel } from '../models/vehiculo.model.js';
import { repuestoModel } from '../models/repuesto.model.js';
import { usuarioController } from '../controllers/usuario.controller.js';
import { rolController } from '../controllers/rol.controller.js';
import { reporteController } from '../controllers/reporte.controller.js';

import authRoutes from './auth.routes.js';
import rolRoutes from './rol.routes.js';
import ventaRoutes from './venta.routes.js';
import mantenimientoRoutes from './mantenimiento.routes.js';
import reporteRoutes from './reporte.routes.js';

const router = Router();

// --- Rutas publicas ---
router.get('/salud', (req, res) => res.json({ estado: 'ok', servicio: 'empresa-vehiculos-api' }));
router.use('/auth', authRoutes);

// --- De aqui hacia abajo todo exige token y queda registrado en la bitacora ---
router.use(verificarToken);
router.use(auditar);

// Recursos con CRUD estandar: modelo + fabrica de controlador + fabrica de rutas.
const recursos = [
  ['clientes', clienteModel, 'Cliente', 'clientes'],
  ['vehiculos', vehiculoModel, 'Vehiculo', 'vehiculos'],
  ['distribuidores', distribuidorModel, 'Distribuidor', 'distribuidores'],
  ['proveedores', proveedorModel, 'Proveedor', 'proveedores'],
  ['repuestos', repuestoModel, 'Repuesto', 'repuestos'],
  ['marcas', marcaModel, 'Marca', 'vehiculos'],
  ['tipos-vehiculo', tipoVehiculoModel, 'Tipo de vehiculo', 'vehiculos'],
  ['estados-vehiculo', estadoVehiculoModel, 'Estado de vehiculo', 'vehiculos'],
];

for (const [ruta, modelo, nombre, modulo] of recursos) {
  router.use(`/${ruta}`, crearRutasCrud(crearControladorCrud(modelo, nombre), modulo));
}

// Recursos con logica propia.
router.use('/usuarios', crearRutasCrud(usuarioController, 'usuarios'));
router.use('/roles', rolRoutes);
router.use('/ventas', ventaRoutes);
router.use('/mantenimientos', mantenimientoRoutes);
router.use('/reportes', reporteRoutes);

// Auxiliares.
router.get('/catalogos', async (req, res) => res.json(await catalogosCompletos()));
router.get('/permisos', requierePermiso('usuarios.ver'), rolController.catalogoPermisos);
router.get('/bitacora', requierePermiso('bitacora.ver'), reporteController.bitacora);

export default router;
