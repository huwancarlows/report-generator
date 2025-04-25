import { UserOptions } from 'jspdf-autotable';
import { jsPDFOptions } from 'jspdf';

export interface PDFStyles {
    document: jsPDFOptions;
    fonts: {
        header: number;
        subHeader: number;
        normal: number;
        small: number;
    };
    table: UserOptions;
    footer: {
        startY: number;
        signatureSpacing: number;
        dateSpacing: number;
        noteSpacing: number;
    };
}

export const pdfStyles: PDFStyles = {
    document: {
        orientation: 'portrait',
        unit: 'mm' as const,
        format: 'a4',
        compress: true
    },
    fonts: {
        header: 11,
        subHeader: 10,
        normal: 9,
        small: 8
    },
    table: {
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0],
            valign: 'middle',
            minCellHeight: 5
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 20 }, // KRA
            1: { cellWidth: 30 }, // PROGRAM
            2: { cellWidth: 70 }, // INDICATOR
            3: { cellWidth: 35, halign: 'center' }, // PREVIOUS
            4: { cellWidth: 35, halign: 'center' } // CURRENT
        },
        margin: { left: 15, right: 15 },
        showFoot: 'lastPage',
        rowPageBreak: 'auto',
        bodyStyles: {
            minCellHeight: 6
        },
        didParseCell: function (data) {
            // Ensure text wrapping for long content
            if (data.cell.raw && typeof data.cell.raw === 'string' && data.cell.raw.length > 50) {
                data.cell.styles.cellWidth = 'wrap';
            }
        }
    },
    footer: {
        startY: 15, // Space from last table row
        signatureSpacing: 10, // Space between signature lines
        dateSpacing: 25, // Space for date section
        noteSpacing: 35 // Space for the note section
    }
};

export const tableHeaders = [
    ['KRA', 'INDICATOR', 'OTHER SPECIFICATION', 'PREVIOUS REPORTING PERIOD', 'CURRENT REPORTING PERIOD'],
    ['', '', '(OUTPUT SPECIFICATION)', '', '']
];

export const instructions = 'GENERAL INSTRUCTIONS: Provide complete information to this form. Data contained herein should be the total information for the Regional Office, its provincial extension units and district offices. Unless otherwise stated, data required is for the reference month. The reference month covers the first day up to its last day.';

export const note = 'Note: Include in the SPRS a simple LMI Analysis Report (comparing your accomplishment from previous to current. Explain what brought about changes, or any significant changes in the data.) Include documentations and highlights of your activities with explanations of your pix. Narrative reports. Thank you.'; 