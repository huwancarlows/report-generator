import { ProgramType } from "./database.types";

export interface EmploymentFacilitationRow {
    program: string;
    indicator: string;
    sub_indicator: string;
    sub_sub_indicator: string;
    previous_report_period: number;
    current_period: number;
    remarks?: string;
    // Track female counts in the form but submit as separate entries
    previous_female_count?: number;
    current_female_count?: number;
}

export interface ReportData {
    employmentFacilitation: EmploymentFacilitationRow[];
    reportingPeriod: string;
    reportingOffice: string;
}

export type FieldType<T, K extends keyof T> = T[K];

export interface IndicatorOption {
    value: string;
    label: string;
    has_female_count?: boolean;
}

export interface IndicatorOptionsMap {
    [key: string]: IndicatorOption[];
} 