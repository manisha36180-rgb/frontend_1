import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], title: string, fileName: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title.toUpperCase(), 14, 22);
  
  // Add timestamp
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // Filter data for the table
  const tableData = data.map(item => [
    item.s_no || '',
    item.rule_ref || '',
    item.requirements || '',
    item.ans || '',
    item.comments || ''
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['S/No', 'Ref', 'Requirements', 'Answer', 'Comments']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 20 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 15 },
      4: { cellWidth: 40 }
    }
  });

  doc.save(`${fileName}.pdf`);
};
