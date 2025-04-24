import { ProgramType } from "./database.types";

export type EmploymentFacilitationRow = {
    program: ProgramType;
    indicator: string;
    sub_indicator?: string;
    sub_sub_indicator?: string;
    previous_report_period: number;
    current_period: number;
    remarks?: string;
};

export interface ReportData {
    employmentFacilitation: EmploymentFacilitationRow[];
    reportingPeriod: string;
    reportingOffice: string;
}

export type FieldType<T, K extends keyof T> = T[K];

export type IndicatorOption = {
    value: string;
    label: string;
};

export type IndicatorOptionsMap = {
    [key: string]: IndicatorOption[];
}; 