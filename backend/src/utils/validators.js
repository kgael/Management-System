import { body, param, query } from 'express-validator';

// Validadores para autenticación
export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('role')
    .isIn(['Admin', 'Enfermería', 'Farmacia'])
    .withMessage('Rol inválido'),
];

// Validadores para items
export const createItemValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('lote')
    .trim()
    .notEmpty()
    .withMessage('El lote es requerido'),
  body('caducidad')
    .isISO8601()
    .withMessage('Fecha de caducidad inválida (formato: YYYY-MM-DD)'),
  body('unidad')
    .optional()
    .trim(),
  body('cantidad')
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  body('minimo')
    .isInt({ min: 0 })
    .withMessage('El mínimo debe ser un número entero positivo'),
  body('responsable')
    .optional()
    .trim(),
];

export const updateItemValidator = [
  param('id')
    .notEmpty()
    .withMessage('ID del item requerido'),
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('lote')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El lote no puede estar vacío'),
  body('caducidad')
    .optional()
    .isISO8601()
    .withMessage('Fecha de caducidad inválida'),
  body('cantidad')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  body('minimo')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El mínimo debe ser un número entero positivo'),
];

// Validadores para movimientos
export const createMovementValidator = [
  body('itemId')
    .notEmpty()
    .withMessage('El ID del item es requerido'),
  body('tipo')
    .isIn(['entrada', 'salida', 'descarte'])
    .withMessage('Tipo de movimiento inválido'),
  body('cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  body('responsable')
    .optional()
    .trim(),
  body('nota')
    .optional()
    .trim(),
];

// Validadores de parámetros
export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('ID requerido'),
];

export const paginationValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser mayor a 0'),
];