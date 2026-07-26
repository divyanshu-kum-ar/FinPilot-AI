import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportButtons = ({ filters }) => {
  const { transactions } = useTransactions();
  const { user } = useAuth();
  const [exportingPdf, setExportingPdf] = useState(false);

  const cleanCategory = (cat) => {
    if (!cat) return "";
    // Clean all non-printable ASCII and multi-byte unicode characters (emojis, variation selectors, control characters)
    return cat.replace(/[^\x20-\x7E]/g, '').trim();
  };

  const handleExcelExport = () => {
    const rows = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      Category: cleanCategory(t.category),
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      "Amount (₹)": t.amount,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "Transactions.xlsx");
  };

  const handlePdfExport = async () => {
    setExportingPdf(true);
    let fontBase64 = "";

    try {
      const response = await fetch('/NotoSans-Regular.ttf');
      const contentType = response.headers.get("content-type");
      // Prevent parsing HTML index fallback as binary font
      if (response.ok && contentType && !contentType.includes("html")) {
        const fontBuffer = await response.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(fontBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        fontBase64 = window.btoa(binary);
      }
    } catch (err) {
      console.error("Failed to load NotoSans font: ", err);
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    if (fontBase64 !== "") {
      try {
        doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64);
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
      } catch (err) {
        console.error("Failed to register font in VFS: ", err);
      }
    }

    // Inspect registered fonts dynamically to find any NotoSans variant
    const fontList = doc.getFontList();
    let activeFontName = 'helvetica';

    for (const name of Object.keys(fontList)) {
      if (name.toLowerCase().replace(/\s/g, '').includes('notosans')) {
        activeFontName = name;
        break;
      }
    }

    doc.setFont(activeFontName);
    const useUnicode = activeFontName !== 'helvetica';

    // Consistent currency formatter helper
    const formatCurrency = (val) => {
      const formattedVal = Number(val).toLocaleString('en-IN');
      return useUnicode ? `₹${formattedVal}` : `Rs. ${formattedVal}`;
    };

    // Calculations
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') totalIncome += amt;
      else totalExpense += amt;
    });
    const netBalance = totalIncome - totalExpense;

    // 1. Header Layout
    // Left Header
    doc.setFontSize(20);
    doc.setFont(activeFontName, 'bold');
    doc.setTextColor(12, 18, 44); // primary dark navy
    doc.text("FinPilot AI", 15, 20);

    doc.setFontSize(11);
    doc.setFont(activeFontName, 'normal');
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text("Transaction Report", 15, 26);

    // Right Header - User Details & Metadata
    const ownerName = user?.displayName || 'Divyanshu Kumar';
    const currentMonthName = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const genDateText = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99); // gray-600
    doc.text(`Report Owner: ${ownerName}`, 195, 18, { align: 'right' });
    
    let currentY = 22;
    if (user?.email) {
      doc.text(`Email: ${user.email}`, 195, currentY, { align: 'right' });
      currentY += 4;
    }
    doc.text(`Report Period: ${currentMonthName}`, 195, currentY, { align: 'right' });
    currentY += 4;
    doc.text(`Generated On: ${genDateText}`, 195, currentY, { align: 'right' });

    let lineY = currentY + 4;

    // Optional Filter Details
    if (filters) {
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      let filterText = "Filters Applied:";
      if (filters.period) filterText += `  Period: ${filters.period}`;
      if (filters.type) filterText += `  |  Type: ${filters.type}`;
      if (filters.category) filterText += `  |  Category: ${filters.category}`;
      doc.text(filterText, 15, lineY + 1);
      lineY += 5;
    }

    // Header dividing line
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.line(15, lineY, 195, lineY);

    // 2. Summary Cards Row
    const summaryY = lineY + 5;
    const summaryCards = [
      { 
        label: "Transactions", 
        val: `${transactions.length}`, 
        bg: [241, 245, 249],    // slate-100
        border: [203, 213, 225], // slate-300
        text: [15, 23, 42],      // slate-900
      },
      { 
        label: "Total Income", 
        val: formatCurrency(totalIncome), 
        bg: [209, 250, 229],    // emerald-100
        border: [110, 231, 183], // emerald-300
        text: [6, 78, 59],       // emerald-900
      },
      { 
        label: "Total Expense", 
        val: formatCurrency(totalExpense), 
        bg: [254, 226, 226],    // red-100
        border: [252, 165, 165], // red-300
        text: [127, 29, 29],     // red-900
      },
      { 
        label: "Net Balance", 
        val: formatCurrency(netBalance), 
        bg: [219, 234, 254],    // blue-100
        border: [147, 197, 253], // blue-300
        text: [30, 58, 138],     // blue-900
      }
    ];

    summaryCards.forEach((card, idx) => {
      const startX = 15 + idx * 46; // 42mm card width + 4mm gap
      doc.setDrawColor(card.border[0], card.border[1], card.border[2]);
      doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
      doc.roundedRect(startX, summaryY, 42, 20, 2, 2, 'FD');

      // Label text
      doc.setFontSize(8);
      doc.setTextColor(card.text[0], card.text[1], card.text[2]);
      doc.setFont(activeFontName, 'bold');
      doc.text(card.label, startX + 3.5, summaryY + 5.5);

      // Value text
      doc.setFontSize(10.5);
      doc.setFont(activeFontName, 'normal');
      doc.text(card.val, startX + 3.5, summaryY + 13.5);
    });

    // 3. Transactions Table
    autoTable(doc, {
      startY: summaryY + 26,
      margin: { left: 15, right: 15 },
      styles: {
        font: activeFontName,
        fontSize: 9,
        cellPadding: 3.5,
        lineColor: [229, 231, 235], // subtle row separators
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [12, 18, 44],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 35 },
        1: { halign: 'left', cellWidth: 25 },
        2: { halign: 'left', overflow: 'linebreak' },
        3: { halign: 'right', cellWidth: 35 }
      },
      head: [['Date', 'Type', 'Category', 'Amount']],
      body: transactions.map(t => [
        new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        cleanCategory(t.category),
        formatCurrency(t.amount)
      ]),
      didParseCell: function (data) {
        if (data.section === 'body') {
          const type = data.row.raw[1]; // Type is at index 1
          if (data.column.index === 1 || data.column.index === 3) {
            if (type === 'Income') {
              data.cell.styles.textColor = [16, 185, 129]; // green
            } else if (type === 'Expense') {
              data.cell.styles.textColor = [239, 68, 68]; // red
            }
          }
        }
      }
    });

    // 4. Summary Footer Block
    let finalY = doc.lastAutoTable.finalY || 80;
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    if (finalY + 32 > pageHeight - 15) {
      doc.addPage();
      finalY = 20;
    } else {
      finalY += 10;
    }

    doc.setDrawColor(229, 231, 235);
    doc.line(15, finalY, 195, finalY);
    finalY += 6;

    doc.setFontSize(11);
    doc.setFont(activeFontName, 'bold');
    doc.setTextColor(12, 18, 44);
    doc.text("Report Summary", 15, finalY);
    finalY += 6;

    doc.setFontSize(9);
    doc.setFont(activeFontName, 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text("Total Income:", 15, finalY);
    doc.setFont(activeFontName, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(formatCurrency(totalIncome), 50, finalY);
    finalY += 5;

    doc.setFont(activeFontName, 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text("Total Expense:", 15, finalY);
    doc.setFont(activeFontName, 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text(formatCurrency(totalExpense), 50, finalY);
    finalY += 5;

    doc.setFont(activeFontName, 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text("Net Balance:", 15, finalY);
    doc.setFont(activeFontName, 'bold');
    if (netBalance >= 0) {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(formatCurrency(netBalance), 50, finalY);

    // 5. Page Numbering Footers - Second Pass
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.setFont(activeFontName, 'normal');
      const pageText = `FinPilot AI  •  Generated for ${ownerName}  •  Page ${i} of ${pageCount}`;
      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Descriptive Sanitized Filename
    const nameSanitized = ownerName.replace(/[^a-zA-Z0-9]/g, '');
    const periodSanitized = currentMonthName.replace(/\s+/g, '_');
    const filename = `FinPilotAI_Transactions_${nameSanitized}_${periodSanitized}.pdf`;

    doc.save(filename);
    setExportingPdf(false);
  };

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
      <button
        onClick={handleExcelExport}
        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
      >
        <Download className="w-5 h-5 mr-2" />
        Download as Excel (.xlsx)
      </button>
      <button
        onClick={handlePdfExport}
        disabled={exportingPdf}
        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition disabled:opacity-50"
      >
        <Download className="w-5 h-5 mr-2" />
        {exportingPdf ? "Generating..." : "Download as PDF (.pdf)"}
      </button>
    </div>
  );
};

export default ExportButtons;