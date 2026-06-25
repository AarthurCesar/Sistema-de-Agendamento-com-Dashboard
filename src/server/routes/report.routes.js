import { Router } from 'express';
import { appointmentsReport, revenueReport } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const reportRoutes = Router();

// Relatórios restritos a admin e profissionais
reportRoutes.use(authenticate, authorize('admin', 'professional'));

reportRoutes.get('/appointments.csv', appointmentsReport);
reportRoutes.get('/revenue.csv', revenueReport);
