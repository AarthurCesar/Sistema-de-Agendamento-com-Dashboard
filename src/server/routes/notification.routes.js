import { Router } from 'express';
import { listNotifications } from '../controllers/notification.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const notificationRoutes = Router();

notificationRoutes.use(authenticate, authorize('admin'));
notificationRoutes.get('/', listNotifications);
