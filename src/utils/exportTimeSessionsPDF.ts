import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportTimeSessionsPDF(sessions: any[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Time Sessions Report', 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(34, 34, 34);
  const columns = [
    { header: 'Name', dataKey: 'name' },
    { header: 'Description', dataKey: 'description' },
    { header: 'Tag', dataKey: 'tag' },
    { header: 'Duration (h)', dataKey: 'duration' },
    { header: 'Date', dataKey: 'createdAt' },
  ];
  const rows = sessions.map(s => ({
    name: s.name,
    description: s.description,
    tag: s.tag || 'General',
    duration: (s.duration / 3600).toFixed(2),
    createdAt: s.createdAt ? new Date(s.createdAt).toLocaleString() : '',
  }));
  autoTable(doc, {
    startY: 38,
    columns,
    body: rows,
    headStyles: {
      fillColor: [17, 24, 39],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'center',
      valign: 'middle',
      cellPadding: 2.5,
      lineWidth: 0.1,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: 34,
      cellPadding: 2,
      halign: 'left',
      valign: 'top',
      lineColor: [220, 220, 220],
      minCellHeight: 7,
      overflow: 'linebreak',
      font: 'helvetica',
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
      textColor: 34,
    },
    columnStyles: {
      name: { cellWidth: 32, halign: 'left' },
      description: { cellWidth: 70, halign: 'left' },
      tag: { cellWidth: 22, halign: 'center' },
      duration: { cellWidth: 24, halign: 'center' },
      createdAt: { cellWidth: 38, halign: 'center' },
    },
    margin: { left: (210 - (32 + 70 + 22 + 24 + 38)) / 2, right: (210 - (32 + 70 + 22 + 24 + 38)) / 2 },
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'left',
      valign: 'top',
      minCellHeight: 7,
      textColor: 34,
    },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const pageNumber = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Page ${pageNumber} of ${pageCount}`, 200, 290, { align: 'right' });
    },
    didParseCell: function (data) {
      if (data.column.dataKey === 'description') {
        data.cell.styles.valign = 'top';
        data.cell.styles.fontStyle = 'normal';
      }
    },
  });
  doc.save('time_sessions.pdf');
}
