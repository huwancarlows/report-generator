import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { pdfStyles, tableHeaders, instructions, note } from './pdfStyles'
import { format } from 'date-fns'

interface StyleOptions {
    element: HTMLElement;
    styles: Partial<CSSStyleDeclaration>;
}

const addHeaderLogo = (pdf: jsPDF) => {
    // Add DOLE logo placeholder
    pdf.setDrawColor(0);
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(15, 15, 25, 25, 3, 3, 'F');

    // Add header text in official format
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Republic of the Philippines', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('DEPARTMENT OF LABOR AND EMPLOYMENT', pdf.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Regional Office No. X', pdf.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    // Add thick line below header
    pdf.setLineWidth(0.5);
    pdf.line(15, 35, pdf.internal.pageSize.getWidth() - 15, 35);
}

const addWatermark = (pdf: jsPDF) => {
    const pages = pdf.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        pdf.setPage(i);
        pdf.setTextColor(230, 230, 230);
        pdf.setFontSize(60);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DOLE', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() / 2, {
            align: 'center',
            angle: 45
        });
    }
}

const extractTableData = (table: HTMLTableElement) => {
    const headers: string[] = []
    const data: string[][] = []

    // Extract headers
    const headerRow = table.querySelector('thead tr')
    if (headerRow) {
        headerRow.querySelectorAll('th').forEach(th => {
            headers.push(th.textContent?.trim() || '')
        })
    }

    // Extract data rows
    const rows = table.querySelectorAll('tbody tr')
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td')
        const rowData: string[] = []

        cells.forEach((cell, index) => {
            if (index === 0) { // KRA column
                rowData.push(cell.textContent?.trim() || '')
            } else if (index === 1) { // INDICATOR column
                let indicatorText = cell.textContent?.trim() || ''
                let indentLevel = 0
                // Try to extract indicator number (e.g., '1.1.1.1')
                const match = indicatorText.match(/^(\d+(?:\.\d+)*)(.*)$/)
                if (match) {
                    const numberPart = match[1]
                    indentLevel = (numberPart.match(/\./g) || []).length
                    indicatorText = match[0].trim()
                }
                // Add indentation based on level
                const indent = '    '.repeat(indentLevel)
                rowData.push(indent + indicatorText)
            } else if (index === 2) { // SPECIFICATIONS column
                const specDivs = cell.querySelectorAll('div div')
                const specs: string[] = []
                specDivs.forEach((div, i) => {
                    const text = div.textContent?.trim() || ''
                    if (text) {
                        // Add indentation based on level
                        const indent = '  '.repeat(i)
                        specs.push(`${indent}${text}`)
                    }
                })
                rowData.push(specs.join('\n'))
            } else if (index === 3 || index === 4) { // PREVIOUS and CURRENT columns
                const value = cell.textContent?.trim() || '0'
                rowData.push(value)
            }
        })

        data.push(rowData)
    })

    return { headers, data }
}

const extractTextContent = (element: HTMLElement): string => {
    // Remove any script tags
    const clone = element.cloneNode(true) as HTMLElement
    const scripts = clone.getElementsByTagName('script')
    while (scripts[0]) {
        scripts[0].parentNode?.removeChild(scripts[0])
    }

    // Get text conte
    return clone.textContent?.trim() || ''
}

const addHeaderInfo = (pdf: jsPDF, element: HTMLElement) => {
    // Add form title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MONTHLY REPORT ON IMPLEMENTATION OF EMPLOYMENT PROGRAMS', pdf.internal.pageSize.getWidth() / 2, 45, { align: 'center' });

    // Add form reference with specific styling
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('(Revised SPRPS Form 2003-1)', pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });

    // Add reporting period and office in a box
    const reportingInfo = element.querySelectorAll('.mb-4 p')
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, 55, pdf.internal.pageSize.getWidth() - 30, 25, 'F');
    pdf.setDrawColor(0);
    pdf.rect(15, 55, pdf.internal.pageSize.getWidth() - 30, 25, 'S');

    let yPos = 62
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)

    reportingInfo.forEach((info) => {
        const text = info.textContent || ''
        pdf.text(text, 25, yPos)
        yPos += 7
    })

    return yPos + 10
}

const addFooterInfo = (pdf: jsPDF, element: HTMLElement, yPos: number) => {
    const footerSection = element.querySelector('.mt-8')
    if (footerSection) {
        const signatures = footerSection.querySelectorAll('.grid > div')

        pdf.setDrawColor(0);
        pdf.setFontSize(10);

        // Add signature boxes with official styling
        signatures.forEach((sig, index) => {
            const name = sig.querySelector('p:first-child')?.textContent || ''
            const title = sig.querySelector('p:last-child')?.textContent || ''
            const xPos = index === 0 ? 60 : pdf.internal.pageSize.getWidth() - 100

            // Add signature line
            pdf.setLineWidth(0.2);
            pdf.line(xPos - 30, yPos, xPos + 30, yPos);

            // Add name and title
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(name, xPos, yPos + 5, { align: 'center' });

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(title, xPos, yPos + 10, { align: 'center' });
        })

        // Add date in official format
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Date: ${currentDate}`, 20, yPos + 25);
    }
}

const addHeaderToNewPage = (pdf: jsPDF, pageNumber: number, totalPages: number) => {
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(pdfStyles.fonts.subHeader);
    pdf.text('Revised SPRPS Form 2003-1', 15, 15);
    pdf.text('Republic of the Philippines', pageWidth / 2, 15, { align: 'center' });
    pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 25, 15);
};

// Fix margin extraction for left/right
const getMargin = (margin: any) => {
    if (typeof margin === 'object' && margin !== null && 'left' in margin && 'right' in margin) {
        return { left: margin.left, right: margin.right };
    } else if (typeof margin === 'number') {
        return { left: margin, right: margin };
    } else {
        return { left: 15, right: 15 };
    }
};

export const exportToPDF = async (
    reportElement: HTMLElement,
    filename: string,
    onExportStart?: () => void,
    onExportEnd?: () => void,
    isSummary: boolean = false
) => {
    try {
        if (onExportStart) onExportStart();

        if (!reportElement) {
            throw new Error('Report element is required for PDF export');
        }

        // Create PDF document
        const pdf = new jsPDF(pdfStyles.document);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let currentY = 0;

        // Function to check if we need a new page
        const checkForNewPage = (requiredSpace: number) => {
            if (currentY + requiredSpace > pageHeight - 20) {
                pdf.addPage();
                addHeaderToNewPage(pdf, pdf.getNumberOfPages(), pdf.getNumberOfPages());
                currentY = 30; // Reset Y position after header
                return true;
            }
            return false;
        };

        // Get report data and profile information
        const reportDataAttr = reportElement.getAttribute('data-report');
        let profile = null;

        if (reportDataAttr) {
            try {
                const reportData = JSON.parse(reportDataAttr);
                profile = reportData.profile;
            } catch (error) {
                console.error('Error parsing report data:', error);
            }
        }

        // If profile is not found in data-report, try getting from the footer section
        if (!profile) {
            const preparerName = reportElement.querySelector('.prepared-by .text-gray-900.font-medium')?.textContent || '';
            const mayorName = reportElement.querySelector('.approved-by .text-gray-900.font-medium')?.textContent?.replace('HON. ', '') || '';
            profile = {
                name: preparerName,
                municipal_mayor: mayorName
            };
        }

        // Add header to first page
        addHeaderToNewPage(pdf, 1, 1);
        currentY = 25;

        // Add PESO office and DOLE header
        const pesoOffice = reportElement.querySelector('.reporting-office')?.textContent || 'PESO OFFICE';
        const { left: leftMargin, right: rightMargin } = getMargin(pdfStyles.table.margin);
        pdf.setFontSize(pdfStyles.fonts.header);
        pdf.text(pesoOffice, leftMargin, currentY, { align: 'left' });
        pdf.text('DEPARTMENT OF LABOR AND EMPLOYMENT', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        // Add reporting period and regional office
        const reportingPeriod = reportElement.querySelector('.reporting-period')?.textContent || '';
        pdf.text('Monthly Report', leftMargin, currentY, { align: 'left' });
        pdf.text('Regional Office No. X', pageWidth / 2, currentY, { align: 'center' });
        pdf.text(reportingPeriod, rightMargin, currentY, { align: 'right' });
        currentY += 10;

        // Add instructions with proper spacing
        pdf.setFontSize(pdfStyles.fonts.small);
        const splitInstructions = pdf.splitTextToSize(instructions, pageWidth - 30);
        checkForNewPage(splitInstructions.length * 5);
        pdf.text(splitInstructions, 15, currentY);
        currentY += splitInstructions.length * 5 + 10;

        // Get all tables from the report element
        const tables = reportElement.querySelectorAll('table');

        // Process each table
        tables.forEach((table, index) => {
            // Add section header for each form
            const formNumber = index + 1;
            const formTitle = getFormTitle(formNumber);

            // Check if we need a new page for the section header
            checkForNewPage(20);

            // Add section header
            pdf.setFontSize(pdfStyles.fonts.subHeader);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Form ${formNumber}: ${formTitle}`, 15, currentY);
            currentY += 10;

            // Extract and format table data
            const { data } = extractTableData(table);

            // Enhanced table configuration
            const tableConfig = {
                ...pdfStyles.table,
                head: tableHeaders,
                body: data,
                startY: currentY,
                margin: { top: 20, bottom: 20 },
                rowPageBreak: 'auto' as const,
                styles: {
                    fontSize: pdfStyles.fonts.normal,
                    cellPadding: 2,
                    overflow: 'linebreak' as const,
                    halign: 'left' as const,
                    valign: 'middle' as const
                },
                headStyles: {
                    fillColor: [0, 0, 0] as [number, number, number],
                    textColor: [255, 255, 255] as [number, number, number],
                    fontStyle: 'bold' as const
                },
                columnStyles: {
                    0: { cellWidth: 30 }, // KRA
                    1: { cellWidth: 20, cellPadding: 3, overflow: 'linebreak' as const }, // INDICATOR (wider for PROGRAM+INDICATOR)
                    2: { cellWidth: 60 }, // OTHER SPECIFICATION
                    3: {
                        cellWidth: 35,
                        halign: 'center' as const,
                        valign: 'middle' as const,
                        cellPadding: [3, 3, 3, 3]
                    }, // PREVIOUS
                    4: {
                        cellWidth: 35,
                        halign: 'center' as const,
                        valign: 'middle' as const,
                        cellPadding: [3, 3, 3, 3]
                    }  // CURRENT
                },
                bodyStyles: {
                    minCellHeight: 16,
                    cellPadding: [3, 3, 3, 3]
                },
                didDrawPage: (data: any) => {
                    if (data.pageNumber > 1) {
                        addHeaderToNewPage(pdf, data.pageNumber, data.pageCount);
                    }
                    currentY = data.cursor.y;
                },
                didDrawCell: (data: any) => {
                    // For PREVIOUS and CURRENT columns, ensure value is centered vertically and horizontally as a single line
                    if (data.column.index === 3 || data.column.index === 4) {
                        data.cell.styles.valign = 'middle';
                        data.cell.styles.halign = 'center';
                        data.cell.styles.cellPadding = [3, 3, 3, 3];
                    }
                    // Handle multi-line text in OTHER SPECIFICATION column
                    if (data.column.index === 2 && data.cell.text && typeof data.cell.text === 'string') {
                        const lines = data.cell.text.split('\n');
                        if (lines.length > 1) {
                            data.cell.styles.cellPadding = [3, 3, 3, 3];
                            data.cell.styles.valign = 'middle';
                        }
                    }
                }
            };

            // Add table with auto-pagination
            autoTable(pdf, tableConfig);
            currentY = (pdf as any).lastAutoTable.finalY + 20;

            // Add spacing between tables
            currentY += 10;
        });

        // Check if we need a new page for footer
        checkForNewPage(80);

        // Footer section with profile data
        const leftColumn = leftMargin;
        const rightColumn = rightMargin;

        pdf.setFontSize(pdfStyles.fonts.normal);
        pdf.text('PREPARED BY:', leftColumn, currentY, { align: 'left' });
        pdf.text('APPROVED:', rightColumn, currentY, { align: 'right' });
        currentY += 15;

        // Add preparer details using profile data
        pdf.setFontSize(pdfStyles.fonts.subHeader);
        pdf.text(profile?.name || '', leftColumn, currentY, { align: 'left' });
        currentY += 5;
        pdf.setFontSize(pdfStyles.fonts.normal);
        pdf.text('PESO MANAGER - Designate', leftColumn, currentY, { align: 'left' });

        // Add approver details using profile data
        pdf.setFontSize(pdfStyles.fonts.subHeader);
        pdf.text(`HON. ${profile?.municipal_mayor || ''}`, rightColumn, currentY - 5, { align: 'right' });
        pdf.setFontSize(pdfStyles.fonts.normal);
        pdf.text('MUNICIPAL MAYOR', rightColumn, currentY, { align: 'right' });

        currentY += 15;

        // Add dates with proper spacing
        const currentDate = format(new Date(), 'dd-MMM-yy');
        pdf.text(currentDate, leftColumn, currentY, { align: 'left' });
        pdf.text('_______________________________________', rightColumn, currentY, { align: 'right' });
        currentY += 5;
        pdf.text('Date', leftColumn, currentY, { align: 'left' });
        pdf.text('Date', rightColumn, currentY, { align: 'right' });

        currentY += 15;

        // Check if we need a new page for the note
        checkForNewPage(20);

        // Add note at the bottom
        pdf.setFontSize(pdfStyles.fonts.small);
        const splitNote = pdf.splitTextToSize(note, pageWidth - 30);
        pdf.text(splitNote, 15, currentY);

        // Save the PDF
        pdf.save(filename);

        if (onExportEnd) onExportEnd();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        if (onExportEnd) onExportEnd();
        throw error;
    }
};

// Helper function to get form titles
const getFormTitle = (formNumber: number): string => {
    const formTitles: { [key: number]: string } = {
        1: 'Job Vacancies Solicited/Reported',
        2: 'Applicants Registered',
        3: 'Applicants Referred',
        4: 'Applicants Placed',
        5: 'Number of Projects Implemented for PWDs',
        6: 'Training Conducted for PWDs',
        7: 'Total Applicants Counselled',
        8: 'Total Applicants Tested',
        9: 'Career Guidance Conducted',
        10: 'Jobs Fair',
        11: 'Livelihood and Self-employment'
    };
    return formTitles[formNumber] || `Form ${formNumber}`;
}; 