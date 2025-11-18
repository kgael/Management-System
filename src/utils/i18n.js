// Servicio de internacionalización
class I18nService {
  constructor() {
    this.locale = 'es';
    this.translations = {
      es: {},
      en: {}
    };
    this.init();
  }

  init() {
    // Traducciones en español
    this.translations.es = {
      // Navegación
      navigation: "Navegación",
      inventory: "Inventario",
      movements: "Movimientos", 
      alerts: "Alertas",
      newMedicine: "Nuevo Medicamento",
      registerMovement: "Registrar Movimiento",
      
      // Títulos
      appTitle: "Inventario - Clínica Santa Cruz",
      clinicName: "Clínica Santa Cruz",
      
      // Estados - CAMBIOS AQUÍ
      medicines: "Medicamentos",  // Cambiado de "items"
      expired: "Vencidos",
      expiringSoon: "Próximos a vencer",
      lowStock: "Bajo stock",
      discarded: "Descartado",
      expiredPill: "Vencido",
      expiringPill: "Próx. a vencer",
      lowStockPill: "Bajo stock",
      expiringIn: "Caduca en",
      days: "días",
      fullReport: "Reporte Completo",
      
      // Alertas
      reviewAndDiscard: "Revisar y descartar",
      belowMinimum: "Por debajo del mínimo",
      noElements: "Sin elementos",
      batch: "Lote",
      expires: "Caduca",
      stock: "Stock",
      
      // Acciones
      logout: "Cerrar sesión",
      downloadBackup: "Descargar respaldo",
      downloadAlerts: "Descargar Alertas",
      searchPlaceholder: "Buscar por nombre, lote o unidad...",
      today: "Hoy",
      save: "Guardar",
      register: "Registrar",
      discard: "Descartar",
      output: "Salida",
      input: "Entrada",
      
      // Formularios
      name: "Nombre",
      batch: "Lote", 
      expiration: "Caducidad",
      unit: "Unidad",
      quantity: "Cantidad",
      minimumStock: "Stock mínimo",
      responsible: "Responsable",
      note: "Nota",
      movementType: "Tipo",
      requiredFields: "Los campos con * son obligatorios",
      
      // Login
      username: "Usuario",
      password: "Contraseña",
      login: "Ingresar",
      loginError: "Usuario o contraseña incorrectos",
      
      // Mensajes
      noItems: "Sin medicamentos. Agrega uno nuevo.",
      noMovements: "Sin movimientos",
      loading: "Cargando datos del servidor...",
      connecting: "Conectando con Inventario",
      online: "Conectado",
      offline: "Sin conexión",
      connectionError: "Error de conexión",
      retry: "Reintentar",
      medicine: "Medicamento",
      stock: "Stock",
      status: "Estado",
      actions: "Acciones"
    };

    // Traducciones en inglés
    this.translations.en = {
      // Navigation
      navigation: "Navigation",
      inventory: "Inventory",
      movements: "Movements",
      alerts: "Alerts", 
      newMedicine: "New Medicine",
      registerMovement: "Register Movement",
      
      // Titles
      appTitle: "Inventory - Santa Cruz Clinic",
      clinicName: "Santa Cruz Clinic",
      
      // Status - CAMBIOS AQUÍ
      medicines: "Medicines",  // Cambiado de "items"
      expired: "Expired",
      expiringSoon: "Expiring Soon",
      lowStock: "Low Stock",
      discarded: "Discarded",
      expiredPill: "Expired",
      expiringPill: "Expiring Soon",
      lowStockPill: "Low Stock",
      expiringIn: "Expires in",
      days: "days",
      fullReport: "Full Report",
      
      // Alerts
      reviewAndDiscard: "Review and discard",
      belowMinimum: "Below minimum",
      noElements: "No elements",
      batch: "Batch",
      expires: "Expires",
      stock: "Stock",
      
      // Actions
      logout: "Logout",
      downloadBackup: "Download Backup",
      downloadAlerts: "Download Alerts",
      searchPlaceholder: "Search by name, batch or unit...",
      today: "Today",
      save: "Save",
      register: "Register",
      discard: "Discard",
      output: "Output",
      input: "Input",
      
      // Forms
      name: "Name",
      batch: "Batch",
      expiration: "Expiration", 
      unit: "Unit",
      quantity: "Quantity",
      minimumStock: "Minimum Stock",
      responsible: "Responsible",
      note: "Note",
      movementType: "Type",
      requiredFields: "Fields with * are required",
      
      // Login
      username: "Username",
      password: "Password",
      login: "Login",
      loginError: "Incorrect username or password",
      
      // Messages
      noItems: "No medicines. Add a new one.",
      noMovements: "No movements",
      loading: "Loading server data...",
      connecting: "Connecting to Inventory",
      online: "Online",
      offline: "Offline",
      connectionError: "Connection error",
      retry: "Retry",
      medicine: "Medicine",
      stock: "Stock",
      status: "Status",
      actions: "Actions"
    };
  }

  // Cambiar idioma
  setLocale(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
      localStorage.setItem('preferred_language', locale);
      
      // Disparar evento personalizado para notificar el cambio
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { locale }
      }));
    }
  }

  // Obtener traducción
  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.locale];
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return value;
  }

  // Obtener idioma actual
  getCurrentLocale() {
    return this.locale;
  }

  // Cargar preferencia guardada
  loadSavedLocale() {
    const saved = localStorage.getItem('preferred_language');
    if (saved && this.translations[saved]) {
      this.locale = saved;
    }
    return this.locale;
  }
}

// Crear instancia singleton
const i18n = new I18nService();
export default i18n;