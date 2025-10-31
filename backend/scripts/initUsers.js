import { auth, db } from '../src/config/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

// Usuarios iniciales
const INITIAL_USERS = [
  {
    email: 'admin@clinica.com',
    password: 'Admin123456',
    name: 'Administrador',
    role: 'Admin',
  },
  {
    email: 'enfermeria@clinica.com',
    password: 'Enfermeria1234',
    name: 'Enfermería',
    role: 'Enfermería',
  },
  {
    email: 'farmacia@clinica.com',
    password: 'Farmacia1234',
    name: 'Farmacia',
    role: 'Farmacia',
  },
];

/**
 * Crear un usuario en Firebase Auth y Firestore
 */
async function createUser({ email, password, name, role }) {
  try {
    // Verificar si el usuario ya existe
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`⚠️  Usuario ${email} ya existe. Actualizando...`);
      
      // Actualizar contraseña y custom claims
      await auth.updateUser(userRecord.uid, {
        password,
        displayName: name,
      });
      
      await auth.setCustomUserClaims(userRecord.uid, { role });
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Crear nuevo usuario
        console.log(`➕ Creando usuario ${email}...`);
        userRecord = await auth.createUser({
          email,
          password,
          displayName: name,
        });
        
        // Establecer custom claims (rol)
        await auth.setCustomUserClaims(userRecord.uid, { role });
      } else {
        throw error;
      }
    }

    // Guardar/actualizar en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    console.log(`✅ Usuario ${email} configurado correctamente`);
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Nombre: ${name}`);
    console.log(`   - Rol: ${role}`);
    console.log('');

    return userRecord;
  } catch (error) {
    console.error(`❌ Error creando usuario ${email}:`, error.message);
    throw error;
  }
}

/**
 * Inicializar todos los usuarios
 */
async function initializeUsers() {
  console.log('='.repeat(60));
  console.log('🏥 Inicializando Usuarios - Sistema de Inventario');
  console.log('='.repeat(60));
  console.log('');

  try {
    for (const userData of INITIAL_USERS) {
      await createUser(userData);
    }

    console.log('='.repeat(60));
    console.log('✅ Todos los usuarios fueron creados/actualizados exitosamente');
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 Credenciales de acceso:');
    console.log('');
    INITIAL_USERS.forEach(({ email, password, role }) => {
      console.log(`${role}:`);
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      console.log('');
    });
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  }
}

// Ejecutar
initializeUsers();