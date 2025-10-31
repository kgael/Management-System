import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Exportar servicios
export const db = admin.firestore();
export const auth = admin.auth();

// Configuración de Firestore
db.settings({ ignoreUndefinedProperties: true });

export default admin;