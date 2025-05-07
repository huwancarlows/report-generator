import { ProgramType } from "@/types/database.types";
import { IndicatorOption, IndicatorOptionsMap } from "@/types/report.types";

export const programOptions: { value: ProgramType; label: string }[] = [
    { value: "JOB_VACANCIES", label: "1. Job vacancies solicited/reported" },
    { value: "APPLICANTS_REGISTERED", label: "2. Applicants registered" },
    { value: "APPLICANTS_REFERRED", label: "3. Applicants referred" },
    { value: "APPLICANTS_PLACED", label: "4. Applicants placed" },
    { value: "PWD_PROJECTS", label: "5. Number of projects implemented for PWDs" },
    { value: "PWD_TRAINING", label: "6. Training conducted for PWDs" },
    { value: "APPLICANTS_COUNSELLED", label: "7. Total applicants counselled" },
    { value: "APPLICANTS_TESTED", label: "8. Total applicants tested" },
    { value: "CAREER_GUIDANCE", label: "9. Career Guidance conducted" },
    { value: "JOB_FAIR", label: "10. Jobs fair" },
    { value: "LIVELIHOOD", label: "11. Livelihood and self-employment" }
];

export const indicatorOptions: IndicatorOptionsMap = {
    JOB_VACANCIES: [
        { value: "REGULAR_PROGRAM", label: "1.1 Regular Program" },
        { value: "SPES", label: "1.2 SPES" },
        { value: "WAP", label: "1.3 WAP (Work Appreciation Program)" },
        { value: "TULAY", label: "1.4 TULAY" }
    ],
    APPLICANTS_REGISTERED: [
        { value: "REGULAR_PROGRAM_2", label: "2.1 Regular program" },
        { value: "SPES_2", label: "2.2 SPES" },
        { value: "WAP_2", label: "2.3 WAP" },
        { value: "TULAY_2", label: "2.4 TULAY 2000" },
        { value: "RETRENCHED_2", label: "2.5 Retrenched/Displaced Workers" },
        { value: "OFWS_2", label: "2.6 Returning OFWs" },
        { value: "MIGRATORY_2", label: "2.7 Migratory Workers" },
        { value: "RURAL_2", label: "2.8 Rural Workers" }
    ],
    APPLICANTS_REFERRED: [
        { value: "REGULAR_PROGRAM_REFERRED", label: "3.1 Regular Program" },
        { value: "SPES_REFERRED", label: "3.2 SPES" },
        { value: "WAP_REFERRED", label: "3.3 WAP" },
        { value: "TULAY_REFERRED", label: "3.4 TULAY 2000" },
        { value: "RETRENCHED_REFERRED", label: "3.5 Retrenched/Displaced Workers" },
        { value: "OFWS_REFERRED", label: "3.6 Returning OFWs" },
        { value: "MIGRATORY_REFERRED", label: "3.7 Migratory Workers" },
        { value: "RURAL_REFERRED", label: "3.8 Rural Workers" }
    ],
    APPLICANTS_PLACED: [
        { value: "REGULAR_PROGRAM_PLACED", label: "4.1 Regular Program" },
        { value: "SPES_PLACED", label: "4.2 SPES" },
        { value: "WAP_PLACED", label: "4.3 WAP" },
        { value: "TULAY_PLACED", label: "4.4 TULAY 2000" },
        { value: "RETRENCHED_PLACED", label: "4.5 Retrenched/Displaced Workers" },
        { value: "OFWS_PLACED", label: "4.6 Returning OFWs" },
        { value: "MIGRATORY_PLACED", label: "4.7 Migratory Workers" },
        { value: "RURAL_PLACED", label: "4.8 Rural Workers" }
    ],
    PWD_PROJECTS: [
        { value: "BENEFICIARIES_PWD", label: "5.1 Beneficiaries" }
    ],
    PWD_TRAINING: [
        { value: "BENEFICIARIES_TRAINING", label: "6.1 Beneficiaries" }
    ],
    APPLICANTS_COUNSELLED: [
        { value: "TOTAL_COUNSELLED", label: "7. Total applicants counselled" }
    ],
    APPLICANTS_TESTED: [
        { value: "TOTAL_TESTED", label: "8. Total applicants tested" }
    ],
    CAREER_GUIDANCE: [
        { value: "STUDENTS", label: "9.1 Students given Career Guidance" },
        { value: "INSTITUTIONS", label: "9.2 Schools/Colleges/Universities" }
    ],
    JOB_FAIR: [
        { value: "JOBS_FAIR_CONDUCTED", label: "10.1 Jobs fair conducted/assisted" },
        { value: "JOBS_FAIR_TYPES", label: "10.2 Types" },
        { value: "JOB_VACANCIES_FAIR", label: "10.3 Job vacancies solicited" },
        { value: "JOB_APPLICANTS_FAIR", label: "10.4 Job applicants registered" },
        { value: "HIRED_ON_SPOT", label: "10.5 Job applicants hired on the spot" },
        { value: "REPORTED_PLACED", label: "10.6 Job applicants reported placed" },
        { value: "PRAS_ASSISTED", label: "10.7 PRAS assisted" },
        { value: "LRA", label: "10.8 Local Recruitment Activity (LRA)" }
    ],
    LIVELIHOOD: [
        { value: "BAZAARS", label: "11. Livelihood and self-employment bazaars conducted" }
    ]
};

export const subIndicatorOptions: IndicatorOptionsMap = {
    REGULAR_PROGRAM: [
        { value: "LOCAL_EMPLOYMENT", label: "1.1.1 Local employment" },
        { value: "OVERSEAS_EMPLOYMENT", label: "1.1.2 Overseas employment" }
    ],
    REGULAR_PROGRAM_REFERRED: [
        { value: "LOCAL_EMPLOYMENT_REFERRED", label: "3.1.1 Local Employment" },
        { value: "OVERSEAS_EMPLOYMENT_REFERRED", label: "3.1.2 Overseas employment" },
        { value: "SELF_EMPLOYMENT_REFERRED", label: "3.1.3 Self-employment" },
        { value: "TRAINING_REFERRED", label: "3.1.4 Training" }
    ],
    SPES: [
        { value: "PUBLIC_SECTOR", label: "1.2.1 Public Sector" },
        { value: "PRIVATE_SECTOR", label: "1.2.2 Private Sector" }
    ],
    SPES_REFERRED: [
        { value: "FEMALE", label: "3.2.1 Female" }
    ],
    WAP: [
        { value: "FEMALE", label: "1.3.1 Female" }
    ],
    WAP_REFERRED: [
        { value: "FEMALE", label: "3.3.1 Female" }
    ],
    TULAY: [
        { value: "WAGE_EMPLOYMENT", label: "1.4.1 Wage employment" },
        { value: "SELF_EMPLOYMENT", label: "1.4.2 Self-employment" }
    ],
    TULAY_REFERRED: [
        { value: "WAGE_EMPLOYMENT_REFERRED", label: "3.4.1 Wage employment" },
        { value: "SELF_EMPLOYMENT_TULAY_REFERRED", label: "3.4.2 Self-employment" }
    ],
    REGULAR_PROGRAM_APPLICANTS: [
        { value: "FEMALE", label: "2.1.1 Female" }
    ],
    SPES_APPLICANTS: [
        { value: "FEMALE", label: "2.2.1 Female" }
    ],
    WAP_APPLICANTS: [
        { value: "FEMALE", label: "2.3.1 Female" }
    ],
    TULAY_APPLICANTS: [
        { value: "WAGE_EMPLOYMENT", label: "2.4.1 Wage employment" },
        { value: "SELF_EMPLOYMENT", label: "2.4.2 Self-employment" }
    ],
    RETRENCHED: [
        { value: "FEMALE", label: "2.5.1 Female" }
    ],
    OFWS: [
        { value: "FEMALE", label: "2.6.1 Female" }
    ],
    MIGRATORY: [
        { value: "FEMALE", label: "2.7.1 Female" }
    ],
    RURAL: [
        { value: "FEMALE", label: "2.8.1 Female" }
    ],
    BENEFICIARIES_PWD: [
        { value: "FEMALE", label: "5.1.1 Female" }
    ],
    PWD_TRAINING_BENEFICIARIES: [
        { value: "FEMALE", label: "6.1.1 Female" }
    ],
    JOBS_FAIR_CONDUCTED: [
        { value: "LGU", label: "10.1.1 Local Government Units" },
        { value: "PRIVATE", label: "10.1.2 Private Institutions" },
        { value: "SCHOOLS", label: "10.1.3 Schools" }
    ],
    JOBS_FAIR_TYPES: [
        { value: "LOCAL", label: "10.2.1 Local employment" },
        { value: "OVERSEAS", label: "10.2.2 Overseas employment" },
        { value: "BOTH", label: "10.2.3 Local and Overseas employment" },
        { value: "PWD", label: "10.2.4 PWDs and other disadvantaged groups" }
    ],
    JOB_VACANCIES_FAIR: [
        { value: "LOCAL", label: "10.3.1 Local employment" },
        { value: "OVERSEAS", label: "10.3.2 Overseas employment" },
        { value: "BOTH", label: "10.3.3 Local and Overseas employment" },
        { value: "PWD", label: "10.3.4 PWDs and other disadvantaged groups" }
    ],
    JOB_APPLICANTS_FAIR: [
        { value: "LOCAL_APPLICANTS", label: "10.4.1 Local employment" },
        { value: "OVERSEAS_APPLICANTS", label: "10.4.2 Overseas employment" },
        { value: "BOTH_APPLICANTS", label: "10.4.3 Local and Overseas employment" },
        { value: "PWD_APPLICANTS", label: "10.4.4 PWDs and other disadvantaged groups" }
    ],
    HIRED_ON_SPOT: [
        { value: "LOCAL_HIRED", label: "10.5.1 Local employment" },
        { value: "OVERSEAS_HIRED", label: "10.5.2 Overseas employment" },
        { value: "BOTH_HIRED", label: "10.5.3 Local and Overseas employment" },
        { value: "PWD_HIRED", label: "10.5.4 PWDs and other disadvantaged groups" }
    ],
    REPORTED_PLACED: [
        { value: "LOCAL_PLACED", label: "10.6.1 Local employment" },
        { value: "OVERSEAS_PLACED", label: "10.6.2 Overseas employment" },
        { value: "BOTH_PLACED", label: "10.6.3 Local and Overseas employment" },
        { value: "PWD_PLACED", label: "10.6.4 PWDs and other disadvantaged groups" }
    ],
    PRAS_ASSISTED: [
        { value: "PRAS_REGISTERED", label: "10.7.1 Job applicants registered" },
        { value: "PRAS_PLACED", label: "10.7.2 Job applicants placed" }
    ],
    LRA: [
        { value: "LRA_ASSISTED", label: "10.8.1 LRA assisted" },
        { value: "LRA_VACANCIES", label: "10.8.2 Job vacancies solicited" },
        { value: "LRA_APPLICANTS", label: "10.8.3 Job applicants registered" },
        { value: "LRA_HIRED", label: "10.8.4 Job applicants hired on the spot" },
        { value: "LRA_PLACED", label: "10.8.5 Job applicants reported placed" }
    ],
    LRA_ASSISTED: [
        { value: "LRA_LGU", label: "10.8.1.1 Local Government Units" },
        { value: "LRA_PRIVATE", label: "10.8.2.1 Private Institutions" },
        { value: "LRA_SCHOOLS", label: "10.8.3.1 Schools" }
    ],
    LRA_APPLICANTS: [
        { value: "FEMALE", label: "10.8.3.1 Female" }
    ],
    LRA_HIRED: [
        { value: "FEMALE", label: "10.8.4.1 Female" }
    ],
    LRA_PLACED: [
        { value: "FEMALE", label: "10.8.5.1 Female" }
    ],
    RETRENCHED_REFERRED: [
        { value: "FEMALE", label: "3.5.1 Female" }
    ],
    OFWS_REFERRED: [
        { value: "FEMALE", label: "3.6.1 Female" }
    ],
    MIGRATORY_REFERRED: [
        { value: "FEMALE", label: "3.7.1 Female" }
    ],
    RURAL_REFERRED: [
        { value: "FEMALE", label: "3.8.1 Female" }
    ],
    LOCAL_EMPLOYMENT_REFERRED: [
        { value: "FEMALE", label: "3.1.1.1 Female" }
    ],
    OVERSEAS_EMPLOYMENT_REFERRED: [
        { value: "FEMALE", label: "3.1.2.1 Female" }
    ],
    SELF_EMPLOYMENT_REFERRED: [
        { value: "FEMALE", label: "3.1.3.1 Female" }
    ],
    TRAINING_REFERRED: [
        { value: "FEMALE", label: "3.1.4.1 Female" }
    ],
    WAGE_EMPLOYMENT_REFERRED: [
        { value: "FEMALE", label: "3.4.1.1 Female" }
    ],
    SELF_EMPLOYMENT_TULAY_REFERRED: [
        { value: "FEMALE", label: "3.4.2.1 Female" }
    ],
    REGULAR_PROGRAM_PLACED: [
        { value: "LOCAL_EMPLOYMENT_PLACED", label: "4.1.1 Local Employment" },
        { value: "OVERSEAS_EMPLOYMENT_PLACED", label: "4.1.2 Overseas employment" },
        { value: "SELF_EMPLOYMENT_PLACED", label: "4.1.3 Self-employment" },
        { value: "TRAINING_PLACED", label: "4.1.4 Training" }
    ],
    SPES_PLACED: [
        { value: "PUBLIC_SECTOR_PLACED", label: "4.2.1 Public Sector" },
        { value: "PRIVATE_SECTOR_PLACED", label: "4.2.2 Private Sector" }
    ],
    WAP_PLACED: [
        { value: "FEMALE", label: "4.3.1 Female" }
    ],
    TULAY_PLACED: [
        { value: "WAGE_EMPLOYMENT_PLACED", label: "4.4.1 Wage employment" },
        { value: "SELF_EMPLOYMENT_TULAY_PLACED", label: "4.4.2 Self-employment" }
    ],
    RETRENCHED_PLACED: [
        { value: "FEMALE", label: "4.5.1 Female" }
    ],
    OFWS_PLACED: [
        { value: "FEMALE", label: "4.6.1 Female" }
    ],
    MIGRATORY_PLACED: [
        { value: "FEMALE", label: "4.7.1 Female" }
    ],
    RURAL_PLACED: [
        { value: "FEMALE", label: "4.8.1 Female" }
    ],
    LOCAL_EMPLOYMENT_PLACED: [
        { value: "FEMALE", label: "4.1.1.1 Female" }
    ],
    OVERSEAS_EMPLOYMENT_PLACED: [
        { value: "FEMALE", label: "4.1.2.1 Female" }
    ],
    SELF_EMPLOYMENT_PLACED: [
        { value: "FEMALE", label: "4.1.3.1 Female" }
    ],
    TRAINING_PLACED: [
        { value: "FEMALE", label: "4.1.4.1 Female" }
    ],
    PUBLIC_SECTOR_PLACED: [
        { value: "FEMALE", label: "4.2.1.1 Female" }
    ],
    PRIVATE_SECTOR_PLACED: [
        { value: "FEMALE", label: "4.2.2.1 Female" }
    ],
    WAGE_EMPLOYMENT_PLACED: [
        { value: "FEMALE", label: "4.4.1.1 Female" }
    ],
    SELF_EMPLOYMENT_TULAY_PLACED: [
        { value: "FEMALE", label: "4.4.2.1 Female" }
    ],
    LOCAL_EMPLOYMENT: [
        { value: "FEMALE", label: "1.1.1.1 Female" }
    ],
    OVERSEAS_EMPLOYMENT: [
        { value: "FEMALE", label: "1.1.2.1 Female" }
    ],
    PUBLIC_SECTOR: [
        { value: "FEMALE", label: "1.2.1.1 Female" }
    ],
    PRIVATE_SECTOR: [
        { value: "FEMALE", label: "1.2.2.1 Female" }
    ],
    WAGE_EMPLOYMENT: [
        { value: "FEMALE", label: "1.4.1.1 Female" }
    ],
    SELF_EMPLOYMENT: [
        { value: "FEMALE", label: "1.4.2.1 Female" }
    ],
    RETRENCHED_APPLICANTS: [
        { value: "FEMALE", label: "2.5.1 Female" }
    ],
    OFWS_APPLICANTS: [
        { value: "FEMALE", label: "2.6.1 Female" }
    ],
    MIGRATORY_APPLICANTS: [
        { value: "FEMALE", label: "2.7.1 Female" }
    ],
    RURAL_APPLICANTS: [
        { value: "FEMALE", label: "2.8.1 Female" }
    ],
    WAGE_EMPLOYMENT_APPLICANTS: [
        { value: "FEMALE", label: "2.4.1.1 Female" }
    ],
    SELF_EMPLOYMENT_APPLICANTS: [
        { value: "FEMALE", label: "2.4.2.1 Female" }
    ],
    BENEFICIARIES_TRAINING: [
        { value: "FEMALE", label: "6.1.1 Female" }
    ],
    LOCAL_APPLICANTS: [
        { value: "FEMALE", label: "10.4.1.1 Female" }
    ],
    OVERSEAS_APPLICANTS: [
        { value: "FEMALE", label: "10.4.2.1 Female" }
    ],
    BOTH_APPLICANTS: [
        { value: "FEMALE", label: "10.4.3.1 Female" }
    ],
    PWD_APPLICANTS: [
        { value: "FEMALE", label: "10.4.4.1 Female" }
    ],
    LOCAL_HIRED: [
        { value: "FEMALE", label: "10.5.1.1 Female" }
    ],
    OVERSEAS_HIRED: [
        { value: "FEMALE", label: "10.5.2.1 Female" }
    ],
    BOTH_HIRED: [
        { value: "FEMALE", label: "10.5.3.1 Female" }
    ],
    PWD_HIRED: [
        { value: "FEMALE", label: "10.5.4.1 Female" }
    ],
    LOCAL_PLACED: [
        { value: "FEMALE", label: "10.6.1.1 Female" }
    ],
    OVERSEAS_PLACED: [
        { value: "FEMALE", label: "10.6.2.1 Female" }
    ],
    BOTH_PLACED: [
        { value: "FEMALE", label: "10.6.3.1 Female" }
    ],
    PWD_PLACED: [
        { value: "FEMALE", label: "10.6.4.1 Female" }
    ],
    PRAS_REGISTERED: [
        { value: "FEMALE", label: "10.7.1.1 Female" }
    ],
    PRAS_PLACED: [
        { value: "FEMALE", label: "10.7.2.1 Female" }
    ],
    LRA_LGU: [
        { value: "FEMALE", label: "10.8.1.1 Female" }
    ],
    LRA_PRIVATE: [
        { value: "FEMALE", label: "10.8.2.1 Female" }
    ],
    LRA_SCHOOLS: [
        { value: "FEMALE", label: "10.8.3.1 Female" }
    ],
    LRA_VACANCIES: [
        { value: "FEMALE", label: "10.8.2.1 Female" }
    ],
    REGULAR_PROGRAM_2: [
        { value: "LOCAL_EMPLOYMENT_2", label: "2.1.1 Local employment" },
        { value: "OVERSEAS_EMPLOYMENT_2", label: "2.1.2 Overseas employment" }
    ],
    LOCAL_EMPLOYMENT_2: [
        { value: "FEMALE_2_1_1", label: "2.1.1.1 Female" }
    ],
    OVERSEAS_EMPLOYMENT_2: [
        { value: "FEMALE_2_1_2", label: "2.1.2.1 Female" }
    ],
    SPES_2: [
        { value: "PUBLIC_SECTOR_2", label: "2.2.1 Public Sector" },
        { value: "PRIVATE_SECTOR_2", label: "2.2.2 Private Sector" }
    ],
    PUBLIC_SECTOR_2: [
        { value: "FEMALE_2_2_1", label: "2.2.1.1 Female" }
    ],
    PRIVATE_SECTOR_2: [
        { value: "FEMALE_2_2_2", label: "2.2.2.1 Female" }
    ],
    WAP_2: [
        { value: "FEMALE_2_3_1", label: "2.3.1 Female" }
    ],
    TULAY_2: [
        { value: "WAGE_EMPLOYMENT_2", label: "2.4.1 Wage employment" },
        { value: "SELF_EMPLOYMENT_2", label: "2.4.2 Self-employment" }
    ],
    WAGE_EMPLOYMENT_2: [
        { value: "FEMALE_2_4_1", label: "2.4.1.1 Female" }
    ],
    SELF_EMPLOYMENT_2: [
        { value: "FEMALE_2_4_2", label: "2.4.2.1 Female" }
    ],
    RETRENCHED_2: [
        { value: "FEMALE_2_5_1", label: "2.5.1 Female" }
    ],
    OFWS_2: [
        { value: "FEMALE_2_6_1", label: "2.6.1 Female" }
    ],
    MIGRATORY_2: [
        { value: "FEMALE_2_7_1", label: "2.7.1 Female" }
    ],
    RURAL_2: [
        { value: "FEMALE_2_8_1", label: "2.8.1 Female" }
    ]
}; 