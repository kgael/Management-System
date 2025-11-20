import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar rutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
const envPath = path.resolve(__dirname, '../..', '.env');
dotenv.config({ path: envPath });

console.log('🔧 Configurando Firebase Admin...');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);

// Configuración del Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Verificar variables
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  console.error('❌ Faltan variables de entorno de Firebase');
  throw new Error('Configuración de Firebase incompleta');
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error);
    throw error;
  }
}

// Exportar servicios
export const db = admin.firestore();
export const auth = admin.auth();

// Configuración de Firestore
db.settings({ ignoreUndefinedProperties: true });

console.log('✅ Servicios de Firebase exportados');

export default admin;