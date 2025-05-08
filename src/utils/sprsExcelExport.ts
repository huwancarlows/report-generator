import * as XLSX from 'xlsx';
import { programOptions, indicatorOptions, subIndicatorOptions } from '@/constants/indicatorOptions';

function findEntry(reportEntries: any[], program: string, indicator?: string, subIndicator?: string, subSubIndicator?: string) {
    return reportEntries.find(e =>
        e.program === program &&
        (indicator ? e.indicator === indicator : !e.indicator) &&
        (subIndicator ? e.sub_indicator === subIndicator : !e.sub_indicator) &&
        (subSubIndicator ? e.sub_sub_indicator === subSubIndicator : !e.sub_sub_indicator)
    );
}

function buildRows(report: any) {
    const rows: any[] = [];
    for (const program of programOptions) {
        // Main program row
        rows.push([
            'I',
            program.label,
            '', '', '', '', '', ''
        ]);
        const indicators = indicatorOptions[program.value] || [];
        for (const indicator of indicators) {
            // Indicator row
            rows.push([
                '', '', indicator.label, '', '', '', '', ''
            ]);
            const subIndicators = subIndicatorOptions[indicator.value] || [];
            for (const subIndicator of subIndicators) {
                // Sub-indicator row
                rows.push([
                    '', '', '', subIndicator.label, '', '', '', ''
                ]);
                const subSubIndicators = subIndicatorOptions[subIndicator.value] || [];
                if (subSubIndicators.length > 0) {
                    for (const subSubIndicator of subSubIndicators) {
                        // Sub-sub-indicator row
                        const entry = findEntry(report.entries, program.value, indicator.value, subIndicator.value, subSubIndicator.value) || {};
                        rows.push([
                            '', '', '', '', subSubIndicator.label, entry.previous_report_period || '', entry.current_period || '', entry.remarks || ''
                        ]);
                    }
                } else {
                    // No sub-sub-indicator, just use sub-indicator
                    const entry = findEntry(report.entries, program.value, indicator.value, subIndicator.value) || {};
                    rows.push([
                        '', '', '', '', '', entry.previous_report_period || '', entry.current_period || '', entry.remarks || ''
                    ]);
                }
            }
            if (subIndicators.length === 0) {
                // No sub-indicator, just use indicator
                const entry = findEntry(report.entries, program.value, indicator.value) || {};
                rows.push([
                    '', '', '', '', '', entry.previous_report_period || '', entry.current_period || '', entry.remarks || ''
                ]);
            }
        }
        if (indicators.length === 0) {
            // No indicator, just use program
            const entry = findEntry(report.entries, program.value) || {};
            rows.push([
                '', '', '', '', '', entry.previous_report_period || '', entry.current_period || '', entry.remarks || ''
            ]);
        }
    }
    return rows;
}

export function exportSPRSExcelFromReport(report: any, filename = '') {
    const headerRows = [
        [
            'Revised SPRPS Form 2003-1', '', '', 'Republic of the Philippines', '', '', '', 'Page _1_ of __'
        ],
        [
            'PESO ' + (report.reporting_office || ''), '', '', 'DEPARTMENT OF LABOR AND EMPLOYMENT', '', '', '', ''
        ],
        [
            'Monthly Report', '', '', 'Regional Office No. X', '', '', '', ''
        ],
        ['', '', '', '', '', '', '', (report.reporting_period || '').toUpperCase()],
        ['', '', '', '', '', '', '', 'Reference Month / Year'],
        ['', '', '', '', '', '', '', ''],
        [
            'GENERAL INSTRUCTIONS: Provide complete information to this form. Data contained herein should be the total information for the Regional Office, its provincial extension units and district offices. Unless otherwise stated, data required is for the reference month. The reference month covers the first day up to its last day.'
        ],
        ['', '', '', '', '', '', '', ''],
        [
            'KRA', 'PROGRAM', 'INDICATOR (OUTPUT SPECIFICATION)', '', '', 'PREVIOUS REPORTING PERIOD', 'CURRENT REPORTING PERIOD', 'REMARKS'
        ]
    ];

    const merges = [
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

    const dataRows = buildRows(report);

    const wsData = [
        ...headerRows,
        ...dataRows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = merges;
    ws['!cols'] = [
        { wch: 22 }, // KRA
        { wch: 22 }, // PROGRAM
        { wch: 55 }, // INDICATOR
        { wch: 22 },
        { wch: 22 },
        { wch: 18 }, // PREVIOUS
        { wch: 18 }, // CURRENT
        { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SPRS');
    XLSX.writeFile(wb, filename || `report-${report.reporting_period || 'report'}.xlsx`);
} 