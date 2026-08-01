import { reporteModel } from '../models/reporte.model.js';

export const reporteController = {
  async resumen(req, res) {
    res.json(await reporteModel.resumen());
  },
  async ingresosMensuales(req, res) {
    res.json(await reporteModel.ingresosMensuales());
  },
  async ventas(req, res) {
    res.json(await reporteModel.ventasDetalle());
  },
  async vehiculos(req, res) {
    res.json(await reporteModel.vehiculos());
  },
  async repuestosBajoStock(req, res) {
    res.json(await reporteModel.repuestosBajoStock());
  },
  async mantenimientos(req, res) {
    res.json(await reporteModel.mantenimientos());
  },
  async bitacora(req, res) {
    res.json(await reporteModel.bitacora(req.query.limite ?? 100));
  },
};
