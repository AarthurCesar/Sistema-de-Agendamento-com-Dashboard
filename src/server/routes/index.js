import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { serviceRoutes } from './service.routes.js';
import { appointmentRoutes } from './appointment.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { userRoutes } from './user.routes.js';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dashboard', dashboardRoutes);
