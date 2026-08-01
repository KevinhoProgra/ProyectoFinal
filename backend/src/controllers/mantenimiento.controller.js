import { mantenimientoModel } from '../models/mantenimiento.model.js';
import { crearControladorCrud } from './crud.controller.js';

export const mantenimientoController = {
  ...crearControladorCrud(mantenimientoModel, 'Mantenimiento'),

  // El mecanico responsable es quien esta logueado.
  async crear(req, res) {
    const orden = await mantenimientoModel.crear({ ...req.body, usuario_id: req.usuario.id });
    res.status(201).json(orden);
  },
};
