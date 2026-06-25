import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { serviceRoutes } from './service.routes.js';
import { appointmentRoutes } from './appointment.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { userRoutes } from './user.routes.js';
import { reportRoutes } from './report.routes.js';
import { notificationRoutes } from './notification.routes.js';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
