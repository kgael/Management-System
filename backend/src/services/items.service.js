// services/items.service.js - VERSIÓN COMPLETA CORREGIDA
import { db } from '../config/firebase.js';
import { cleanUndefined, estaVencido, proximoAVencer } from '../utils/helpers.js';

const COLLECTION = 'items';

/**
 * Crear nuevo medicamento
 */
export async function createItem(data, userId) {
  try {
    const itemData = {
      nombre: data.nombre,
      lote: data.lote,
      caducidad: data.caducidad,
      unidad: data.unidad || '',
      cantidad: Number(data.cantidad) || 0,
      minimo: Number(data.minimo) || 0,
      descartado: false,
      responsableUltimo: data.responsable || '—',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };

    const docRef = await db.collection(COLLECTION).add(cleanUndefined(itemData));

    return {
      id: docRef.id,
      ...itemData,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener todos los items
 */
export async function getAllItems(filters = {}) {
  try {
    let query = db.collection(COLLECTION);

    // Filtros opcionales
    if (filters.descartado !== undefined) {
      query = query.where('descartado', '==', filters.descartado);
    }

    const snapshot = await query.orderBy('nombre').get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener item por ID
 */
export async function getItemById(id) {
  try {
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      throw new Error('Item no encontrado');
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
 * Actualizar item - VERSIÓN CORREGIDA
 * NO permite modificar cantidad directamente
 */
export async function updateItem(id, data, userId) {
  try {
    // Campos que NO se pueden modificar directamente
    const { cantidad, responsableUltimo, ...allowedData } = data;
    
    const updateData = {
      ...cleanUndefined(allowedData),
      updatedAt: new Date(),
    };

    // Solo actualizar si hay campos permitidos para modificar
    if (Object.keys(updateData).length > 1) { // Siempre tiene updatedAt
      await db.collection(COLLECTION).doc(id).update(updateData);
    }

    return await getItemById(id);
  } catch (error) {
    throw error;
  }
}

/**
 * Actualizar cantidad de un item - ÚNICO lugar donde se modifica cantidad
 */
export async function updateItemQuantity(id, newQuantity, responsable) {
  try {
    const quantity = Number(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error('Cantidad inválida');
    }

    await db.collection(COLLECTION).doc(id).update({
      cantidad: quantity,
      responsableUltimo: responsable || '—',
      updatedAt: new Date(),
    });

    return await getItemById(id);
  } catch (error) {
    throw error;
  }
}

/**
 * Marcar item como descartado
 */
export async function discardItem(id, responsable) {
  try {
    await db.collection(COLLECTION).doc(id).update({
      descartado: true,
      cantidad: 0,
      responsableUltimo: responsable || '—',
      updatedAt: new Date(),
    });

    return await getItemById(id);
  } catch (error) {
    throw error;
  }
}

/**
 * Eliminar item (soft delete - marcar como descartado)
 */
export async function deleteItem(id) {
  try {
    await db.collection(COLLECTION).doc(id).update({
      descartado: true,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener alertas (vencidos, próximos a vencer, bajo stock)
 */
export async function getAlerts() {
  try {
    const items = await getAllItems({ descartado: false });

    const vencidos = items.filter(item => estaVencido(item.caducidad));
    const proximos = items.filter(item => proximoAVencer(item.caducidad));
    const bajos = items.filter(item => item.cantidad <= item.minimo);

    return {
      vencidos,
      proximos,
      bajos,
      total: items.length,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Buscar items por término
 */
export async function searchItems(searchTerm) {
  try {
    const items = await getAllItems({ descartado: false });
    const term = searchTerm.toLowerCase().trim();

    if (!term) return items;

    return items.filter(item => 
      item.nombre.toLowerCase().includes(term) ||
      item.lote.toLowerCase().includes(term) ||
      (item.unidad && item.unidad.toLowerCase().includes(term))
    );
  } catch (error) {
    throw error;
  }
}