import express from 'express';
import cors from 'cors';
import rutas from './routes/index.js';
import { noEncontrado, manejadorErrores } from './middlewares/errores.js';

const app = express();

// Solo el frontend declarado en CORS_ORIGEN puede consumir la API.
app.use(cors({ origin: process.env.CORS_ORIGEN.split(',') }));
app.use(express.json());

app.use('/api', rutas);

// Estos dos van siempre al final.
app.use(noEncontrado);
app.use(manejadorErrores);

export default app;
