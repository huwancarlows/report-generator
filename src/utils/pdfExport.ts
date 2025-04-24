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
    rows.forEach(row => {
        const rowData: string[] = []
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent?.trim() || '')
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

    // Get text content
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
        pdf.setFontSize(pdfStyles.fonts.header);
        pdf.text(pesoOffice, 15, currentY);
        pdf.text('DEPARTMENT OF LABOR AND EMPLOYMENT', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        // Add reporting period and regional office
        const reportingPeriod = reportElement.querySelector('.reporting-period')?.textContent || '';
        pdf.text('Monthly Report', 15, currentY);
        pdf.text('Regional Office No. X', pageWidth / 2, currentY, { align: 'center' });
        pdf.text(reportingPeriod, pageWidth - 45, currentY);
        currentY += 10;

        // Add instructions with proper spacing
        pdf.setFontSize(pdfStyles.fonts.small);
        const splitInstructions = pdf.splitTextToSize(instructions, pageWidth - 30);
        checkForNewPage(splitInstructions.length * 5);
        pdf.text(splitInstructions, 15, currentY);
        currentY += splitInstructions.length * 5 + 10;

        // Extract and format table data
        const { data } = extractTableData(reportElement.querySelector('table')!);
        const formattedData = data.map(row => {
            while (row.length < 5) row.push('');
            return row;
        });

        // Enhanced table configuration for better pagination
        const tableConfig = {
            ...pdfStyles.table,
            head: tableHeaders,
            body: formattedData,
            startY: currentY,
            margin: { top: 20, bottom: 20 },
            rowPageBreak: 'auto' as const,
            bodyStyles: {
                ...pdfStyles.table.bodyStyles,
                minCellHeight: 8,
                cellPadding: 4
            },
            didDrawPage: (data: any) => {
                // Add header to each new page
                if (data.pageNumber > 1) {
                    addHeaderToNewPage(pdf, data.pageNumber, data.pageCount);
                }
                // Update current Y position
                currentY = data.cursor.y;
            },
            didDrawCell: (data: any) => {
                // Handle cell content overflow
                if (data.cell.height > 20) {
                    data.cell.styles.cellPadding = 2;
                }
            }
        };

        // Add table with auto-pagination
        await autoTable(pdf, tableConfig);
        currentY = (pdf as any).lastAutoTable.finalY + 20;

        // Check if we need a new page for footer
        checkForNewPage(80); // Reserve space for footer section

        // Footer section with profile data
        const leftColumn = 15;
        const rightColumn = pageWidth / 2;

        pdf.setFontSize(pdfStyles.fonts.normal);
        pdf.text('PREPARED BY:', leftColumn, currentY);
        pdf.text('APPROVED:', rightColumn, currentY);
        currentY += 15;

        // Add preparer details using profile data
        pdf.setFontSize(pdfStyles.fonts.subHeader);
        pdf.text(profile?.name || '', leftColumn, currentY);
        currentY += 5;
        pdf.setFontSize(pdfStyles.fonts.normal);
        pdf.text('PESO MANAGER - Designate', leftColumn, currentY);

        // Add approver details using profile data
        pdf.setFontSize(pdfStyles.fonts.subHeader);
        pdf.text(`HON. ${profile?.municipal_mayor || ''}`, rightColumn, currentY - 5);
        pdf.setFontSize(pdfStyles.fonts.normal);
        pdf.text('MUNICIPAL MAYOR', rightColumn, currentY);

        currentY += 15;

        // Add dates with proper spacing
        const currentDate = format(new Date(), 'dd-MMM-yy');
        pdf.text(currentDate, leftColumn, currentY);
        pdf.text('_______________________________________', rightColumn, currentY);
        currentY += 5;
        pdf.text('Date', leftColumn, currentY);
        pdf.text('Date', rightColumn, currentY);

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