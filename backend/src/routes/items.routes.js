import express from 'express';
import * as itemsController from '../controllers/items.controller.js';
// import { verifyToken, requireRoles } from '../middleware/auth.js'; // COMENTA ESTA LÍNEA
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
  // verifyToken,  // COMENTADO TEMPORALMENTE
  itemsController.getAllItems
);

/**
 * GET /api/items/alerts
 * Obtener alertas (vencidos, próximos a vencer, bajo stock)
 */
router.get(
  '/alerts',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  itemsController.getAlerts
);

/**
 * GET /api/items/search
 * Buscar medicamentos
 * Query params: ?q=termino
 */
router.get(
  '/search',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  itemsController.searchItems
);

/**
 * GET /api/items/:id
 * Obtener medicamento por ID
 */
router.get(
  '/:id',
  // verifyToken,  // COMENTADO TEMPORALMENTE
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
  // verifyToken,  // COMENTADO TEMPORALMENTE
  // requireRoles('Admin', 'Farmacia'),  // COMENTADO TEMPORALMENTE
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
  // verifyToken,  // COMENTADO TEMPORALMENTE
  // requireRoles('Admin', 'Farmacia'),  // COMENTADO TEMPORALMENTE
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
  // verifyToken,  // COMENTADO TEMPORALMENTE
  // requireRoles('Admin'),  // COMENTADO TEMPORALMENTE
  idParamValidator,
  validateRequest,
  itemsController.deleteItem
);

export default router;