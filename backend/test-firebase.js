// test-firebase.js - Versión ES Modules
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 INICIANDO PRUEBAS FIREBASE...\n');
console.log('🔧 Variables de entorno:');
console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

async function testFirebaseConnection() {
  try {
    // Configuración
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    console.log('\n1. 🔐 Inicializando Firebase Admin...');
    
    // Inicializar Firebase
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    console.log('   ✅ Firebase Admin inicializado');

    // 1. Probar autenticación
    console.log('\n2. 👤 Creando usuario de prueba...');
    const testEmail = `test-${Date.now()}@clinica.com`;
    
    const user = await admin.auth().createUser({
      email: testEmail,
      password: '123456',
      displayName: 'Test User'
    });
    console.log('   ✅ Usuario creado:', user.uid);
    
    // 2. Probar custom claims
    console.log('\n3. 🏷️ Estableciendo Custom Claims...');
    await admin.auth().setCustomUserClaims(user.uid, { role: 'Admin' });
    console.log('   ✅ Custom claims establecidos');

    // 3. Probar Firestore
    console.log('\n4. 📁 Probando Firestore...');
    const db = admin.firestore();
    const testDoc = await db.collection('test_connection').add({
      test: true,
      message: 'Conexión exitosa',
      timestamp: new Date(),
      usuario: user.uid
    });
    console.log('   ✅ Documento creado ID:', testDoc.id);
    
    // 4. Leer documento
    const docSnapshot = await testDoc.get();
    console.log('   ✅ Datos del documento:', docSnapshot.data());
    
    // 5. Generar token personalizado
    console.log('\n5. 🎫 Generando Custom Token...');
    const customToken = await admin.auth().createCustomToken(user.uid);
    console.log('   ✅ Custom Token generado');
    console.log('   Token (primeros 50 chars):', customToken.substring(0, 50) + '...');
    
    // 6. Limpiar
    console.log('\n6. 🧹 Limpiando prueba...');
    await testDoc.delete();
    await admin.auth().deleteUser(user.uid);
    console.log('   ✅ Prueba limpiada');
    
    console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
    console.log('\n📋 INSTRUCCIONES PARA THUNDER CLIENT:');
    console.log('1. Usa este token en el header Authorization:');
    console.log('   Authorization: Bearer ' + customToken);
    console.log('\n2. Realiza una petición GET a: http://localhost:5000/api/auth/me');
    
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'app/no-options') {
      console.log('\n💡 POSIBLE SOLUCIÓN: Verifica las variables de entorno en .env');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('\n💡 POSIBLE SOLUCIÓN: La clave privada de Firebase está mal formateada');
      console.log('   Asegúrate de que FIREBASE_PRIVATE_KEY tenga los \\n convertidos a saltos de línea reales.');
    }
  }
}

testFirebaseConnection();