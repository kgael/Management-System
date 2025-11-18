import { jsPDF } from 'jspdf';

// Función simplificada para generar PDF de inventario
export function generateInventoryPDF(items, movements, clinicName = 'Clínica Santa Cruz') {
  try {
    const doc = new jsPDF();
    
    // Agregar título
    doc.setFontSize(20);
    doc.text(`Inventario - ${clinicName}`, 10, 10);
    
    // Agregar fecha
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);
    
    // Agregar items
    let y = 30;
    items.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
      doc.text(`${index + 1}. ${item.nombre} - Lote: ${item.lote} - Stock: ${item.cantidad}`, 10, y);
      y += 10;
    });

    // Guardar el PDF
    doc.save(`inventario_${clinicName}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

// Función simplificada para generar PDF de alertas
export function generateAlertsPDF(vencidos, proximos, bajos, clinicName = 'Clínica Santa Cruz') {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Alertas - ${clinicName}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);
    
    let y = 30;
    
    // Vencidos
    if (vencidos.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Vencidos:', 10, y);
      y += 10;
      doc.setFont(undefined, 'normal');
      vencidos.forEach(item => {
        doc.text(`• ${item.nombre} (Lote: ${item.lote})`, 10, y);
        y += 7;
      });
      y += 5;
    }

    // Próximos a vencer
    if (proximos.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Próximos a vencer:', 10, y);
      y += 10;
      doc.setFont(undefined, 'normal');
      proximos.forEach(item => {
        doc.text(`• ${item.nombre} (Lote: ${item.lote})`, 10, y);
        y += 7;
      });
      y += 5;
    }

    // Bajo stock
    if (bajos.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Bajo stock:', 10, y);
      y += 10;
      doc.setFont(undefined, 'normal');
      bajos.forEach(item => {
        doc.text(`• ${item.nombre} (Stock: ${item.cantidad}, Mínimo: ${item.minimo})`, 10, y);
        y += 7;
      });
    }

    doc.save(`alertas_${clinicName}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generando PDF de alertas:', error);
    throw error;
  }
}