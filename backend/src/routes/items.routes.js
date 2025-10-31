import express from 'express';
import * as itemsController from '../controllers/items.controller.js';
import { verifyToken, requireRoles } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import {
  createItemValidator,
  updateItemValidator,
  idParamValidator,
} from '../utils/validators.js';

const router = express.Router();

/**
 * GET /api/items
 * Obtener todos los medicamentos
 * Query params: ?descartado=true/false&search=termino
 */
router.get(
  '/',
  verifyToken,
  itemsController.getAllItems
);

/**
 * GET /api/items/alerts
 * Obtener alertas (vencidos, próximos a vencer, bajo stock)
 */
router.get(
  '/alerts',
  verifyToken,
  itemsController.getAlerts
);

/**
 * GET /api/items/search
 * Buscar medicamentos
 * Query params: ?q=termino
 */
router.get(
  '/search',
  verifyToken,
  itemsController.searchItems
);

/**
 * GET /api/items/:id
 * Obtener medicamento por ID
 */
router.get(
  '/:id',
  verifyToken,
  idParamValidator,
  validateRequest,
  itemsController.getItemById
);

/**
 * POST /api/items
 * Crear nuevo medicamento (Admin y Farmacia)
 */
router.post(
  '/',
  verifyToken,
  requireRoles('Admin', 'Farmacia'),
  createItemValidator,
  validateRequest,
  itemsController.createItem
);

/**
 * PUT /api/items/:id
 * Actualizar medicamento (Admin y Farmacia)
 */
router.put(
  '/:id',
  verifyToken,
  requireRoles('Admin', 'Farmacia'),
  updateItemValidator,
  validateRequest,
  itemsController.updateItem
);

/**
 * DELETE /api/items/:id
 * Eliminar medicamento - soft delete (solo Admin)
 */
router.delete(
  '/:id',
  verifyToken,
  requireRoles('Admin'),
  idParamValidator,
  validateRequest,
  itemsController.deleteItem
);

export default router;