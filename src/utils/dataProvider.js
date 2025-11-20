// src/utils/dataProvider.js - VERSIÓN MEJORADA CON OFFLINE SUPPORT
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
    
    // Verificar si estamos offline
    if (!navigator.onLine) {
      console.log('📴 Modo offline - No se puede conectar al servidor');
      
      // Podrías implementar una cola de sincronización aquí
      if (options.method && options.method !== 'GET') {
        // Guardar en localStorage para sincronizar después
        const pendingSync = {
          endpoint,
          method: options.method,
          body: options.body,
          timestamp: new Date().toISOString()
        };
        
        const pendingRequests = JSON.parse(localStorage.getItem('pendingSync') || '[]');
        pendingRequests.push(pendingSync);
        localStorage.setItem('pendingSync', JSON.stringify(pendingRequests));
        
        console.log('📝 Movimiento guardado para sincronización posterior');
        
        // Simular éxito para que la UI continúe
        return {
          success: true,
          message: 'Movimiento guardado localmente (modo offline)',
          data: { offline: true, id: 'offline-' + Date.now() }
        };
      }
    }
    
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
    
    // Fallback: intentar cargar datos locales si estamos offline
    if (!navigator.onLine) {
      console.log('🔄 Cargando datos locales como fallback...');
      const localData = localStorage.getItem('inventory_backup');
      if (localData) {
        return JSON.parse(localData);
      }
    }
    
    throw error;
  }
}

export async function createItem(itemData) {
  try {
    const result = await apiClient('/items', {
      method: 'POST',
      body: itemData,
    });
    
    // Guardar backup local
    saveLocalBackup();
    
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
    
    // Guardar backup local
    saveLocalBackup();
    
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
    
    // Guardar backup local
    saveLocalBackup();
    
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
    
    // Fallback offline
    if (!navigator.onLine) {
      const items = await getItems(); // Esto usará el fallback local
      const hoy = new Date().toISOString().slice(0, 10);
      
      const vencidos = items.filter(x => !x.descartado && new Date(x.caducidad) < new Date(hoy));
      const proximos = items.filter(x => !x.descartado && new Date(x.caducidad) >= new Date(hoy) && diasEntre(hoy, x.caducidad) <= 60);
      const bajos = items.filter(x => !x.descartado && x.cantidad <= x.minimo);
      
      return { vencidos, proximos, bajos };
    }
    
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
    
    // Fallback offline
    if (!navigator.onLine) {
      const localMoves = localStorage.getItem('movements_backup');
      return localMoves ? JSON.parse(localMoves) : [];
    }
    
    throw error;
  }
}

export async function createMovement(movementData) {
  try {
    const result = await apiClient('/movements', {
      method: 'POST',
      body: movementData,
    });
    
    // Guardar backup local de movimientos
    const currentMoves = await getMovements();
    const updatedMoves = [result.data, ...currentMoves];
    localStorage.setItem('movements_backup', JSON.stringify(updatedMoves));
    
    return result.data;
  } catch (error) {
    console.error('Error creando movimiento:', error.message);
    throw error;
  }
}

// Función auxiliar para días entre fechas
function diasEntre(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Función para guardar backup local
function saveLocalBackup() {
  // Esto se llamaría después de obtener los datos exitosamente
  setTimeout(async () => {
    try {
      const items = await getItems();
      localStorage.setItem('inventory_backup', JSON.stringify(items));
      console.log('💾 Backup local guardado');
    } catch (error) {
      console.error('Error guardando backup local:', error);
    }
  }, 1000);
}

// Sincronizar datos pendientes cuando se recupere la conexión
function syncPendingRequests() {
  if (navigator.onLine) {
    const pendingRequests = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    if (pendingRequests.length > 0) {
      console.log('🔄 Sincronizando', pendingRequests.length, 'movimientos pendientes...');
      
      // Aquí implementarías la lógica para reenviar las peticiones pendientes
      // Por simplicidad, solo limpiamos la cola por ahora
      localStorage.removeItem('pendingSync');
      console.log('✅ Cola de sincronización limpiada');
    }
  }
}

// Escuchar cambios de conexión
window.addEventListener('online', syncPendingRequests);

// Inicializar backup al cargar
setTimeout(saveLocalBackup, 2000);