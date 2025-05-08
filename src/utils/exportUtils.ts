import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface ExportOptions {
    scale?: number;
    backgroundColor?: string;
    windowWidth?: number;
    windowHeight?: number;
    waitForImages?: boolean;
    delay?: number;
}

export const createHighQualityCanvas = async (element: HTMLElement, options: ExportOptions = {}) => {
    // Wait for any animations or transitions to complete
    await new Promise(resolve => setTimeout(resolve, options.delay || 500));

    // --- PATCH: Replace all canvas with img (toDataURL) to fix blank chart export ---
    const canvases = element.querySelectorAll('canvas');
    const replaced: { canvas: HTMLCanvasElement, img: HTMLImageElement }[] = [];
    canvases.forEach(canvas => {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const img = document.createElement('img');
            img.src = dataUrl;
            img.width = canvas.width;
            img.height = canvas.height;
            img.style.display = canvas.style.display;
            img.style.position = canvas.style.position;
            canvas.parentNode?.replaceChild(img, canvas);
            replaced.push({ canvas, img });
        } catch (e) {
            // fallback: do nothing
        }
    });

    // Calculate device pixel ratio and scale
    const dpr = window.devicePixelRatio || 1;
    const scale = options.scale || Math.max(dpr, 2); // Use at least 2x scaling for better quality

    // Default configuration for best quality
    const defaultOptions = {
        scale: scale,
        useCORS: false, // Set to false for local canvas
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
        backgroundColor: options.backgroundColor || '#ffffff',
        windowWidth: options.windowWidth,
        windowHeight: options.windowHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: element.offsetWidth,
        height: element.offsetHeight,
        foreignObjectRendering: true,
        onclone: (clonedDoc: Document) => {
            // Add necessary styles for high-quality export
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
        * { 
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        canvas { 
          max-width: none !important; 
          max-height: none !important;
        }
        .chart-container { 
          position: relative !important;
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `;
            clonedDoc.head.appendChild(style);

            // Wait for images to load in cloned document
            if (options.waitForImages) {
                const images = clonedDoc.getElementsByTagName('img');
                const imagePromises = Array.from(images).map(img => {
                    if (img.complete) {
                        return Promise.resolve();
                    }
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                });
                return Promise.all(imagePromises);
            }
        }
    };

    try {
        // Create initial canvas
        const canvas = await html2canvas(element, { ...defaultOptions, ...options });

        // Restore original canvases
        replaced.forEach(({ canvas, img }) => {
            img.parentNode?.replaceChild(canvas, img);
        });

        // Create a new canvas with the exact same dimensions for better quality
        const perfectCanvas = document.createElement('canvas');
        perfectCanvas.width = canvas.width;
        perfectCanvas.height = canvas.height;
        const ctx = perfectCanvas.getContext('2d');

        if (ctx) {
            // Apply high-quality rendering settings
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(canvas, 0, 0);
        }

        return perfectCanvas;
    } catch (error) {
        console.error('Error creating high-quality canvas:', error);
        throw error;
    }
};

export const exportToImage = async (
    element: HTMLElement,
    filename: string,
    options: ExportOptions = {}
) => {
    try {
        const canvas = await createHighQualityCanvas(element, {
            ...options,
            waitForImages: true,
        });

        // Convert to high-quality PNG
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        // Create and trigger download
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        return true;
    } catch (error) {
        console.error('Export error:', error);
        return false;
    }
};

/**
 * Export data to Excel file
 * @param rows Array of objects (data rows)
 * @param columns Array of { label, key } for column headers and mapping
 * @param filename Name of the Excel file to download
 */
export function exportToExcel<T extends Record<string, any>>(
    rows: T[],
    columns: { label: string; key: string }[],
    filename: string
) {
    const wsData = [
        columns.map(col => col.label),
        ...rows.map(row => columns.map(col => row[col.key] ?? ''))
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : filename + '.xlsx');
}

/**
 * Export SPRS Excel file in the official form layout
 * @param report Report data (should include entries, reporting_office, reporting_period, user_profile, etc.)
 * @param filename Name of the Excel file to download
 */
export function exportSPRSExcel(report: any, filename: string) {
    const ws = XLSX.utils.aoa_to_sheet([]);

    // 1. Static headers (with merges)
    XLSX.utils.sheet_add_aoa(ws, [
        [
            'Revised SPRPS Form 2003-', '', '', 'Republic of the Philippines', '', '', '', 'Page _1_ of __'
        ],
        [
            'PESO ' + (report.reporting_office || ''), '', '', 'DEPARTMENT OF LABOR AND EMPLOYMENT', '', '', '', ''
        ],
        [
            'Monthly Report', '', '', 'Regional Office No. X', '', '', '', ''
        ],
        ['', '', '', '', '', '', '', 'MARCH 2025'],
        ['', '', '', '', '', '', '', 'Reference Month / Year'],
        ['', '', '', '', '', '', '', ''],
        [
            'GENERAL INSTRUCTIONS: Provide complete information to this form. Data contained herein should be the total information for the Regional Office, its provincial extension units and district offices. Unless otherwise stated, data required is for the reference month. The reference month covers the first day up to its last day.'
        ],
        ['', '', '', '', '', '', '', ''],
        [
            'KRA', 'PROGRAM', 'INDICATOR (OUTPUT SPECIFICATION)', '', '', 'PREVIOUS REPORTING PERIOD', 'CURRENT REPORTING PERIOD', ''
        ]
    ], { origin: 'A1' });

    // Merges for headers
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // A1:C1
        { s: { r: 0, c: 3 }, e: { r: 0, c: 6 } }, // D1:G1
        { s: { r: 0, c: 7 }, e: { r: 0, c: 7 } }, // H1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // A2:C2
        { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } }, // D2:G2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // A3:C3
        { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } }, // D3:G3
        { s: { r: 3, c: 7 }, e: { r: 3, c: 7 } }, // H4
        { s: { r: 4, c: 7 }, e: { r: 4, c: 7 } }, // H5
        { s: { r: 6, c: 0 }, e: { r: 6, c: 7 } }, // A7:H7 (instructions)
        { s: { r: 8, c: 2 }, e: { r: 8, c: 4 } }, // C9:E9 (indicator header)
        { s: { r: 8, c: 5 }, e: { r: 8, c: 5 } }, // F9
        { s: { r: 8, c: 6 }, e: { r: 8, c: 6 } }, // G9
        { s: { r: 8, c: 7 }, e: { r: 8, c: 7 } }, // H9
    ];

    // 2. Example indicator rows (replace with real data later)
    XLSX.utils.sheet_add_aoa(ws, [
        ['I. EMPLOYMENT FACILITATION', 'A. PUBLIC EMPLOYMENT SERVICE OFFICE', '1. Job vacancies solicited/reported', '', '', '', '', ''],
        ['', '', '1.1 Regular Program', '', '', '', '', ''],
        ['', '', '1.1.1 Local employment', '', '', 548, 36, ''],
        ['', '', '1.1.1.1 Female', '', '', '', '', ''],
        ['', '', '1.1.2 Overseas employment', '', '', '', '', ''],
        ['', '', '1.1.2.1 Female', '', '', '', '', ''],
        ['', '', '2. Applicants registered', '', '', '', '', ''],
        ['', '', '2.1 Regular program', '', '', 8, 3, ''],
        ['', '', '2.1.1 Female', '', '', '', '', ''],
        // ... more rows as needed
    ], { origin: -1 });

    // 3. Example footer/signature rows
    XLSX.utils.sheet_add_aoa(ws, [
        ['', '', '', '', '', '', '', ''],
        ['PREPARED BY:', '', '', '', '', '', 'APPROVED:', ''],
        ['VANESSA MAE R. MORALES', '', '', '', '', '', 'HON. JENNIE ROSALIE UY - MENDEZ', ''],
        ['PESO MANAGER - Designate', '', '', '', '', '', 'MUNICIPAL MAYOR', ''],
        ['14-Mar-25', '', '', '', '', '', 'Date', ''],
        ['', '', '', '', '', '', '', ''],
        ['Note: Include in the SPRS a simple LMI Analysis Report (comparing your accomplishment from previous to current. Explain what brought about changes, or any significant changes in the data.) Include documentations and highlights of your activities with explanations of your pix. Narrative reports. Thank you.', '', '', '', '', '', '', '']
    ], { origin: -1 });

    // Merge for note/footer (fix linter: use decode_range to get last row)
    if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        ws['!merges'].push({ s: { r: range.e.r, c: 0 }, e: { r: range.e.r, c: 7 } });
    }

    // Set column widths
    ws['!cols'] = [
        { wch: 22 }, // KRA
        { wch: 22 }, // PROGRAM
        { wch: 55 }, // INDICATOR
        { wch: 10 },
        { wch: 10 },
        { wch: 18 }, // PREVIOUS
        { wch: 18 }, // CURRENT
        { wch: 18 },
    ];

    // Export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SPRS');
    XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : filename + '.xlsx');
} 