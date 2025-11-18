import express from 'express';
import * as itemsController from '../controllers/items.controller.js';
// NOTA: Todas las líneas de verifyToken y requireRoles están comentadas
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
router.get('/', itemsController.getAllItems);

/**
 * GET /api/items/alerts
 * Obtener alertas (vencidos, próximos a vencer, bajo stock)
 */
router.get('/alerts', itemsController.getAlerts);

/**
 * GET /api/items/search
 * Buscar medicamentos
 * Query params: ?q=termino
 */
router.get('/search', itemsController.searchItems);

/**
 * GET /api/items/:id
 * Obtener medicamento por ID
 */
router.get(
  '/:id',
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
  idParamValidator,
  validateRequest,
  itemsController.deleteItem
);

export default router;