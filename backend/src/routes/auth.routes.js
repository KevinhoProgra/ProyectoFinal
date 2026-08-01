import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.post('/login', authController.login);
router.get('/perfil', verificarToken, authController.perfil);

export default router;
