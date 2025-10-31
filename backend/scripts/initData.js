import { db } from '../src/config/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Agregar días a una fecha
 */
function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Datos de prueba para medicamentos
 */
const SAMPLE_ITEMS = [
  {
    nombre: 'Paracetamol 500mg',
    lote: 'PCM-24-091',
    caducidad: addDays(45), // Próximo a vencer
    unidad: 'tab',
    cantidad: 120,
    minimo: 50,
    descartado: false,
    responsableUltimo: 'Sistema',
  },
  {
    nombre: 'Amoxicilina 500mg',
    lote: 'AMX-24-201',
    caducidad: addDays(-5), // Vencido
    unidad: 'cap',
    cantidad: 30,
    minimo: 20,
    descartado: false,
    responsableUltimo: 'Sistema',
  },
  {
    nombre: 'Ibuprofeno 400mg',
    lote: 'IBU-24-333',
    caducidad: addDays(200), // Fecha lejana
    unidad: 'tab',
    cantidad: 15, // Bajo stock
    minimo: 40,
    descartado: false,
    responsableUltimo: 'Sistema',
  },
  {
    nombre: 'Omeprazol 20mg',
    lote: 'OME-24-155',
    caducidad: addDays(120),
    unidad: 'cap',
    cantidad: 80,
    minimo: 30,
    descartado: false,
    responsableUltimo: 'Sistema',
  },
  {
    nombre: 'Losartán 50mg',
    lote: 'LOS-24-088',
    caducidad: addDays(90),
    unidad: 'tab',
    cantidad: 60,
    minimo: 25,
    descartado: false,
    responsableUltimo: 'Sistema',
  },
];

/**
 * Inicializar datos de prueba
 */
async function initializeData() {
  console.log('='.repeat(60));
  console.log('💊 Inicializando Datos de Prueba - Medicamentos');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Verificar si ya hay datos
    const existingItems = await db.collection('items').limit(1).get();
    
    if (!existingItems.empty) {
      console.log('⚠️  Ya existen medicamentos en la base de datos.');
      console.log('');
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question('¿Deseas agregar los datos de prueba de todas formas? (s/n): ', resolve);
      });
      
      rl.close();

      if (answer.toLowerCase() !== 's') {
        console.log('');
        console.log('❌ Operación cancelada');
        process.exit(0);
      }
    }

    console.log('📝 Creando medicamentos de prueba...');
    console.log('');

    for (const item of SAMPLE_ITEMS) {
      const itemData = {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      };

      const docRef = await db.collection('items').add(itemData);
      
      console.log(`✅ ${item.nombre}`);
      console.log(`   - Lote: ${item.lote}`);
      console.log(`   - Caducidad: ${item.caducidad}`);
      console.log(`   - Stock: ${item.cantidad} (mín: ${item.minimo})`);
      console.log(`   - ID: ${docRef.id}`);
      console.log('');
    }

    console.log('='.repeat(60));
    console.log(`✅ ${SAMPLE_ITEMS.length} medicamentos creados exitosamente`);
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Resumen:');
    console.log(`  - 1 medicamento vencido (Amoxicilina)`);
    console.log(`  - 1 medicamento próximo a vencer (Paracetamol)`);
    console.log(`  - 1 medicamento con bajo stock (Ibuprofeno)`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  }
}

// Ejecutar
initializeData();