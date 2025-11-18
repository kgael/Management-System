// src/utils/dataProvider.js
const API_BASE_URL = 'http://localhost:5000/api';

// Cliente HTTP simple SIN autenticación
async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // REMOVER cualquier header de autorización
  if (config.headers.Authorization) {
    delete config.headers.Authorization;
  }

  if (config.body) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('🔴 API Error en:', endpoint, error.message);
    throw error;
  }
}

// Funciones para items
export async function getItems() {
  try {
    const result = await apiClient('/items');
    return result.data || [];
  } catch (error) {
    console.error('Error obteniendo items:', error.message);
    throw error;
  }
}

export async function createItem(itemData) {
  try {
    const result = await apiClient('/items', {
      method: 'POST',
      body: itemData,
    });
    return result.data;
  } catch (error) {
    console.error('Error creando item:', error.message);
    throw error;
  }
}

export async function updateItem(id, itemData) {
  try {
    const result = await apiClient(`/items/${id}`, {
      method: 'PUT',
      body: itemData,
    });
    return result.data;
  } catch (error) {
    console.error('Error actualizando item:', error.message);
    throw error;
  }
}

export async function deleteItem(id) {
  try {
    const result = await apiClient(`/items/${id}`, {
      method: 'DELETE',
    });
    return result.data;
  } catch (error) {
    console.error('Error eliminando item:', error.message);
    throw error;
  }
}

export async function getAlerts() {
  try {
    const result = await apiClient('/items/alerts');
    return result.data || { vencidos: [], proximos: [], bajos: [] };
  } catch (error) {
    console.error('Error obteniendo alertas:', error.message);
    throw error;
  }
}

export async function searchItems(query) {
  try {
    const result = await apiClient(`/items/search?q=${encodeURIComponent(query)}`);
    return result.data || [];
  } catch (error) {
    console.error('Error buscando items:', error.message);
    throw error;
  }
}

// Funciones para movimientos
export async function getMovements() {
  try {
    const result = await apiClient('/movements');
    return result.data?.movements || [];
  } catch (error) {
    console.error('Error obteniendo movimientos:', error.message);
    throw error;
  }
}

export async function createMovement(movementData) {
  try {
    const result = await apiClient('/movements', {
      method: 'POST',
      body: movementData,
    });
    return result.data;
  } catch (error) {
    console.error('Error creando movimiento:', error.message);
    throw error;
  }
}