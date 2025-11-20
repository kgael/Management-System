// services/movements.service.js - VERSIÓN COMPLETA CORREGIDA
import { db } from '../config/firebase.js';
import { hoyISO, cleanUndefined } from '../utils/helpers.js';
import { getItemById, updateItemQuantity, discardItem } from './items.service.js';

const COLLECTION = 'movements';

/**
 * Crear nuevo movimiento y actualizar stock del item - VERSIÓN CORREGIDA
 */
export async function createMovement(data, userId) {
  try {
    const { itemId, tipo, cantidad, responsable, nota } = data;

    // Validaciones
    if (!itemId) throw new Error('ID del item requerido');
    
    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      throw new Error('Cantidad debe ser un número positivo');
    }

    // Obtener item actual
    const item = await getItemById(itemId);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    if (item.descartado) {
      throw new Error('No se pueden hacer movimientos en items descartados');
    }

    // Validar stock para salidas
    if (tipo === 'salida' && item.cantidad < cantidadNum) {
      throw new Error(`Stock insuficiente. Disponible: ${item.cantidad}, Solicitado: ${cantidadNum}`);
    }

    // Calcular nueva cantidad
    let nuevaCantidad = item.cantidad;
    switch (tipo) {
      case 'entrada':
        nuevaCantidad = item.cantidad + cantidadNum;
        break;
      case 'salida':
        nuevaCantidad = Math.max(0, item.cantidad - cantidadNum);
        break;
      case 'descarte':
        nuevaCantidad = 0;
        break;
      default:
        throw new Error('Tipo de movimiento inválido');
    }

    console.log(`🔢 Cálculo de stock: ${item.cantidad} ${tipo === 'entrada' ? '+' : '-'} ${cantidadNum} = ${nuevaCantidad}`);

    // Crear el movimiento
    const movementData = {
      itemId,
      itemNombre: item.nombre,
      tipo,
      cantidad: cantidadNum,
      responsable: responsable || '—',
      fecha: hoyISO(),
      nota: nota || '',
      stockAnterior: item.cantidad,
      stockNuevo: nuevaCantidad,
      createdAt: new Date(),
      createdBy: userId,
    };

    const docRef = await db.collection(COLLECTION).add(cleanUndefined(movementData));

    // Actualizar cantidad del item según el tipo de movimiento
    switch (tipo) {
      case 'entrada':
      case 'salida':
        await updateItemQuantity(itemId, nuevaCantidad, responsable);
        break;
      case 'descarte':
        await discardItem(itemId, responsable);
        break;
    }

    return {
      id: docRef.id,
      ...movementData,
      stockActual: nuevaCantidad,
    };
  } catch (error) {
    console.error('❌ Error en createMovement:', error);
    throw error;
  }
}

/**
 * Obtener todos los movimientos con paginación
 */
export async function getAllMovements(options = {}) {
  try {
    const { limit = 50, page = 1, itemId } = options;

    let query = db.collection(COLLECTION).orderBy('createdAt', 'desc');

    // Filtrar por item específico
    if (itemId) {
      query = query.where('itemId', '==', itemId);
    }

    // Paginación
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const snapshot = await query.get();

    const movements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Contar total (para paginación)
    const totalQuery = itemId 
      ? db.collection(COLLECTION).where('itemId', '==', itemId)
      : db.collection(COLLECTION);
    
    const totalSnapshot = await totalQuery.count().get();
    const total = totalSnapshot.data().count;

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener movimiento por ID
 */
export async function getMovementById(id) {
  try {
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      throw new Error('Movimiento no encontrado');
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener movimientos de un item específico
 */
export async function getMovementsByItem(itemId, limit = 20) {
  try {
    const snapshot = await db.collection(COLLECTION)
      .where('itemId', '==', itemId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener estadísticas de movimientos
 */
export async function getMovementsStats(startDate, endDate) {
  try {
    let query = db.collection(COLLECTION);

    if (startDate) {
      query = query.where('fecha', '>=', startDate);
    }

    if (endDate) {
      query = query.where('fecha', '<=', endDate);
    }

    const snapshot = await query.get();
    const movements = snapshot.docs.map(doc => doc.data());

    const stats = {
      total: movements.length,
      entradas: movements.filter(m => m.tipo === 'entrada').length,
      salidas: movements.filter(m => m.tipo === 'salida').length,
      descartes: movements.filter(m => m.tipo === 'descarte').length,
      cantidadTotalEntradas: movements
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + m.cantidad, 0),
      cantidadTotalSalidas: movements
        .filter(m => m.tipo === 'salida')
        .reduce((sum, m) => sum + m.cantidad, 0),
    };

    return stats;
  } catch (error) {
    throw error;
  }
}

/**
 * Eliminar movimiento (no recomendado - solo para admin)
 */
export async function deleteMovement(id) {
  try {
    await db.collection(COLLECTION).doc(id).delete();
    return { success: true };
  } catch (error) {
    throw error;
  }
}