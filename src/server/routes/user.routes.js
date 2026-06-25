import { Router } from 'express';
import { listProfessionals } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

export const userRoutes = Router();

userRoutes.get('/professionals', authenticate, listProfessionals);
