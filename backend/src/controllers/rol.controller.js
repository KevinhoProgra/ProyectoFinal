import { rolModel, listarPermisos } from '../models/rol.model.js';
import { crearControladorCrud } from './crud.controller.js';
import { ErrorApi } from '../utils/ErrorApi.js';

export const rolController = {
  ...crearControladorCrud(rolModel, 'Rol'),

  async permisos(req, res) {
    res.json(await rolModel.permisosDe(req.params.id));
  },

  async asignarPermisos(req, res) {
    const { permisos } = req.body;
    if (!Array.isArray(permisos)) throw new ErrorApi(400, 'Se espera un arreglo "permisos" con los IDs');
    res.json(await rolModel.asignarPermisos(req.params.id, permisos));
  },

  async catalogoPermisos(req, res) {
    res.json(await listarPermisos());
  },
};
