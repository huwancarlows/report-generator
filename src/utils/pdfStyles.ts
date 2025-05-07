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
            0: { cellWidth: 30 }, // KRA
            1: { cellWidth: 60 }, // INDICATOR
            2: { cellWidth: 80 }, // OTHER SPECIFICATION
            3: { cellWidth: 40, halign: 'center' as const, valign: 'middle' as const }, // PREVIOUS
            4: { cellWidth: 40, halign: 'center' as const, valign: 'middle' as const }  // CURRENT
        },
        margin: { left: 15, right: 15 },
        showFoot: 'lastPage',
        rowPageBreak: 'auto',
        bodyStyles: {
            minCellHeight: 6,
            valign: 'top' // Align content to top of cell
        },
        didParseCell: function (data: any) {
            // Ensure text wrapping for long content
            if (data.cell.raw && typeof data.cell.raw === 'string') {
                data.cell.styles.cellWidth = 'wrap';

                // Handle hierarchical indentation
                const text = data.cell.raw;
                const level = getIndentationLevel(text);

                // Apply indentation based on level
                if (level > 0) {
                    data.cell.styles.cellPadding = [3, 3 + (level * 4), 3, 3];
                }

                // Style based on content
                if (text.toLowerCase().includes('female')) {
                    data.cell.styles.fontStyle = 'italic';
                    data.cell.styles.textColor = [128, 0, 128]; // Purple color for female entries
                }

                // Style main categories
                if (level === 0 && /^\d+\.\s/.test(text)) {
                    data.cell.styles.fontStyle = 'bold';
                }

                // Style sub-categories
                if (level === 1 && /^\d+\.\d+\.\s/.test(text)) {
                    data.cell.styles.fontStyle = 'bold';
                }

                // Align program/indicator and specification cells to top
                if (data.column.index === 1 || data.column.index === 2) {
                    data.cell.styles.valign = 'top';
                }
            }
        }
    },
    footer: {
        startY: 15,
        signatureSpacing: 10,
        dateSpacing: 25,
        noteSpacing: 35
    }
};

// Helper function to determine indentation level
function getIndentationLevel(text: string): number {
    if (!text) return 0;

    // Count the number of dots in the numbering
    const dotCount = (text.match(/\./g) || []).length;

    // Determine level based on the pattern
    if (/^\d+\.\d+\.\d+\.\d+\./.test(text)) return 3; // Level 4 (e.g., 1.1.1.1)
    if (/^\d+\.\d+\.\d+\./.test(text)) return 2;      // Level 3 (e.g., 1.1.1)
    if (/^\d+\.\d+\./.test(text)) return 1;           // Level 2 (e.g., 1.1)
    if (/^\d+\./.test(text)) return 0;                // Level 1 (e.g., 1)

    return 0;
}

export const tableHeaders = [
    ['KRA', 'INDICATOR', 'OTHER SPECIFICATION', 'PREVIOUS', 'CURRENT'],
    ['', '', '(OUTPUT SPECIFICATION)', 'REPORTING PERIOD', 'REPORTING PERIOD']
];

export const instructions = 'GENERAL INSTRUCTIONS: Provide complete information to this form. Data contained herein should be the total information for the Regional Office, its provincial extension units and district offices. Unless otherwise stated, data required is for the reference month. The reference month covers the first day up to its last day.';

export const note = 'Note: Include in the SPRS a simple LMI Analysis Report (comparing your accomplishment from previous to current. Explain what brought about changes, or any significant changes in the data.) Include documentations and highlights of your activities with explanations of your pix. Narrative reports. Thank you.'; 