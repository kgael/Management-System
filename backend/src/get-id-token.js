// get-id-token.js - Script para obtener ID Token via REST API
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function getIdToken() {
  try {
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    
    if (!apiKey) {
      console.log('❌ FIREBASE_WEB_API_KEY no encontrada en .env');
      console.log('💡 Obtén la API Key de: Firebase Console > Configuración del proyecto > Configuración general > Claves de API');
      return;
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'enfermeria@clinica.com',
        password: 'Enfermeria1234',
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ Error de autenticación:', data.error.message);
      return;
    }

    console.log('🎫 **ID TOKEN PARA THUNDER CLIENT**:');
    console.log('=' .repeat(70));
    console.log(data.idToken);
    console.log('=' .repeat(70));
    console.log('\n📋 Este es un ID Token válido para usar en Authorization header');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getIdToken();