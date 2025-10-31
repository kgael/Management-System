import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { registerValidator } from '../utils/validators.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (solo admin)
 */
router.post(
  '/register',
  verifyToken,
  requireAdmin,
  registerValidator,
  validateRequest,
  authController.register
);

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
router.get(
  '/me',
  verifyToken,
  authController.getCurrentUser
);

/**
 * GET /api/auth/users
 * Listar todos los usuarios (solo admin)
 */
router.get(
  '/users',
  verifyToken,
  requireAdmin,
  authController.listUsers
);

/**
 * GET /api/auth/users/:uid
 * Obtener usuario por UID (solo admin)
 */
router.get(
  '/users/:uid',
  verifyToken,
  requireAdmin,
  authController.getUserById
);

/**
 * PUT /api/auth/users/:uid/role
 * Actualizar rol de usuario (solo admin)
 */
router.put(
  '/users/:uid/role',
  verifyToken,
  requireAdmin,
  authController.updateRole
);

/**
 * DELETE /api/auth/users/:uid
 * Eliminar usuario (solo admin)
 */
router.delete(
  '/users/:uid',
  verifyToken,
  requireAdmin,
  authController.deleteUser
);

export default router;