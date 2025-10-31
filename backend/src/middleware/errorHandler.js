import { validationResult } from 'express-validator';

/**
 * Middleware para validar resultados de express-validator
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
}

/**
 * Middleware global de manejo de errores
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Errores de Firebase
  if (err.code?.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      message: getFirebaseErrorMessage(err.code),
      code: err.code,
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: Object.values(err.errors).map(e => e.message),
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Traducir códigos de error de Firebase
 */
function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/email-already-exists': 'El email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/invalid-password': 'Contraseña inválida (mínimo 6 caracteres)',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/weak-password': 'Contraseña débil',
    'auth/id-token-expired': 'Token expirado',
    'auth/invalid-id-token': 'Token inválido',
  };
  
  return messages[code] || 'Error de autenticación';
}

/**
 * Middleware para rutas no encontradas
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}