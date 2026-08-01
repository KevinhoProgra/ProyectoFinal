import { ventaModel } from '../models/venta.model.js';
import { crearControladorCrud } from './crud.controller.js';
import { ErrorApi } from '../utils/ErrorApi.js';

export const ventaController = {
  ...crearControladorCrud(ventaModel, 'Venta'),

  // El vendedor se toma del token, no del body: nadie factura a nombre de otro.
  async crear(req, res) {
    const venta = await ventaModel.crear({ ...req.body, usuario_id: req.usuario.id });
    res.status(201).json(venta);
  },

  async eliminar(req, res) {
    const anulada = await ventaModel.anular(req.params.id);
    if (!anulada) throw new ErrorApi(404, 'Venta no encontrada');
    res.json({ mensaje: 'Venta anulada' });
  },
};
