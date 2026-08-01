import { usuarioModel } from '../models/usuario.model.js';
import { crearControladorCrud } from './crud.controller.js';
import { ErrorApi } from '../utils/ErrorApi.js';

export const usuarioController = {
  ...crearControladorCrud(usuarioModel, 'Usuario'),

  // Un usuario no se puede desactivar a si mismo: quedaria fuera del sistema.
  async eliminar(req, res) {
    if (Number(req.params.id) === req.usuario.id) {
      throw new ErrorApi(400, 'No puedes desactivar tu propio usuario');
    }
    const borrado = await usuarioModel.eliminar(req.params.id);
    if (!borrado) throw new ErrorApi(404, 'Usuario no encontrado');
    res.status(204).end();
  },
};
