import express from 'express';
import * as movementsController from '../controllers/movements.controller.js';
// import { verifyToken, requireAdmin } from '../middleware/auth.js'; // COMENTA ESTA LÍNEA
import { validateRequest } from '../middleware/errorHandler.js';
import {
  createMovementValidator,
  idParamValidator,
  paginationValidator,
} from '../utils/validators.js';

const router = express.Router();

/**
 * GET /api/movements
 * Obtener todos los movimientos con paginación
 * Query params: ?limit=50&page=1&itemId=xxx
 */
router.get(
  '/',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  paginationValidator,
  validateRequest,
  movementsController.getAllMovements
);

/**
 * GET /api/movements/stats
 * Obtener estadísticas de movimientos
 * Query params: ?startDate=2024-01-01&endDate=2024-12-31
 */
router.get(
  '/stats',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  movementsController.getMovementsStats
);

/**
 * GET /api/movements/item/:itemId
 * Obtener movimientos de un item específico
 * Query params: ?limit=20
 */
router.get(
  '/item/:itemId',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  movementsController.getMovementsByItem
);

/**
 * GET /api/movements/:id
 * Obtener movimiento por ID
 */
router.get(
  '/:id',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  idParamValidator,
  validateRequest,
  movementsController.getMovementById
);

/**
 * POST /api/movements
 * Registrar nuevo movimiento (todos los roles autenticados)
 */
router.post(
  '/',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  createMovementValidator,
  validateRequest,
  movementsController.createMovement
);

/**
 * DELETE /api/movements/:id
 * Eliminar movimiento (solo Admin - no recomendado)
 */
router.delete(
  '/:id',
  // verifyToken,  // COMENTADO TEMPORALMENTE
  // requireAdmin,  // COMENTADO TEMPORALMENTE
  idParamValidator,
  validateRequest,
  movementsController.deleteMovement
);

export default router;