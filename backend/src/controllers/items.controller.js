// controllers/items.controller.js - VERSIÓN COMPLETA CORREGIDA
import * as itemsService from '../services/items.service.js';
import { formatSuccess } from '../utils/helpers.js';

/**
 * Crear nuevo medicamento
 */
export async function createItem(req, res, next) {
  try {
    // TEMPORAL: Usar 'system' como usuario por defecto si no hay autenticación
    const userId = req.user ? req.user.uid : 'system';
    
    // Validar que la cantidad sea un número válido
    const cantidad = Number(req.body.cantidad);
    if (isNaN(cantidad) || cantidad < 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser un número válido y positivo'
      });
    }

    const item = await itemsService.createItem(req.body, userId);

    res.status(201).json(
      formatSuccess(item, 'Medicamento creado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener todos los medicamentos
 */
export async function getAllItems(req, res, next) {
  try {
    const { descartado, search } = req.query;

    let items;

    if (search) {
      items = await itemsService.searchItems(search);
    } else {
      const filters = {};
      if (descartado !== undefined) {
        filters.descartado = descartado === 'true';
      }
      items = await itemsService.getAllItems(filters);
    }

    res.json(
      formatSuccess(items, `${items.length} medicamentos encontrados`)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener medicamento por ID
 */
export async function getItemById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await itemsService.getItemById(id);

    res.json(
      formatSuccess(item, 'Medicamento encontrado')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar medicamento - VERSIÓN CORREGIDA
 */
export async function updateItem(req, res, next) {
  try {
    const { id } = req.params;
    
    // No permitir modificar cantidad directamente a través de update
    if (req.body.cantidad !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'No se puede modificar la cantidad directamente. Use los movimientos de entrada/salida.'
      });
    }

    // TEMPORAL: Usar 'system' como usuario por defecto si no hay autenticación
    const userId = req.user ? req.user.uid : 'system';
    
    const item = await itemsService.updateItem(id, req.body, userId);

    res.json(
      formatSuccess(item, 'Medicamento actualizado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar medicamento (soft delete)
 */
export async function deleteItem(req, res, next) {
  try {
    const { id } = req.params;
    await itemsService.deleteItem(id);

    res.json(
      formatSuccess({ id }, 'Medicamento eliminado exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener alertas (vencidos, próximos a vencer, bajo stock)
 */
export async function getAlerts(req, res, next) {
  try {
    const alerts = await itemsService.getAlerts();

    res.json(
      formatSuccess(alerts, 'Alertas obtenidas exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Buscar medicamentos
 */
export async function searchItems(req, res, next) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro de búsqueda "q" es requerido',
      });
    }

    const items = await itemsService.searchItems(q);

    res.json(
      formatSuccess(items, `${items.length} resultados encontrados`)
    );
  } catch (error) {
    next(error);
  }
}