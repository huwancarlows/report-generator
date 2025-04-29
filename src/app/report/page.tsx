"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { reportService } from '@/services/reportService';
import { toast } from 'react-hot-toast';
import { ProgramType, EmploymentFacilitation } from "@/types/database.types";

// Import types from a shared location
import {
  EmploymentFacilitationRow,
  ReportData,
  FieldType,
  IndicatorOption,
  IndicatorOptionsMap
} from '@/types/report.types';

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Initial form state
  const initialFormState: ReportData = {
    employmentFacilitation: [
      {
        program: "JOB_VACANCIES" as ProgramType,
        indicator: "REGULAR_PROGRAM",
        sub_indicator: "LOCAL_EMPLOYMENT",
        sub_sub_indicator: "FEMALE",
        previous_report_period: 0,
        current_period: 0,
        remarks: ""
      }
    ],
    reportingPeriod: "",
    reportingOffice: ""
  };

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showValidationErrors, setShowValidationErrors] = useState(true);
  const [formData, setFormData] = useState<ReportData>(initialFormState);

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormState);
    setValidationErrors({});
    setShowValidationErrors(false);
    setSubmitError(null);
  };

  useEffect(() => {
    // Check if user is logged in and has user role only
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser || storedUser.role !== "user") {
      router.replace("/login");
      return;
    }

    // Set the reporting office from user's address
    setFormData(prev => ({
      ...prev,
      reportingOffice: storedUser.address || ""
    }));
  }, [router]);

  const isValidProgram = (program: string): program is ProgramType => {
    return [
      'JOB_VACANCIES',
      'APPLICANTS_REGISTERED',
      'APPLICANTS_REFERRED',
      'APPLICANTS_PLACED',
      'PWD_PROJECTS',
      'PWD_TRAINING',
      'APPLICANTS_COUNSELLED',
      'APPLICANTS_TESTED',
      'CAREER_GUIDANCE',
      'JOB_FAIR',
      'LIVELIHOOD'
    ].includes(program);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Basic validation with friendly messages
    if (!formData.reportingPeriod) {
      newErrors.reportingPeriod = "📅 Please select a reporting period";
    }

    if (!formData.reportingOffice) {
      newErrors.reportingOffice = "🏢 Please enter your reporting office";
    }

    // Validate that all numbers are non-negative
    formData.employmentFacilitation.forEach((entry: EmploymentFacilitationRow, index: number) => {
      const rowNumber = index + 1;

      if (entry.previous_report_period < 0) {
        newErrors[`row${index}_previous`] = `Entry ${rowNumber}: Numbers can't be negative`;
      }
      if (entry.current_period < 0) {
        newErrors[`row${index}_current`] = `Entry ${rowNumber}: Numbers can't be negative`;
      }
      if ((entry.previous_female_count ?? 0) < 0) {
        newErrors[`row${index}_previous_female`] = `Entry ${rowNumber}: Female count can't be negative`;
      }
      if ((entry.current_female_count ?? 0) < 0) {
        newErrors[`row${index}_current_female`] = `Entry ${rowNumber}: Female count can't be negative`;
      }
      // Validate that female counts don't exceed total counts
      if ((entry.previous_female_count ?? 0) > entry.previous_report_period) {
        newErrors[`row${index}_previous_female`] = `Entry ${rowNumber}: Female count can't exceed total count`;
      }
      if ((entry.current_female_count ?? 0) > entry.current_period) {
        newErrors[`row${index}_current_female`] = `Entry ${rowNumber}: Female count can't exceed total count`;
      }
    });

    setValidationErrors(newErrors);
    setShowValidationErrors(true);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Process and structure the employment facilitation data
      const processedEntries: Omit<EmploymentFacilitation, 'id' | 'report_id'>[] = [];

      // Helper function to check if an entry is a female sub-entry
      const isFemaleSubEntry = (label: string) => {
        // Check for patterns like "X.X.1 Female" where X is any number
        const femalePattern = /\d+\.\d+\.1\s+Female$/;
        return femalePattern.test(label);
      };

      // Process all programs
      programOptions.forEach(programOption => {
        const program = programOption.value;
        const indicators = indicatorOptions[program] || [];

        // Process each indicator for this program
        indicators.forEach(indicator => {
          const subIndicators = subIndicatorOptions[indicator.value] || [];

          if (subIndicators.length > 0) {
            // Process sub-indicators
            subIndicators.forEach(subInd => {
              // Find the matching entry in formData
              const mainEntry = formData.employmentFacilitation.find(
                entry => entry.program === program &&
                  entry.indicator === indicator.value &&
                  entry.sub_indicator === subInd.value &&
                  !entry.sub_sub_indicator
              );

              // Check if this is a female sub-entry by its label pattern
              if (isFemaleSubEntry(subInd.label)) {
                // This is a female entry (like 3.5.1 Female)
                // Find the parent entry to get the main counts
                const parentEntry = formData.employmentFacilitation.find(
                  entry => entry.program === program &&
                    entry.indicator === indicator.value &&
                    !entry.sub_indicator
                );

                processedEntries.push({
                  program,
                  indicator: indicator.value,
                  sub_indicator: subInd.value,
                  sub_sub_indicator: 'FEMALE',
                  previous_report_period: mainEntry?.previous_female_count || 0,
                  current_period: mainEntry?.current_female_count || 0,
                  remarks: mainEntry?.remarks || null
                });
              } else {
                // Regular entry
                processedEntries.push({
                  program,
                  indicator: indicator.value,
                  sub_indicator: subInd.value,
                  sub_sub_indicator: null,
                  previous_report_period: mainEntry?.previous_report_period || 0,
                  current_period: mainEntry?.current_period || 0,
                  remarks: mainEntry?.remarks || null
                });

                // Check for explicit FEMALE sub-sub-indicators
                const subSubIndicators = subIndicatorOptions[subInd.value] || [];
                if (subSubIndicators.some(s => s.value === 'FEMALE')) {
                  const femaleEntry = formData.employmentFacilitation.find(
                    entry => entry.program === program &&
                      entry.indicator === indicator.value &&
                      entry.sub_indicator === subInd.value &&
                      entry.sub_sub_indicator === 'FEMALE'
                  );

                  processedEntries.push({
                    program,
                    indicator: indicator.value,
                    sub_indicator: subInd.value,
                    sub_sub_indicator: 'FEMALE',
                    previous_report_period: femaleEntry?.previous_female_count || 0,
                    current_period: femaleEntry?.current_female_count || 0,
                    remarks: femaleEntry?.remarks || null
                  });
                }
              }
            });
          } else {
            // No sub-indicators, just add the main indicator entry
            const mainEntry = formData.employmentFacilitation.find(
              entry => entry.program === program &&
                entry.indicator === indicator.value &&
                !entry.sub_indicator
            );

            processedEntries.push({
              program,
              indicator: indicator.value,
              sub_indicator: null,
              sub_sub_indicator: null,
              previous_report_period: mainEntry?.previous_report_period || 0,
              current_period: mainEntry?.current_period || 0,
              remarks: mainEntry?.remarks || null
            });
          }
        });
      });

      console.log('Form data state:', formData);
      console.log('Final processed entries:', processedEntries);

      // Call the report service to create the report
      const result = await reportService.createReport(
        formData.reportingPeriod || new Date().toISOString().slice(0, 7),
        formData.reportingOffice || 'Default Office',
        processedEntries
      );

      if (result) {
        console.log('Submitted result:', result);
        setSubmitSuccess(true);
        toast.success('Report submitted successfully!');
        // Reset form after successful submission
        resetForm();
      } else {
        throw new Error('Failed to create report. Please try again.');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the report';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const generateEntriesForProgram = (program: ProgramType): EmploymentFacilitationRow[] => {
    const entries: EmploymentFacilitationRow[] = [];

    // Get all indicators for the program
    const indicators = indicatorOptions[program] || [];

    indicators.forEach(indicator => {
      const subIndicators = subIndicatorOptions[indicator.value] || [];

      if (subIndicators.length > 0) {
        // Has sub-indicators
        subIndicators.forEach(subInd => {
          const subSubIndicators = subIndicatorOptions[subInd.value] || [];

          if (subSubIndicators.length > 0) {
            // Has sub-sub-indicators
            subSubIndicators.forEach(subSubInd => {
              entries.push({
                program,
                indicator: indicator.value,
                sub_indicator: subInd.value,
                sub_sub_indicator: subSubInd.value,
                previous_report_period: 0,
                current_period: 0,
                remarks: ""
              });
            });
          } else {
            // No sub-sub-indicators
            entries.push({
              program,
              indicator: indicator.value,
              sub_indicator: subInd.value,
              sub_sub_indicator: "",
              previous_report_period: 0,
              current_period: 0,
              remarks: ""
            });
          }
        });
      } else {
        // No sub-indicators
        entries.push({
          program,
          indicator: indicator.value,
          sub_indicator: "",
          sub_sub_indicator: "",
          previous_report_period: 0,
          current_period: 0,
          remarks: ""
        });
      }
    });

    return entries;
  };

  const updateRow = <K extends keyof EmploymentFacilitationRow>(
    index: number,
    field: K,
    value: FieldType<EmploymentFacilitationRow, K>
  ) => {
    const newData = { ...formData };

    if (field === "program") {
      // If selecting a program, generate all its entries
      if (value) {
        const programValue = value as ProgramType;
        const entries = generateEntriesForProgram(programValue);

        // Replace the current row with all generated entries
        newData.employmentFacilitation = [
          ...newData.employmentFacilitation.slice(0, index),
          ...entries,
          ...newData.employmentFacilitation.slice(index + 1)
        ];
      } else {
        // If clearing program, just update the single row
        newData.employmentFacilitation[index] = {
          program: value as ProgramType,
          indicator: "",
          sub_indicator: "",
          sub_sub_indicator: "",
          previous_report_period: 0,
          current_period: 0,
          remarks: ""
        };
      }
    } else {
      // For other fields, just update the value
      newData.employmentFacilitation[index][field] = value;
    }

    setFormData(newData);
  };

  // Program options based on the DOLE form
  const programOptions = [
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

  // Indicator options based on the DOLE form
  const indicatorOptions: IndicatorOptionsMap = {
    JOB_VACANCIES: [
      { value: "REGULAR_PROGRAM", label: "1.1 Regular Program" },
      { value: "SPES", label: "1.2 SPES" },
      { value: "WAP", label: "1.3 WAP (Work Appreciation Program)" },
      { value: "TULAY", label: "1.4 TULAY" }
    ],
    APPLICANTS_REGISTERED: [
      { value: "REGULAR_PROGRAM", label: "2.1 Regular program" },
      { value: "SPES", label: "2.2 SPES" },
      { value: "WAP", label: "2.3 WAP" },
      { value: "TULAY", label: "2.4 TULAY 2000" },
      { value: "RETRENCHED", label: "2.5 Retrenched/Displaced Workers" },
      { value: "OFWS", label: "2.6 Returning OFWs" },
      { value: "MIGRATORY", label: "2.7 Migratory Workers" },
      { value: "RURAL", label: "2.8 Rural Workers" }
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

  // Sub-indicator options
  const subIndicatorOptions: IndicatorOptionsMap = {
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
    // For Applicants Registered section
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
    // Sub-sub indicators for Local Employment under Regular Program
    LOCAL_EMPLOYMENT: [
      { value: "FEMALE", label: "1.1.1.1 Female" }
    ],
    // Sub-sub indicators for Overseas Employment under Regular Program
    OVERSEAS_EMPLOYMENT: [
      { value: "FEMALE", label: "1.1.2.1 Female" }
    ],
    // Sub-sub indicators for Public Sector under SPES
    PUBLIC_SECTOR: [
      { value: "FEMALE", label: "1.2.1.1 Female" }
    ],
    // Sub-sub indicators for Private Sector under SPES
    PRIVATE_SECTOR: [
      { value: "FEMALE", label: "1.2.2.1 Female" }
    ],
    // Sub-sub indicators for Wage Employment under TULAY
    WAGE_EMPLOYMENT: [
      { value: "FEMALE", label: "1.4.1.1 Female" }
    ],
    // Sub-sub indicators for Self Employment under TULAY
    SELF_EMPLOYMENT: [
      { value: "FEMALE", label: "1.4.2.1 Female" }
    ],
    // Applicants Registered (2) - Other Categories
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
    // Sub-sub indicators for TULAY 2000 Wage Employment
    WAGE_EMPLOYMENT_APPLICANTS: [
      { value: "FEMALE", label: "2.4.1.1 Female" }
    ],
    // Sub-sub indicators for TULAY 2000 Self Employment
    SELF_EMPLOYMENT_APPLICANTS: [
      { value: "FEMALE", label: "2.4.2.1 Female" }
    ],
    // PWD Training (6)
    BENEFICIARIES_TRAINING: [
      { value: "FEMALE", label: "6.1.1 Female" }
    ],
    // Sub-sub indicators for Job Fair Applicants
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
    // Sub-sub indicators for Hired on Spot
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
    // Sub-sub indicators for Reported Placed
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
    // Sub-sub indicators for PRAS
    PRAS_REGISTERED: [
      { value: "FEMALE", label: "10.7.1.1 Female" }
    ],
    PRAS_PLACED: [
      { value: "FEMALE", label: "10.7.2.1 Female" }
    ],
    // Sub-indicators for LRA Assisted
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
    ]
  };

  const addNewRow = () => {
    setFormData(prev => ({
      ...prev,
      employmentFacilitation: [
        ...prev.employmentFacilitation,
        {
          program: "" as ProgramType,
          indicator: "",
          sub_indicator: "",
          sub_sub_indicator: "",
          previous_report_period: 0,
          current_period: 0,
          remarks: ""
        }
      ]
    }));
  };

  const removeRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      employmentFacilitation: prev.employmentFacilitation.filter((_, i) => i !== index)
    }));
  };

  const updateIndicatorValue = (
    program: string,
    indicator: string,
    field: 'previous_report_period' | 'current_period',
    value: number
  ) => {
    setFormData(prev => {
      const newData = { ...prev };
      const existingIndex = newData.employmentFacilitation.findIndex(
        row => row.program === program && row.indicator === indicator && !row.sub_indicator
      );

      if (existingIndex === -1) {
        // Add new entry
        const newRow: EmploymentFacilitationRow = {
          program: program as ProgramType,
          indicator,
          sub_indicator: "",
          sub_sub_indicator: "",
          previous_report_period: 0,
          current_period: 0,
          remarks: ""
        };
        newData.employmentFacilitation.push(newRow);
        newData.employmentFacilitation[newData.employmentFacilitation.length - 1][field] = value;
      } else {
        // Update existing entry
        newData.employmentFacilitation[existingIndex] = {
          ...newData.employmentFacilitation[existingIndex],
          [field]: value
        };
      }

      return newData;
    });
  };

  const updateSubIndicatorValue = (
    program: string,
    indicator: string,
    subIndicator: string,
    field: 'previous_report_period' | 'current_period',
    value: number
  ) => {
    setFormData(prev => {
      const newData = { ...prev };
      const existingIndex = newData.employmentFacilitation.findIndex(
        row => row.program === program &&
          row.indicator === indicator &&
          row.sub_indicator === subIndicator &&
          !row.sub_sub_indicator
      );

      if (existingIndex === -1) {
        // Add new entry
        const newRow: EmploymentFacilitationRow = {
          program: program as ProgramType,
          indicator,
          sub_indicator: subIndicator,
          sub_sub_indicator: "",
          previous_report_period: 0,
          current_period: 0,
          remarks: ""
        };
        newData.employmentFacilitation.push(newRow);
        newData.employmentFacilitation[newData.employmentFacilitation.length - 1][field] = value;
      } else {
        // Update existing entry
        newData.employmentFacilitation[existingIndex] = {
          ...newData.employmentFacilitation[existingIndex],
          [field]: value
        };
      }

      return newData;
    });
  };

  const updateSubSubIndicatorValue = (
    program: string,
    indicator: string,
    subIndicator: string,
    subSubIndicator: string,
    field: 'previous_female_count' | 'current_female_count',
    value: number
  ) => {
    setFormData(prev => {
      const newData = { ...prev };
      const existingIndex = newData.employmentFacilitation.findIndex(
        row => row.program === program &&
          row.indicator === indicator &&
          row.sub_indicator === subIndicator &&
          row.sub_sub_indicator === subSubIndicator
      );

      if (existingIndex === -1) {
        // Add new entry
        const newRow: EmploymentFacilitationRow = {
          program: program as ProgramType,
          indicator,
          sub_indicator: subIndicator,
          sub_sub_indicator: subSubIndicator,
          previous_report_period: 0,
          current_period: 0,
          previous_female_count: 0,
          current_female_count: 0,
          remarks: ""
        };
        newData.employmentFacilitation.push(newRow);
        newData.employmentFacilitation[newData.employmentFacilitation.length - 1][field] = value;
      } else {
        // Update existing entry
        newData.employmentFacilitation[existingIndex] = {
          ...newData.employmentFacilitation[existingIndex],
          [field]: value
        };
      }

      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Form Header with Enhanced Card Style */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="text-center max-w-3xl mx-auto relative">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Department of Labor and Employment</h1>
            <p className="text-lg text-gray-600 mb-1">Monthly Report on Implementation of Employment Programs</p>
            <p className="text-sm text-gray-500">Revised SPRPS Form 2003-1</p>
          </div>

          {/* Report Period and Office Section with Enhanced Styling */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reporting Period
                </span>
              </label>
              <input
                type="month"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={formData.reportingPeriod}
                onChange={(e) => setFormData({ ...formData, reportingPeriod: e.target.value })}
              />
              {validationErrors.reportingPeriod && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.reportingPeriod}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Reporting Office
                </span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={formData.reportingOffice}
                onChange={(e) => setFormData({ ...formData, reportingOffice: e.target.value })}
                placeholder="Enter reporting office"
              />
              {validationErrors.reportingOffice && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.reportingOffice}
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert with Enhanced Styling */}
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Unable to Submit Report</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {submitError}
                    {submitError.includes('session') && (
                      <button
                        onClick={() => router.push('/login')}
                        className="ml-2 text-red-800 underline hover:text-red-900"
                      >
                        Log in again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Card with Enhanced Styling */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            {/* Section Header with Gradient */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                I. EMPLOYMENT FACILITATION
              </h2>
              <p className="text-sm text-gray-600 mt-1 ml-7">A. PUBLIC EMPLOYMENT SERVICE OFFICE</p>
            </div>

            {/* Quick Add Section with Enhanced Styling */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Navigate to Indicators
                  </h3>
                </div>

                {/* Program Navigation Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {programOptions.map((program) => (
                    <button
                      key={program.value}
                      type="button"
                      onClick={() => {
                        const element = document.getElementById(`program-${program.value}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-2 font-semibold">
                        {program.label.split('.')[0]}
                      </span>
                      <span className="truncate">{program.label.split('.')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Section with Enhanced Styling */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody className="divide-y divide-gray-100">
                  {programOptions.map((program) => {
                    const indicators = indicatorOptions[program.value] || [];
                    return (
                      <React.Fragment key={program.value}>
                        {/* Program Row */}
                        <tr id={`program-${program.value}`} className="bg-gradient-to-r from-blue-50 to-blue-100/30 font-medium group">
                          <td className="px-6 py-4 text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm">
                                {program.label.split('.')[0]}
                              </span>
                              <span>{program.label.split('.')[1]}</span>
                            </div>
                          </td>
                          <td colSpan={4}></td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  employmentFacilitation: prev.employmentFacilitation.filter(
                                    row => row.program !== program.value
                                  )
                                }));
                              }}
                              className="invisible group-hover:visible p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>

                        {/* Indicators */}
                        {indicators.map((indicator) => {
                          const subIndicators = subIndicatorOptions[indicator.value] || [];
                          const indicatorRow = formData.employmentFacilitation.find(
                            row => row.program === program.value && row.indicator === indicator.value && !row.sub_indicator
                          );

                          return (
                            <React.Fragment key={indicator.value}>
                              {/* Indicator Row */}
                              <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-3 pl-16 text-gray-900">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span>{indicator.label}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={indicatorRow?.previous_report_period || 0}
                                    onChange={(e) => {
                                      const newValue = parseInt(e.target.value) || 0;
                                      updateIndicatorValue(program.value, indicator.value, "previous_report_period", newValue);
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-2"></td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={indicatorRow?.current_period || 0}
                                    onChange={(e) => {
                                      const newValue = parseInt(e.target.value) || 0;
                                      updateIndicatorValue(program.value, indicator.value, "current_period", newValue);
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-2"></td>
                                <td></td>
                              </tr>

                              {/* Sub-indicators */}
                              {subIndicators.map((subInd) => {
                                const subIndicatorRow = formData.employmentFacilitation.find(
                                  row => row.program === program.value &&
                                    row.indicator === indicator.value &&
                                    row.sub_indicator === subInd.value &&
                                    !row.sub_sub_indicator
                                );
                                const subSubIndicators = subIndicatorOptions[subInd.value] || [];

                                // Check if this is a female entry
                                const isFemaleEntry = subInd.value === "FEMALE" || subInd.label.includes("Female");

                                // Check if this is an LRA entry that should not have female styling
                                const isLRAEntry = subInd.label.includes("LRA") ||
                                  subInd.label.includes("Local Government Units") ||
                                  subInd.label.includes("Private Institutions") ||
                                  subInd.label.includes("Schools");

                                // Only apply female styling if it's a female entry and not an LRA entry
                                const shouldApplyFemaleStyling = isFemaleEntry && !isLRAEntry;

                                return (
                                  <React.Fragment key={subInd.value}>
                                    {/* Sub-indicator Row */}
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                      <td className="px-6 py-3 pl-24 text-gray-800">
                                        <div className="flex items-center space-x-2">
                                          <div className={`w-1 h-1 ${shouldApplyFemaleStyling ? 'bg-pink-300' : 'bg-gray-300'} rounded-full`}></div>
                                          <span className="flex items-center space-x-1">
                                            <span>{subInd.label}</span>
                                            {shouldApplyFemaleStyling && (
                                              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            )}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          min="0"
                                          className={`w-full px-3 py-2 rounded-lg border text-center focus:ring-2 transition-colors ${shouldApplyFemaleStyling
                                            ? 'border-pink-200 focus:ring-pink-500 focus:border-pink-500 bg-pink-50/30'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                          value={subIndicatorRow?.previous_report_period || 0}
                                          onChange={(e) => {
                                            const newValue = parseInt(e.target.value) || 0;
                                            updateSubIndicatorValue(
                                              program.value,
                                              indicator.value,
                                              subInd.value,
                                              "previous_report_period",
                                              newValue
                                            );
                                          }}
                                        />
                                      </td>
                                      <td className="px-3 py-2"></td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          min="0"
                                          className={`w-full px-3 py-2 rounded-lg border text-center focus:ring-2 transition-colors ${shouldApplyFemaleStyling
                                            ? 'border-pink-200 focus:ring-pink-500 focus:border-pink-500 bg-pink-50/30'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                          value={subIndicatorRow?.current_period || 0}
                                          onChange={(e) => {
                                            const newValue = parseInt(e.target.value) || 0;
                                            updateSubIndicatorValue(
                                              program.value,
                                              indicator.value,
                                              subInd.value,
                                              "current_period",
                                              newValue
                                            );
                                          }}
                                        />
                                      </td>
                                      <td className="px-3 py-2"></td>
                                      <td></td>
                                    </tr>

                                    {/* Sub-sub-indicators (Female) */}
                                    {subSubIndicators.map((subSubInd) => {
                                      const subSubIndicatorRow = formData.employmentFacilitation.find(
                                        row => row.program === program.value &&
                                          row.indicator === indicator.value &&
                                          row.sub_indicator === subInd.value &&
                                          row.sub_sub_indicator === subSubInd.value
                                      );

                                      return (
                                        <tr key={subSubInd.value} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="px-6 py-3 pl-32 text-gray-700">
                                            <div className="flex items-center space-x-2">
                                              <div className="w-1 h-1 bg-pink-300 rounded-full"></div>
                                              <span className="flex items-center space-x-1">
                                                <span>{subSubInd.label}</span>
                                                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2">
                                            <input
                                              type="number"
                                              min="0"
                                              max={subIndicatorRow?.previous_report_period || 0}
                                              className="w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30"
                                              value={subSubIndicatorRow?.previous_female_count || 0}
                                              onChange={(e) => {
                                                const newValue = parseInt(e.target.value) || 0;
                                                if (newValue <= (subIndicatorRow?.previous_report_period || 0)) {
                                                  updateSubSubIndicatorValue(
                                                    program.value,
                                                    indicator.value,
                                                    subInd.value,
                                                    subSubInd.value,
                                                    "previous_female_count",
                                                    newValue
                                                  );
                                                }
                                              }}
                                            />
                                          </td>
                                          <td className="px-3 py-2"></td>
                                          <td className="px-3 py-2">
                                            <input
                                              type="number"
                                              min="0"
                                              max={subIndicatorRow?.current_period || 0}
                                              className="w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30"
                                              value={subSubIndicatorRow?.current_female_count || 0}
                                              onChange={(e) => {
                                                const newValue = parseInt(e.target.value) || 0;
                                                if (newValue <= (subIndicatorRow?.current_period || 0)) {
                                                  updateSubSubIndicatorValue(
                                                    program.value,
                                                    indicator.value,
                                                    subInd.value,
                                                    subSubInd.value,
                                                    "current_female_count",
                                                    newValue
                                                  );
                                                }
                                              }}
                                            />
                                          </td>
                                          <td className="px-3 py-2"></td>
                                          <td></td>
                                        </tr>
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions with Enhanced Styling */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-lg shadow-lg z-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>

        {/* Validation Errors Popup with Enhanced Styling */}
        {showValidationErrors && Object.keys(validationErrors).length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-amber-200 p-4 max-w-md z-50 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-900 font-medium">Before you submit</h4>
                  <ul className="mt-2 space-y-2">
                    {Object.entries(validationErrors).map(([key, error]) => (
                      <li key={key} className="flex items-start text-sm text-gray-600">
                        <span className="leading-5">{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowValidationErrors(false)}
                className="flex-shrink-0 ml-4 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Message with Enhanced Styling */}
        {submitSuccess && (
          <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-green-200 p-4 max-w-md z-50 animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-900 font-medium">Report Submitted Successfully!</h4>
                <p className="mt-1 text-sm text-gray-600">Your report has been saved. You can now create another report or view your entries.</p>
                <div className="mt-3 flex space-x-4">
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      resetForm();
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500 transition-colors"
                  >
                    Create Another Report
                  </button>
                  <button
                    onClick={() => router.push('/report-entry')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    View Report Entries →
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="flex-shrink-0 ml-4 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Animations */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}