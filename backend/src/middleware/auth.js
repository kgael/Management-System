import { auth } from '../config/firebase.js';

/**
 * Middleware para verificar token de Firebase
 */
export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verificar token con Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Agregar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'Enfermería', // Custom claim
    };

    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
}

/**
 * Middleware para verificar rol de administrador
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Administrador',
    });
  }
  next();
}

/**
 * Middleware para verificar múltiples roles permitidos
 */
export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
}