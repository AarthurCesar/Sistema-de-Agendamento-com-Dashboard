import { Router } from 'express';
import { listServices, createService, deleteService } from '../controllers/service.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const serviceRoutes = Router();

// Listagem pública (cliente escolhe o serviço)
serviceRoutes.get('/', listServices);

// Gestão restrita ao admin
serviceRoutes.post('/', authenticate, authorize('admin'), createService);
serviceRoutes.delete('/:id', authenticate, authorize('admin'), deleteService);
