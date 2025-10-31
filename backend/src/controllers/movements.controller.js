import * as movementsService from '../services/movements.service.js';
import { formatSuccess } from '../utils/helpers.js';

/**
 * Crear nuevo movimiento
 */
export async function createMovement(req, res, next) {
  try {
    // TEMPORAL: Usar 'system' como usuario por defecto si no hay autenticación
    const userId = req.user ? req.user.uid : 'system';
    
    const movement = await movementsService.createMovement(
      req.body,
      userId
    );

    res.status(201).json(
      formatSuccess(movement, 'Movimiento registrado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener todos los movimientos con paginación
 */
export async function getAllMovements(req, res, next) {
  try {
    const { limit, page, itemId } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 50,
      page: page ? parseInt(page) : 1,
      itemId: itemId || null,
    };

    const result = await movementsService.getAllMovements(options);

    res.json(
      formatSuccess(result, `${result.movements.length} movimientos encontrados`)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener movimiento por ID
 */
export async function getMovementById(req, res, next) {
  try {
    const { id } = req.params;
    const movement = await movementsService.getMovementById(id);

    res.json(
      formatSuccess(movement, 'Movimiento encontrado')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener movimientos de un item específico
 */
export async function getMovementsByItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { limit } = req.query;

    const movements = await movementsService.getMovementsByItem(
      itemId,
      limit ? parseInt(limit) : 20
    );

    res.json(
      formatSuccess(movements, `${movements.length} movimientos encontrados`)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas de movimientos
 */
export async function getMovementsStats(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await movementsService.getMovementsStats(
      startDate,
      endDate
    );

    res.json(
      formatSuccess(stats, 'Estadísticas obtenidas exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar movimiento (solo admin)
 */
export async function deleteMovement(req, res, next) {
  try {
    const { id } = req.params;
    await movementsService.deleteMovement(id);

    res.json(
      formatSuccess({ id }, 'Movimiento eliminado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}