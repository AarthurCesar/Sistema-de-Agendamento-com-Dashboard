import { Router } from 'express';
import {
  listAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAvailability,
} from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.js';

export const appointmentRoutes = Router();

// Todas as rotas de agendamento exigem autenticação
appointmentRoutes.use(authenticate);

appointmentRoutes.get('/availability', getAvailability);
appointmentRoutes.get('/', listAppointments);
appointmentRoutes.post('/', createAppointment);
appointmentRoutes.patch('/:id/status', updateAppointmentStatus);
