// Error con codigo HTTP. El manejador de errores lo convierte en respuesta JSON.
export class ErrorApi extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}
