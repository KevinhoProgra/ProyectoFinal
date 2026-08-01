import 'dotenv/config';
import app from './app.js';
import { probarConexion } from './config/db.js';

const PUERTO = process.env.PUERTO ?? 3000;

try {
  await probarConexion();
  app.listen(PUERTO, () => console.log(`API escuchando en http://localhost:${PUERTO}/api`));
} catch (error) {
  console.error('No se pudo iniciar la API:', error.message);
  process.exit(1);
}
