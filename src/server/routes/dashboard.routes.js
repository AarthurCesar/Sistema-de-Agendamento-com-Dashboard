import { Router } from 'express';
import {
  getSummary,
  getRevenueByMonth,
  getTopServices,
} from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const dashboardRoutes = Router();

// Dashboard é restrito a admin e profissionais
dashboardRoutes.use(authenticate, authorize('admin', 'professional'));

dashboardRoutes.get('/summary', getSummary);
dashboardRoutes.get('/revenue', getRevenueByMonth);
dashboardRoutes.get('/top-services', getTopServices);
