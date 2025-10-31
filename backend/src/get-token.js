// src/get-token.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔥 Cargar .env primero
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Ahora importar Firebase
import { auth } from './config/firebase.js';

async function getToken() {
  try {
    console.log('🔐 Obteniendo token de prueba...');
    
    // Obtener usuario de enfermería
    const user = await auth.getUserByEmail('enfermeria@clinica.com');
    console.log('👤 Usuario:', user.email);
    
    // Generar token
    const token = await auth.createCustomToken(user.uid);
    
    console.log('\n🎫 **TOKEN PARA THUNDER CLIENT**:');
    console.log('=' .repeat(70));
    console.log(token);
    console.log('=' .repeat(70));
    
    console.log('\n📋 **INSTRUCCIONES EXACTAS**:');
    console.log('1. Copia el token completo de arriba (todas las líneas)');
    console.log('2. En Thunder Client:');
    console.log('   - Ve a la pestaña "Auth"');
    console.log('   - Selecciona "Bearer Token" en el dropdown');
    console.log('   - Pega el token en el campo "Token"');
    console.log('   - URL: http://localhost:5000/api/items');
    console.log('   - Click en "Send"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Asegúrate de que:');
    console.log('   - El archivo .env esté en la carpeta backend/');
    console.log('   - Los usuarios estén inicializados (node scripts/initUsers.js)');
  }
}

getToken();