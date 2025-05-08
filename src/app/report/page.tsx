"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { reportService } from '@/services/reportService';
import { toast } from 'react-hot-toast';
import { ProgramType, EmploymentFacilitation, EmploymentFacilitationRow } from "@/types/database.types";
import { programOptions, indicatorOptions, subIndicatorOptions } from "@/constants/indicatorOptions";

// Import types from a shared location
import {
  FieldType,
  IndicatorOption,
  IndicatorOptionsMap
} from '@/types/report.types';

import QuickAddModal, { QuickAddData } from './QuickAddModal';

interface ReportData {
  employmentFacilitation: EmploymentFacilitationRow[];
  reportingPeriod: string;
  reportingOffice: string;
}

// Utility to generate all possible rows
function generateAllEmploymentRows(): EmploymentFacilitationRow[] {
  const rows: EmploymentFacilitationRow[] = [];
  programOptions.forEach((program) => {
    const indicators = indicatorOptions[program.value] || [];
    indicators.forEach((indicator) => {
      const subIndicators = subIndicatorOptions[indicator.value] || [];
      if (subIndicators.length > 0) {
        // Special case: if the only sub-indicator is 'FEMALE', treat as indicator with sub_sub_indicator: 'FEMALE'
        if (subIndicators.length === 1 && subIndicators[0].value === 'FEMALE') {
          rows.push({
            program: program.value as ProgramType,
            indicator: indicator.value,
            sub_indicator: '',
            sub_sub_indicator: '',
            previous_report_period: 0,
            current_period: 0,
            previous_female_count: 0,
            current_female_count: 0,
            remarks: ""
          });
          rows.push({
            program: program.value as ProgramType,
            indicator: indicator.value,
            sub_indicator: 'FEMALE',
            sub_sub_indicator: '',
            previous_report_period: 0,
            current_period: 0,
            previous_female_count: 0,
            current_female_count: 0,
            remarks: ""
          });
        } else {
          subIndicators.forEach((subInd) => {
            // Always add the total row for the sub-indicator
            rows.push({
              program: program.value as ProgramType,
              indicator: indicator.value,
              sub_indicator: subInd.value,
              sub_sub_indicator: '',
              previous_report_period: 0,
              current_period: 0,
              previous_female_count: 0,
              current_female_count: 0,
              remarks: ""
            });
            // Add all sub-sub-indicator rows (including 'FEMALE')
            const subSubIndicators = subIndicatorOptions[subInd.value] || [];
            subSubIndicators.forEach((subSubInd) => {
              rows.push({
                program: program.value as ProgramType,
                indicator: indicator.value,
                sub_indicator: subInd.value,
                sub_sub_indicator: subSubInd.value,
                previous_report_period: 0,
                current_period: 0,
                previous_female_count: 0,
                current_female_count: 0,
                remarks: ""
              });
            });
            // If the sub-indicator itself is 'FEMALE' and there are no sub-sub-indicators, add a row for it
            if (subSubIndicators.length === 0 && subInd.value === 'FEMALE') {
              rows.push({
                program: program.value as ProgramType,
                indicator: indicator.value,
                sub_indicator: subInd.value,
                sub_sub_indicator: '',
                previous_report_period: 0,
                current_period: 0,
                previous_female_count: 0,
                current_female_count: 0,
                remarks: ""
              });
            }
          });
        }
      } else {
        // No subIndicators, just add the indicator row
        rows.push({
          program: program.value as ProgramType,
          indicator: indicator.value,
          sub_indicator: '',
          sub_sub_indicator: '',
          previous_report_period: 0,
          current_period: 0,
          previous_female_count: 0,
          current_female_count: 0,
          remarks: ""
        });
      }
    });
  });
  // Debug output of all generated rows
  if (typeof window !== 'undefined') {
    console.group('generateAllEmploymentRows() output');
    console.table(rows.map(r => ({
      program: r.program,
      indicator: r.indicator,
      sub_indicator: r.sub_indicator,
      sub_sub_indicator: r.sub_sub_indicator
    })));
    console.groupEnd();
  }
  return rows;
}

// Helper to get correct subIndicatorOptions key for APPLICANTS_REGISTERED
function getApplicantsRegisteredSubIndicatorKey(indicator: string) {
  switch (indicator) {
    case 'REGULAR_PROGRAM':
      return 'REGULAR_PROGRAM_APPLICANTS';
    case 'SPES':
      return 'SPES_APPLICANTS';
    case 'WAP':
      return 'WAP_APPLICANTS';
    case 'TULAY':
      return 'TULAY_APPLICANTS';
    case 'RETRENCHED':
      return 'RETRENCHED_APPLICANTS';
    case 'OFWS':
      return 'OFWS_APPLICANTS';
    case 'MIGRATORY':
      return 'MIGRATORY_APPLICANTS';
    case 'RURAL':
      return 'RURAL_APPLICANTS';
    default:
      return indicator;
  }
}

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
        previous_female_count: 0,
        current_female_count: 0,
        remarks: ""
      }
    ],
    reportingPeriod: "",
    reportingOffice: ""
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(true);
  const [formData, setFormData] = useState<ReportData>(initialFormState);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddData, setQuickAddData] = useState<QuickAddData | null>(null);

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

  // Always initialize all possible rows when reporting period or office changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      employmentFacilitation: generateAllEmploymentRows()
    }));
  }, [formData.reportingPeriod, formData.reportingOffice]);

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
      const processedEntries: Omit<EmploymentFacilitation, 'id' | 'report_id' | 'created_at' | 'updated_at'>[] = [];

      programOptions.forEach((program: { value: ProgramType; label: string }) => {
        const programValue = program.value as ProgramType;
        const indicators = indicatorOptions[programValue] || [];

        indicators.forEach((indicator: IndicatorOption) => {
          let subIndicators = subIndicatorOptions[indicator.value] || [];
          // Patch: For APPLICANTS_REGISTERED, use the correct subIndicatorOptions key
          if (programValue === 'APPLICANTS_REGISTERED') {
            const correctKey = getApplicantsRegisteredSubIndicatorKey(indicator.value);
            subIndicators = subIndicatorOptions[correctKey] || [];
          }
          const isSpecialCategory = ['RETRENCHED', 'OFWS', 'MIGRATORY', 'RURAL'].includes(indicator.value);

          if (isSpecialCategory) {
            // Total row
            const totalRow = formData.employmentFacilitation.find(
              entry => entry.program === programValue &&
                entry.indicator === indicator.value &&
                entry.sub_indicator === '' &&
                entry.sub_sub_indicator === ''
            );
            if (totalRow) {
              processedEntries.push({
                program: programValue,
                indicator: indicator.value,
                sub_indicator: '',
                sub_sub_indicator: '',
                previous_report_period: totalRow.previous_report_period,
                current_period: totalRow.current_period,
                previous_female_count: null,
                current_female_count: null,
                remarks: totalRow.remarks || ''
              });
            }
            // Female row
            const femaleRow = formData.employmentFacilitation.find(
              entry => entry.program === programValue &&
                entry.indicator === indicator.value &&
                entry.sub_indicator === '' &&
                entry.sub_sub_indicator === 'FEMALE'
            );
            if (femaleRow) {
              processedEntries.push({
                program: programValue,
                indicator: indicator.value,
                sub_indicator: '',
                sub_sub_indicator: 'FEMALE',
                previous_report_period: 0,
                current_period: 0,
                previous_female_count: femaleRow.previous_female_count || 0,
                current_female_count: femaleRow.current_female_count || 0,
                remarks: femaleRow.remarks || ''
              });
            }
            return; // Skip normal subIndicator/subSubIndicator logic for these
          }

          if (subIndicators.length > 0) {
            subIndicators.forEach((subInd: IndicatorOption) => {
              const isFemaleSubIndicator = subInd.value.includes("FEMALE");

              const mainEntry = formData.employmentFacilitation.find(
                entry => entry.program === programValue &&
                  entry.indicator === indicator.value &&
                  entry.sub_indicator === subInd.value &&
                  (!entry.sub_sub_indicator || entry.sub_sub_indicator === "")
              );

              const subSubIndicators = subIndicatorOptions[subInd.value] || [];

              if (subSubIndicators.length > 0) {
                subSubIndicators.forEach((subSubInd: IndicatorOption) => {
                  const isFemaleEntry = subSubInd.value.includes("FEMALE");

                  if (isFemaleEntry) {
                    const femaleEntry = formData.employmentFacilitation.find(
                      entry => entry.program === programValue &&
                        entry.indicator === indicator.value &&
                        entry.sub_indicator === subInd.value &&
                        entry.sub_sub_indicator === subSubInd.value
                    );

                    if (femaleEntry) {
                      // Store in female fields, not total fields
                      processedEntries.push({
                        program: programValue,
                        indicator: indicator.value,
                        sub_indicator: subInd.value,
                        sub_sub_indicator: subSubInd.value,
                        previous_report_period: 0,
                        current_period: 0,
                        previous_female_count: femaleEntry.previous_female_count || 0,
                        current_female_count: femaleEntry.current_female_count || 0,
                        remarks: femaleEntry.remarks || ""
                      });
                    }
                  }
                });
              }

              if (mainEntry) {
                if (isFemaleSubIndicator) {
                  // Store in female fields, not total fields
                  processedEntries.push({
                    program: programValue,
                    indicator: indicator.value,
                    sub_indicator: subInd.value,
                    sub_sub_indicator: "",
                    previous_report_period: 0,
                    current_period: 0,
                    previous_female_count: mainEntry.previous_female_count || 0,
                    current_female_count: mainEntry.current_female_count || 0,
                    remarks: mainEntry.remarks || ""
                  });
                } else {
                  processedEntries.push({
                    program: programValue,
                    indicator: indicator.value,
                    sub_indicator: subInd.value,
                    sub_sub_indicator: "",
                    previous_report_period: mainEntry.previous_report_period,
                    current_period: mainEntry.current_period,
                    previous_female_count: null,
                    current_female_count: null,
                    remarks: mainEntry.remarks || ""
                  });
                }
              }
            });
          } else {
            const mainEntry = formData.employmentFacilitation.find(
              entry => entry.program === programValue &&
                entry.indicator === indicator.value &&
                (!entry.sub_indicator || entry.sub_indicator === "")
            );

            if (mainEntry) {
              processedEntries.push({
                program: programValue,
                indicator: indicator.value,
                sub_indicator: null,
                sub_sub_indicator: null,
                previous_report_period: mainEntry.previous_report_period,
                current_period: mainEntry.current_period,
                previous_female_count: null,
                current_female_count: null,
                remarks: mainEntry.remarks || ""
              });
            }
          }
        });
      });

      // Call the report service to create the report
      const result = await reportService.createReport(
        formData.reportingPeriod || new Date().toISOString().slice(0, 7),
        formData.reportingOffice || 'Default Office',
        processedEntries
      );

      if (result) {
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
      const isFemale = subIndicator.includes('FEMALE');
      const existingIndex = newData.employmentFacilitation.findIndex(
        row => row.program === program &&
          row.indicator === indicator &&
          row.sub_indicator === subIndicator &&
          row.sub_sub_indicator === ""
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
          previous_female_count: 0,
          current_female_count: 0,
          remarks: ""
        };
        if (isFemale) {
          newRow[field === 'previous_report_period' ? 'previous_female_count' : 'current_female_count'] = value;
        } else {
          newRow[field] = value;
        }
        newData.employmentFacilitation.push(newRow);
      } else {
        // Update existing entry
        if (isFemale) {
          newData.employmentFacilitation[existingIndex] = {
            ...newData.employmentFacilitation[existingIndex],
            [field === 'previous_report_period' ? 'previous_female_count' : 'current_female_count']: value
          };
        } else {
          newData.employmentFacilitation[existingIndex] = {
            ...newData.employmentFacilitation[existingIndex],
            [field]: value
          };
        }
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
      const isFemale = subSubIndicator.includes('FEMALE');
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
        if (isFemale) {
          newRow[field] = value;
        } else {
          newRow[field === 'previous_female_count' ? 'previous_report_period' : 'current_period'] = value;
        }
        newData.employmentFacilitation.push(newRow);
      } else {
        // Update existing entry
        if (isFemale) {
          newData.employmentFacilitation[existingIndex] = {
            ...newData.employmentFacilitation[existingIndex],
            [field]: value
          };
        } else {
          newData.employmentFacilitation[existingIndex] = {
            ...newData.employmentFacilitation[existingIndex],
            [field === 'previous_female_count' ? 'previous_report_period' : 'current_period']: value
          };
        }
      }
      return newData;
    });
  };

  // Utility to fill all fields with sample data
  function fillAllFieldsWithSampleData() {
    const allRows = generateAllEmploymentRows();
    if (typeof window !== 'undefined') {
      console.group('fillAllFieldsWithSampleData: rows to fill');
      console.table(allRows.map(r => ({
        program: r.program,
        indicator: r.indicator,
        sub_indicator: r.sub_indicator,
        sub_sub_indicator: r.sub_sub_indicator
      })));
      console.groupEnd();
    }
    setFormData(prev => ({
      ...prev,
      employmentFacilitation: allRows.map(row => {
        if ((row.sub_indicator && row.sub_indicator.includes('FEMALE')) || (row.sub_sub_indicator && row.sub_sub_indicator.includes('FEMALE'))) {
          return {
            ...row,
            previous_report_period: 0,
            current_period: 0,
            previous_female_count: 5,
            current_female_count: 10
          };
        } else {
          return {
            ...row,
            previous_report_period: 10,
            current_period: 20,
            previous_female_count: 0,
            current_female_count: 0
          };
        }
      })
    }));
  }

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
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(true)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    12 Available Jobs
                  </button>
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
                {/* Quick Add Data Summary */}
                {quickAddData && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 mb-2">Quick Add Summary</h4>
                    <div className="mb-2">
                      <span className="font-medium">Top Jobs:</span>
                      <ul className="list-disc ml-6 text-sm">
                        {quickAddData.topJobs.map((job, idx) => (
                          <li key={idx}>{job.position} (Vacancies: {job.vacancies}, Qualified: {job.qualified})</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Education:</span>
                      <span className="ml-2 text-sm">Elementary: {quickAddData.education.elementary}, Secondary: {quickAddData.education.secondary}, College: {quickAddData.education.college}, Graduate: {quickAddData.education.graduate}</span>
                    </div>
                    <div>
                      <span className="font-medium">Sectors:</span>
                      <span className="ml-2 text-sm">Government: {quickAddData.sectors.government}, Private: {quickAddData.sectors.private}, Overseas: {quickAddData.sectors.overseas}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Fill Button for Testing */}
            <div className="flex justify-end mb-4 gap-2">
              <button
                type="button"
                onClick={fillAllFieldsWithSampleData}
                className="px-4 py-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-200 transition font-medium text-sm shadow-sm"
              >
                Fill All Fields with Sample Data
              </button>
              <button
                type="button"
                onClick={() => { if (typeof window !== 'undefined') { console.log('formData.employmentFacilitation', formData.employmentFacilitation); } }}
                className="px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-200 transition font-medium text-sm shadow-sm"
              >
                Debug: Log Current Form Data
              </button>
            </div>

            {/* Table Section with Enhanced Styling */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-gray-900">
                    <th className="px-6 py-3 text-left font-bold border-b border-blue-200 align-bottom" style={{ minWidth: 260 }}>
                      INDICATOR <span className="block text-xs font-normal text-gray-600">(OUTPUT SPECIFICATION)</span>
                    </th>
                    <th className="px-3 py-3 text-center font-bold border-b border-blue-200">PREVIOUS REPORTING PERIOD</th>
                    <th className="px-3 py-3 text-center font-bold border-b border-blue-200">CURRENT REPORTING PERIOD</th>
                    <th className="px-3 py-3 border-b border-blue-200"></th>
                  </tr>
                </thead>
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
                          <td colSpan={2}></td>
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
                          let subIndicators = subIndicatorOptions[indicator.value] || [];
                          // Patch: For APPLICANTS_REGISTERED, use the correct subIndicatorOptions key
                          if (program.value === 'APPLICANTS_REGISTERED') {
                            const correctKey = getApplicantsRegisteredSubIndicatorKey(indicator.value);
                            subIndicators = subIndicatorOptions[correctKey] || [];
                          }
                          const indicatorLabel = indicatorOptions[program.value]?.find(opt => opt.value === indicator.value)?.label || indicator.label;
                          const indicatorRow = formData.employmentFacilitation.find(
                            row => row.program === program.value && row.indicator === indicator.value && !row.sub_indicator
                          );
                          // Special categories for female row
                          const isSpecialCategory = ['RETRENCHED', 'OFWS', 'MIGRATORY', 'RURAL'].includes(indicator.value);
                          return (
                            <React.Fragment key={indicator.value}>
                              {/* Main indicator row (total) */}
                              <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-3 pl-16 text-gray-900">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span>{indicatorLabel}</span>
                                  </div>
                                </td>
                                {/* Previous period input */}
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={indicatorRow?.previous_report_period === 0 || indicatorRow?.previous_report_period === undefined ? '' : indicatorRow?.previous_report_period}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/^0+(?!$)/, '');
                                      const newValue = val === '' ? 0 : parseInt(val) || 0;
                                      updateIndicatorValue(program.value, indicator.value, "previous_report_period", newValue);
                                    }}
                                  />
                                </td>
                                {/* Current period input */}
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={indicatorRow?.current_period === 0 || indicatorRow?.current_period === undefined ? '' : indicatorRow?.current_period}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/^0+(?!$)/, '');
                                      const newValue = val === '' ? 0 : parseInt(val) || 0;
                                      updateIndicatorValue(program.value, indicator.value, "current_period", newValue);
                                    }}
                                  />
                                </td>
                                <td></td>
                              </tr>
                              {/* Special Category Female Row */}
                              {isSpecialCategory && (
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-3 pl-24 text-gray-800">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-1 h-1 bg-pink-300 rounded-full"></div>
                                      <span className="flex items-center space-x-1">
                                        <span>{(subIndicatorOptions[indicator.value]?.[0]?.label) || (indicator.label + ' Female')}</span>
                                        <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </span>
                                    </div>
                                  </td>
                                  {/* Previous period input (female) */}
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      min="0"
                                      className="w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30"
                                      value={(
                                        formData.employmentFacilitation.find(row =>
                                          row.program === program.value &&
                                          row.indicator === indicator.value &&
                                          row.sub_indicator === '' &&
                                          row.sub_sub_indicator === 'FEMALE')?.previous_female_count || 0
                                      )}
                                      onChange={e => updateSubSubIndicatorValue(
                                        program.value,
                                        indicator.value,
                                        '',
                                        'FEMALE',
                                        'previous_female_count',
                                        parseInt(e.target.value) || 0
                                      )}
                                    />
                                  </td>
                                  {/* Current period input (female) */}
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      min="0"
                                      className="w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30"
                                      value={(
                                        formData.employmentFacilitation.find(row =>
                                          row.program === program.value &&
                                          row.indicator === indicator.value &&
                                          row.sub_indicator === '' &&
                                          row.sub_sub_indicator === 'FEMALE')?.current_female_count || 0
                                      )}
                                      onChange={e => updateSubSubIndicatorValue(
                                        program.value,
                                        indicator.value,
                                        '',
                                        'FEMALE',
                                        'current_female_count',
                                        parseInt(e.target.value) || 0
                                      )}
                                    />
                                  </td>
                                  <td></td>
                                </tr>
                              )}
                              {/* Sub-indicators */}
                              {!isSpecialCategory && subIndicators.map((subInd) => {
                                // For 2.x, subInd is e.g. "2.1.1 Local employment"
                                const subIndicatorLabel = subInd.label;
                                const subIndicatorRow = formData.employmentFacilitation.find(
                                  row => row.program === program.value &&
                                    row.indicator === indicator.value &&
                                    row.sub_indicator === subInd.value &&
                                    (!row.sub_sub_indicator || row.sub_sub_indicator === "")
                                );
                                const subSubIndicators = subIndicatorOptions[subInd.value] || [];
                                return (
                                  <React.Fragment key={subInd.value}>
                                    {/* Sub-indicator row: always two inputs (total) */}
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                      <td className="px-6 py-3 pl-24 text-gray-800">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                          <span>{subIndicatorLabel}</span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          min="0"
                                          className={subInd.value.includes('FEMALE') && subSubIndicators.length === 0 ? "w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30" : "w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"}
                                          value={subInd.value.includes('FEMALE') && subSubIndicators.length === 0
                                            ? (subIndicatorRow?.previous_female_count === 0 || subIndicatorRow?.previous_female_count === undefined ? '' : subIndicatorRow?.previous_female_count)
                                            : (subIndicatorRow?.previous_report_period === 0 || subIndicatorRow?.previous_report_period === undefined ? '' : subIndicatorRow?.previous_report_period)
                                          }
                                          onChange={e => {
                                            let val = e.target.value.replace(/^0+(?!$)/, '');
                                            const newValue = val === '' ? 0 : parseInt(val) || 0;
                                            if (subInd.value.includes('FEMALE') && subSubIndicators.length === 0) {
                                              updateSubIndicatorValue(
                                                program.value,
                                                indicator.value,
                                                subInd.value,
                                                'previous_report_period',
                                                newValue
                                              );
                                            } else {
                                              updateSubIndicatorValue(
                                                program.value,
                                                indicator.value,
                                                subInd.value,
                                                'previous_report_period',
                                                newValue
                                              );
                                            }
                                          }}
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          min="0"
                                          className={subInd.value.includes('FEMALE') && subSubIndicators.length === 0 ? "w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30" : "w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"}
                                          value={subInd.value.includes('FEMALE') && subSubIndicators.length === 0
                                            ? (subIndicatorRow?.current_female_count === 0 || subIndicatorRow?.current_female_count === undefined ? '' : subIndicatorRow?.current_female_count)
                                            : (subIndicatorRow?.current_period === 0 || subIndicatorRow?.current_period === undefined ? '' : subIndicatorRow?.current_period)
                                          }
                                          onChange={e => {
                                            let val = e.target.value.replace(/^0+(?!$)/, '');
                                            const newValue = val === '' ? 0 : parseInt(val) || 0;
                                            if (subInd.value.includes('FEMALE') && subSubIndicators.length === 0) {
                                              updateSubIndicatorValue(
                                                program.value,
                                                indicator.value,
                                                subInd.value,
                                                'current_period',
                                                newValue
                                              );
                                            } else {
                                              updateSubIndicatorValue(
                                                program.value,
                                                indicator.value,
                                                subInd.value,
                                                'current_period',
                                                newValue
                                              );
                                            }
                                          }}
                                        />
                                      </td>
                                      <td></td>
                                    </tr>
                                    {/* Sub-sub-indicator rows (e.g., Female) */}
                                    {subSubIndicators.map((subSubInd) => {
                                      const isFemale = subSubInd.value.includes("FEMALE");
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
                                              <div className={`w-1 h-1 ${isFemale ? 'bg-pink-300' : 'bg-gray-300'} rounded-full`}></div>
                                              <span>{subSubInd.label}</span>
                                              {isFemale && (
                                                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2">
                                            <input
                                              type="number"
                                              min="0"
                                              className={isFemale ? "w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30" : "w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"}
                                              value={isFemale ? (subSubIndicatorRow?.previous_female_count === 0 || subSubIndicatorRow?.previous_female_count === undefined ? '' : subSubIndicatorRow?.previous_female_count) : (subSubIndicatorRow?.previous_report_period === 0 || subSubIndicatorRow?.previous_report_period === undefined ? '' : subSubIndicatorRow?.previous_report_period)}
                                              onChange={(e) => {
                                                let val = e.target.value.replace(/^0+(?!$)/, '');
                                                const newValue = val === '' ? 0 : parseInt(val) || 0;
                                                if (isFemale) {
                                                  updateSubSubIndicatorValue(
                                                    program.value,
                                                    indicator.value,
                                                    subInd.value,
                                                    subSubInd.value,
                                                    "previous_female_count",
                                                    newValue
                                                  );
                                                } else {
                                                  setFormData(prev => {
                                                    const newData = { ...prev };
                                                    const idx = newData.employmentFacilitation.findIndex(
                                                      row => row.program === program.value &&
                                                        row.indicator === indicator.value &&
                                                        row.sub_indicator === subInd.value &&
                                                        row.sub_sub_indicator === subSubInd.value
                                                    );
                                                    if (idx !== -1) {
                                                      newData.employmentFacilitation[idx] = {
                                                        ...newData.employmentFacilitation[idx],
                                                        previous_report_period: newValue
                                                      };
                                                    }
                                                    return newData;
                                                  });
                                                }
                                              }}
                                            />
                                          </td>
                                          <td className="px-3 py-2">
                                            <input
                                              type="number"
                                              min="0"
                                              className={isFemale ? "w-full px-3 py-2 rounded-lg border border-pink-200 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30" : "w-full px-3 py-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"}
                                              value={isFemale ? (subSubIndicatorRow?.current_female_count === 0 || subSubIndicatorRow?.current_female_count === undefined ? '' : subSubIndicatorRow?.current_female_count) : (subSubIndicatorRow?.current_period === 0 || subSubIndicatorRow?.current_period === undefined ? '' : subSubIndicatorRow?.current_period)}
                                              onChange={(e) => {
                                                let val = e.target.value.replace(/^0+(?!$)/, '');
                                                const newValue = val === '' ? 0 : parseInt(val) || 0;
                                                if (isFemale) {
                                                  updateSubSubIndicatorValue(
                                                    program.value,
                                                    indicator.value,
                                                    subInd.value,
                                                    subSubInd.value,
                                                    "current_female_count",
                                                    newValue
                                                  );
                                                } else {
                                                  setFormData(prev => {
                                                    const newData = { ...prev };
                                                    const idx = newData.employmentFacilitation.findIndex(
                                                      row => row.program === program.value &&
                                                        row.indicator === indicator.value &&
                                                        row.sub_indicator === subInd.value &&
                                                        row.sub_sub_indicator === subSubInd.value
                                                    );
                                                    if (idx !== -1) {
                                                      newData.employmentFacilitation[idx] = {
                                                        ...newData.employmentFacilitation[idx],
                                                        current_period: newValue
                                                      };
                                                    }
                                                    return newData;
                                                  });
                                                }
                                              }}
                                            />
                                          </td>
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

        {/* Quick Add Modal Integration */}
        <QuickAddModal
          open={showQuickAddModal}
          onClose={() => setShowQuickAddModal(false)}
          onSave={data => setQuickAddData(data)}
          initialData={quickAddData || undefined}
        />

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