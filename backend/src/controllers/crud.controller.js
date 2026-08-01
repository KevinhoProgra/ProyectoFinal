import { ErrorApi } from '../utils/ErrorApi.js';

// Genera los 5 handlers estandar a partir de cualquier modelo CRUD.
// Express 5 pasa solo los errores de funciones async al manejador global,
// por eso no hace falta try/catch en cada handler.
export function crearControladorCrud(modelo, nombre = 'Registro') {
  return {
    async listar(req, res) {
      res.json(await modelo.listar());
    },

    async obtener(req, res) {
      const registro = await modelo.obtener(req.params.id);
      if (!registro) throw new ErrorApi(404, `${nombre} no encontrado`);
      res.json(registro);
    },

    async crear(req, res) {
      res.status(201).json(await modelo.crear(req.body));
    },

    async actualizar(req, res) {
      const registro = await modelo.actualizar(req.params.id, req.body);
      if (!registro) throw new ErrorApi(404, `${nombre} no encontrado`);
      res.json(registro);
    },

    async eliminar(req, res) {
      const borrado = await modelo.eliminar(req.params.id);
      if (!borrado) throw new ErrorApi(404, `${nombre} no encontrado`);
      res.status(204).end();
    },
  };
}
