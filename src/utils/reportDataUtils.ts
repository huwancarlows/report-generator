import { EmploymentFacilitationRow } from '@/types/report.types';

export interface OrganizedReportData {
    [program: string]: {
        [indicator: string]: {
            [subIndicator: string]: {
                [subSubIndicator: string]: EmploymentFacilitationRow;
            };
        };
    };
}

export function organizeReportData(entries: EmploymentFacilitationRow[]): OrganizedReportData {
    const organizedData: OrganizedReportData = {};

    entries.forEach(entry => {
        const { program, indicator, sub_indicator, sub_sub_indicator } = entry;

        // Initialize program if not exists
        if (!organizedData[program]) {
            organizedData[program] = {};
        }

        // Initialize indicator if not exists
        if (!organizedData[program][indicator]) {
            organizedData[program][indicator] = {};
        }

        // Initialize sub-indicator if not exists
        if (!organizedData[program][indicator][sub_indicator]) {
            organizedData[program][indicator][sub_indicator] = {};
        }

        // Store the entry
        organizedData[program][indicator][sub_indicator][sub_sub_indicator] = entry;
    });

    return organizedData;
}

export function getEntryValue(
    organizedData: OrganizedReportData,
    program: string,
    indicator: string,
    subIndicator: string = '',
    subSubIndicator: string = '',
    field: 'previous_report_period' | 'current_period' = 'current_period'
): number {
    try {
        return organizedData[program]?.[indicator]?.[subIndicator]?.[subSubIndicator]?.[field] || 0;
    } catch (error) {
        return 0;
    }
}

export function getFemaleEntryValue(
    organizedData: OrganizedReportData,
    program: string,
    indicator: string,
    subIndicator: string = '',
    field: 'previous_report_period' | 'current_period' = 'current_period'
): number {
    return getEntryValue(organizedData, program, indicator, subIndicator, 'FEMALE', field);
} 