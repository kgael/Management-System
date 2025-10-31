import * as authService from '../services/auth.service.js';
import { formatSuccess, formatError } from '../utils/helpers.js';

/**
 * Registrar nuevo usuario (solo admin)
 */
export async function register(req, res, next) {
  try {
    const { email, password, name, role } = req.body;

    const user = await authService.createUser({
      email,
      password,
      name,
      role,
    });

    res.status(201).json(
      formatSuccess(user, 'Usuario creado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener información del usuario actual
 * (El token ya fue verificado por el middleware)
 */
export async function getCurrentUser(req, res, next) {
  try {
    const userData = await authService.getUserData(req.user.uid);

    res.json(
      formatSuccess(userData, 'Usuario obtenido exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener usuario por UID
 */
export async function getUserById(req, res, next) {
  try {
    const { uid } = req.params;
    const user = await authService.getUserByUid(uid);

    res.json(
      formatSuccess(user, 'Usuario encontrado')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar rol de usuario (solo admin)
 */
export async function updateRole(req, res, next) {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    await authService.updateUserRole(uid, role);

    res.json(
      formatSuccess({ uid, role }, 'Rol actualizado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Listar todos los usuarios (solo admin)
 */
export async function listUsers(req, res, next) {
  try {
    const users = await authService.listUsers();

    res.json(
      formatSuccess(users, `${users.length} usuarios encontrados`)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar usuario (solo admin)
 */
export async function deleteUser(req, res, next) {
  try {
    const { uid } = req.params;

    // Prevenir auto-eliminación
    if (uid === req.user.uid) {
      return res.status(400).json(
        formatError({ message: 'No puedes eliminar tu propia cuenta' })
      );
    }

    await authService.deleteUser(uid);

    res.json(
      formatSuccess({ uid }, 'Usuario eliminado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}