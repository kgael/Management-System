/**
 * Obtener fecha actual en formato ISO (YYYY-MM-DD)
 */
export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calcular días entre dos fechas
 */
export function diasEntre(fechaInicio, fechaFin) {
  const d1 = new Date(fechaInicio);
  const d2 = new Date(fechaFin);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Verificar si una fecha está vencida
 */
export function estaVencido(fecha) {
  return new Date(fecha) < new Date(hoyISO());
}

/**
 * Verificar si una fecha está próxima a vencer (≤60 días)
 */
export function proximoAVencer(fecha) {
  const hoy = hoyISO();
  return !estaVencido(fecha) && diasEntre(hoy, fecha) <= 60;
}

/**
 * Limpiar datos undefined antes de guardar en Firestore
 */
export function cleanUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

/**
 * Formatear error para respuesta
 */
export function formatError(error) {
  return {
    success: false,
    message: error.message || 'Error desconocido',
    code: error.code || 'UNKNOWN_ERROR',
  };
}

/**
 * Formatear respuesta exitosa
 */
export function formatSuccess(data, message = 'Operación exitosa') {
  return {
    success: true,
    message,
    data,
  };
}