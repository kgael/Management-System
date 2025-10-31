import { auth, db } from '../config/firebase.js';

/**
 * Crear usuario en Firebase Auth y Firestore
 */
export async function createUser({ email, password, name, role }) {
  try {
    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Establecer custom claims (rol)
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Guardar datos adicionales en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      name,
      role,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Login - Verificar credenciales y generar token
 * Nota: El login real se hace en el cliente con Firebase SDK
 * Este método es para obtener info adicional del usuario
 */
export async function getUserData(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    return {
      uid,
      ...userDoc.data(),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener usuario por UID
 */
export async function getUserByUid(uid) {
  try {
    const userRecord = await auth.getUser(uid);
    const userDoc = await db.collection('users').doc(uid).get();

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
      role: userRecord.customClaims?.role,
      ...userDoc.data(),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Actualizar rol de usuario
 */
export async function updateUserRole(uid, newRole) {
  try {
    // Actualizar custom claims
    await auth.setCustomUserClaims(uid, { role: newRole });

    // Actualizar en Firestore
    await db.collection('users').doc(uid).update({
      role: newRole,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Listar todos los usuarios
 */
export async function listUsers() {
  try {
    const usersSnapshot = await db.collection('users').get();
    
    return usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Eliminar usuario
 */
export async function deleteUser(uid) {
  try {
    // Eliminar de Firebase Auth
    await auth.deleteUser(uid);

    // Eliminar de Firestore
    await db.collection('users').doc(uid).delete();

    return { success: true };
  } catch (error) {
    throw error;
  }
}