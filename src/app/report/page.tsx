"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { reportService } from '@/services/reportService';
import { profileService } from '@/services/profileService';
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
import AvailableJobsModal, { TopJob } from './modals/AvailableJobsModal';
import GenderDistributionModal from './modals/GenderDistributionModal';
import EmploymentSectorsModal from './modals/EmploymentSectorsModal';
import LoadingOverlay from "../LoadingOverlay";

interface ReportData {
  employmentFacilitation: EmploymentFacilitationRow[];
  reportingPeriod: string;
  reportingOffice: string;
  mayor: string;
  name: string;
}

// Utility to generate all possible rows
function generateAllEmploymentRows(): EmploymentFacilitationRow[] {
  const rows: EmploymentFacilitationRow[] = [];
  // List of section 2 special indicators that need a total row
  const section2SpecialIndicators = ['RETRENCHED_2', 'OFWS_2', 'MIGRATORY_2', 'RURAL_2', 'WAP_2'];
  programOptions.forEach((program) => {
    const indicators = indicatorOptions[program.value] || [];
    indicators.forEach((indicator) => {
      const subIndicators = subIndicatorOptions[indicator.value] || [];
      // Always add a total row for section 2 special indicators
      if (section2SpecialIndicators.includes(indicator.value)) {
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
      } else if (!section2SpecialIndicators.includes(indicator.value)) {
        // No subIndicators, just add the indicator row (but skip for section 2 special indicators, already added above)
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
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    reportingOffice: "",
    mayor: "",
    name: ""
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(true);
  const [formData, setFormData] = useState<ReportData>(initialFormState);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddData, setQuickAddData] = useState<QuickAddData | null>(null);
  const [showAvailableJobs, setShowAvailableJobs] = useState(false);
  const [showGenderDistribution, setShowGenderDistribution] = useState(false);
  const [showEmploymentSectors, setShowEmploymentSectors] = useState(false);

  const [availableJobs, setAvailableJobs] = useState<TopJob[]>([]);
  const [genderDistribution, setGenderDistribution] = useState<{ male: string; female: string }>({ male: '', female: '' });
  const [employmentSectors, setEmploymentSectors] = useState<{ government: string; private: string }>({ government: '', private: '' });

  const [previousPeriodEntries, setPreviousPeriodEntries] = useState<EmploymentFacilitationRow[]>([]);
  const prevFetchParams = useRef<{ period: string; office: string; userId: string } | null>(null);

  // Reset all relevant state on mount or when the route changes
  useEffect(() => {
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setValidationErrors({});
    setShowValidationErrors(false);
    setSubmitError(null);
    setFormData(initialFormState);
  }, [pathname]);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "user") {
        window.location.href = "/login";
        return;
      }
      // Set the reporting office and mayor from user's address and municipal_mayor
      setFormData(prev => ({
        ...prev,
        reportingOffice: user.address || "",
        mayor: user.municipal_mayor || "",
        name: user.name || ""
      }));
    }
  }, [user, loading, router]);

  // Always initialize all possible rows when reporting period or office changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      employmentFacilitation: generateAllEmploymentRows()
    }));
  }, [formData.reportingPeriod, formData.reportingOffice]);

  // Fetch previous period data when reportingPeriod, reportingOffice, or user changes
  useEffect(() => {
    async function fetchPrevious() {
      if (!user || !formData.reportingPeriod || !formData.reportingOffice) {
        setPreviousPeriodEntries([]);
        return;
      }
      // Avoid refetching if params haven't changed
      const params = { period: formData.reportingPeriod, office: formData.reportingOffice, userId: user.id };
      if (
        prevFetchParams.current &&
        prevFetchParams.current.period === params.period &&
        prevFetchParams.current.office === params.office &&
        prevFetchParams.current.userId === params.userId
      ) {
        return;
      }
      prevFetchParams.current = params;
      const prev = await reportService.getPreviousReport(
        formData.reportingPeriod,
        formData.reportingOffice,
        user.id
      );
      setPreviousPeriodEntries(prev?.employment_facilitation_entries || []);
    }
    fetchPrevious();
  }, [user, formData.reportingPeriod, formData.reportingOffice]);

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
            const prevRow = previousPeriodEntries.find(
              entry => entry.program === programValue &&
                entry.indicator === indicator.value &&
                entry.sub_indicator === '' &&
                entry.sub_sub_indicator === ''
            );
            if (totalRow) {
              const prevValue = prevRow ? prevRow.current_period : 0;
              const currValue = totalRow.current_period || 0;
              processedEntries.push({
                program: programValue,
                indicator: indicator.value,
                sub_indicator: '',
                sub_sub_indicator: '',
                previous_report_period: prevValue + currValue,
                current_period: currValue,
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
            const prevFemaleRow = previousPeriodEntries.find(
              entry => entry.program === programValue &&
                entry.indicator === indicator.value &&
                entry.sub_indicator === '' &&
                entry.sub_sub_indicator === 'FEMALE'
            );
            if (femaleRow) {
              const prevFemale = Number(prevFemaleRow?.current_female_count) || 0;
              const currFemale = Number(femaleRow?.current_female_count) || 0;
              processedEntries.push({
                program: programValue,
                indicator: indicator.value,
                sub_indicator: '',
                sub_sub_indicator: 'FEMALE',
                previous_report_period: 0,
                current_period: 0,
                previous_female_count: prevFemale + currFemale,
                current_female_count: currFemale,
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
              const prevMainEntry = previousPeriodEntries.find(
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
                    const prevFemaleEntry = previousPeriodEntries.find(
                      entry => entry.program === programValue &&
                        entry.indicator === indicator.value &&
                        entry.sub_indicator === subInd.value &&
                        entry.sub_sub_indicator === subSubInd.value
                    );
                    if (femaleEntry) {
                      const prevFemale = Number(prevFemaleEntry?.current_female_count) || 0;
                      const currFemale = Number(femaleEntry?.current_female_count) || 0;
                      processedEntries.push({
                        program: programValue,
                        indicator: indicator.value,
                        sub_indicator: subInd.value,
                        sub_sub_indicator: subSubInd.value,
                        previous_report_period: 0,
                        current_period: 0,
                        previous_female_count: prevFemale + currFemale,
                        current_female_count: currFemale,
                        remarks: femaleEntry.remarks || ""
                      });
                    }
                  } else {
                    const entry = formData.employmentFacilitation.find(
                      row => row.program === programValue &&
                        row.indicator === indicator.value &&
                        row.sub_indicator === subInd.value &&
                        row.sub_sub_indicator === subSubInd.value
                    );
                    const prevEntry = previousPeriodEntries.find(
                      row => row.program === programValue &&
                        row.indicator === indicator.value &&
                        row.sub_indicator === subInd.value &&
                        row.sub_sub_indicator === subSubInd.value
                    );
                    if (entry) {
                      const prevValue = prevEntry ? prevEntry.current_period : 0;
                      const currValue = entry.current_period || 0;
                      processedEntries.push({
                        program: programValue,
                        indicator: indicator.value,
                        sub_indicator: subInd.value,
                        sub_sub_indicator: subSubInd.value,
                        previous_report_period: prevValue + currValue,
                        current_period: currValue,
                        previous_female_count: null,
                        current_female_count: null,
                        remarks: entry.remarks || ""
                      });
                    }
                  }
                });
              }

              if (mainEntry) {
                if (isFemaleSubIndicator) {
                  const prevFemale = Number(prevMainEntry?.current_female_count) || 0;
                  const currFemale = Number(mainEntry?.current_female_count) || 0;
                  processedEntries.push({
                    program: programValue,
                    indicator: indicator.value,
                    sub_indicator: subInd.value,
                    sub_sub_indicator: "",
                    previous_report_period: 0,
                    current_period: 0,
                    previous_female_count: prevFemale + currFemale,
                    current_female_count: currFemale,
                    remarks: mainEntry.remarks || ""
                  });
                } else {
                  const prevValue = prevMainEntry ? prevMainEntry.current_period : 0;
                  const currValue = mainEntry.current_period || 0;
                  processedEntries.push({
                    program: programValue,
                    indicator: indicator.value,
                    sub_indicator: subInd.value,
                    sub_sub_indicator: "",
                    previous_report_period: prevValue + currValue,
                    current_period: currValue,
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
            const prevMainEntry = previousPeriodEntries.find(
              entry => entry.program === programValue &&
                entry.indicator === indicator.value &&
                (!entry.sub_indicator || entry.sub_indicator === "")
            );
            if (mainEntry) {
              const prevValue = prevMainEntry ? prevMainEntry.current_period : 0;
              const currValue = mainEntry.current_period || 0;
              processedEntries.push({
                program: programValue,
                indicator: indicator.value,
                sub_indicator: null,
                sub_sub_indicator: null,
                previous_report_period: prevValue + currValue,
                current_period: currValue,
                previous_female_count: null,
                current_female_count: null,
                remarks: mainEntry.remarks || ""
              });
            }
          }
        });
      });

      // Call the report service to create the report
      if (!user) throw new Error('User not authenticated');
      const result = await reportService.createReport(
        formData.reportingPeriod || new Date().toISOString().slice(0, 7),
        formData.reportingOffice || 'Default Office',
        processedEntries,
        user.id // Pass userId as UUID
      );

      if (result) {
        setSubmitSuccess(true);
        toast.success('Report submitted successfully!');
        // Reset form after successful submission
        setFormData(initialFormState);
      } else {
        throw new Error('Failed to create report. Please try again.');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the report';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
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

  // Add debounce utility
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // In the Name input
  const debouncedUpdateName = debounce(async (newName: string) => {
    if (user && newName !== user.name) {
      try {
        const success = await profileService.updateName(user.id, newName);
        if (success && refreshUser) await refreshUser();
      } catch (err) {
        // Optionally handle error
      }
    }
  }, 600);

  // In the Mayor input
  const debouncedUpdateMayor = debounce(async (newMayor: string) => {
    if (user && newMayor !== user.municipal_mayor) {
      try {
        const success = await profileService.updateMayor(user.id, newMayor);
        if (success && refreshUser) await refreshUser();
      } catch (err) {
        // Optionally handle error
      }
    }
  }, 600);

  // Centralized loading spinner using AuthContext's loading
  if (loading) {
    return <LoadingOverlay show={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#101624] dark:to-[#181c2a] py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Form Header with Enhanced Card Style */}
        <div className="bg-white dark:bg-[#181c2a] rounded-xl shadow-md border border-gray-200 dark:border-blue-900 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="text-center max-w-3xl mx-auto relative">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-blue-100 mb-2">Department of Labor and Employment</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">Monthly Report on Implementation of Employment Programs</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Revised SPRPS Form 2003-1</p>
          </div>

          {/* Report Period and Office Section with Enhanced Styling */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reporting Period
                </span>
              </label>
              <input
                type="month"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"
                value={formData.reportingPeriod}
                onChange={(e) => setFormData({ ...formData, reportingPeriod: e.target.value })}
              />
              {validationErrors.reportingPeriod && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.reportingPeriod}
                </p>
              )}
              {/* Name input */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 mt-4">
                <span className="flex items-center gap-2">
                  {/* User icon for Name */}
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Name
                </span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"
                value={formData.name || ''}
                onChange={e => {
                  const newName = e.target.value;
                  setFormData({ ...formData, name: newName });
                  if (user && newName !== user.name) {
                    debouncedUpdateName(newName);
                  }
                }}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Reporting Office
                </span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"
                value={formData.reportingOffice}
                onChange={(e) => setFormData({ ...formData, reportingOffice: e.target.value })}
                placeholder="Enter reporting office"
              />
              {validationErrors.reportingOffice && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.reportingOffice}
                </p>
              )}
              {/* Mayor input */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 mt-4">
                <span className="flex items-center gap-2">
                  {/* Government/office icon for Mayor */}
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2M16 7a4 4 0 01-8 0m8 0V5a4 4 0 00-8 0v2m8 0a4 4 0 01-8 0" />
                  </svg>
                  Municipal Mayor
                </span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"
                value={formData.mayor}
                onChange={e => {
                  const newMayor = e.target.value;
                  setFormData({ ...formData, mayor: newMayor });
                  if (user && newMayor !== user.municipal_mayor) {
                    debouncedUpdateMayor(newMayor);
                  }
                }}
                placeholder="Enter municipal mayor"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert with Enhanced Styling */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 rounded-lg p-4 mb-6 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Unable to Submit Report</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-100">
                    {submitError}
                    {submitError.includes('session') && (
                      <button
                        onClick={() => router.push('/login')}
                        className="ml-2 text-red-800 dark:text-red-200 underline hover:text-red-900 dark:hover:text-red-300"
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
          <div className="bg-white dark:bg-[#181c2a] rounded-xl shadow-md border border-gray-200 dark:border-blue-900">
            {/* Section Header with Gradient */}
            <div className="p-6 border-b border-gray-200 dark:border-blue-900 bg-gradient-to-r from-gray-50 to-white dark:from-[#101624] dark:to-[#181c2a]">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-blue-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                I. EMPLOYMENT FACILITATION
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 ml-7">A. PUBLIC EMPLOYMENT SERVICE OFFICE</p>
            </div>

            {/* Quick Add Section with Enhanced Styling */}
            <div className="p-6 border-b border-gray-200 dark:border-blue-900 bg-gradient-to-r from-gray-50 to-white dark:from-[#101624] dark:to-[#181c2a]">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-blue-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Navigate to Indicators
                  </h3>
                </div>

                {/* Program Navigation Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {programOptions.map((program, idx) => (
                    <React.Fragment key={program.value}>
                      <button
                        type="button"
                        onClick={() => {
                          const element = document.getElementById(`program-${program.value}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="flex items-center px-4 py-2.5 bg-white dark:bg-[#232b3e] border border-gray-300 dark:border-blue-900 rounded-lg text-sm font-medium text-gray-700 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 mr-2 font-semibold">
                          {program.label.split('.')[0]}
                        </span>
                        <span className="truncate">{program.label.split('.')[1]}</span>
                      </button>
                      {/* After 11th (Livelihood and Self-Employed), insert modal buttons */}
                      {idx === 10 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowAvailableJobs(true)}
                            className="flex items-center px-4 py-2.5 bg-white dark:bg-[#232b3e] border border-gray-300 dark:border-blue-900 rounded-lg text-sm font-medium text-gray-700 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 mr-2 font-semibold">12</span>
                            <span className="truncate">Available Jobs</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowGenderDistribution(true)}
                            className="flex items-center px-4 py-2.5 bg-white dark:bg-[#232b3e] border border-gray-300 dark:border-blue-900 rounded-lg text-sm font-medium text-gray-700 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 mr-2 font-semibold">13</span>
                            <span className="truncate">Gender Distribution</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowEmploymentSectors(true)}
                            className="flex items-center px-4 py-2.5 bg-white dark:bg-[#232b3e] border border-gray-300 dark:border-blue-900 rounded-lg text-sm font-medium text-gray-700 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 mr-2 font-semibold">14</span>
                            <span className="truncate">Employment Sectors</span>
                          </button>
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {/* Quick Add Data Summary */}
                {quickAddData && (
                  <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-200 mb-2">Quick Add Summary</h4>
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

            {/* Table Section with Enhanced Styling */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-blue-100">
                    <th className="px-6 py-3 text-left font-bold border-b border-blue-200 dark:border-blue-900 align-middle" style={{ minWidth: 260 }}>
                      INDICATOR <span className="block text-xs font-normal text-gray-600 dark:text-gray-300">(OUTPUT SPECIFICATION)</span>
                    </th>
                    <th className="px-3 py-3 text-center font-bold border-b border-blue-200 dark:border-blue-900 align-middle">PREVIOUS REPORTING PERIOD</th>
                    <th className="px-3 py-3 text-center font-bold border-b border-blue-200 dark:border-blue-900 align-middle">CURRENT REPORTING PERIOD</th>
                    <th className="px-3 py-3 border-b border-blue-200 dark:border-blue-900 align-middle"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-blue-900">
                  {programOptions.map((program) => {
                    const indicators = indicatorOptions[program.value] || [];
                    return (
                      <React.Fragment key={program.value}>
                        {/* Program Row */}
                        <tr id={`program-${program.value}`} className="bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-900/40 dark:to-blue-900/10 font-medium group align-middle">
                          <td className="px-6 py-4 text-gray-900 dark:text-blue-100 align-middle">
                            <div className="flex items-center space-x-2">
                              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold text-sm">
                                {program.label.split('.')[0]}
                              </span>
                              <span>{program.label.split('.')[1]}</span>
                            </div>
                          </td>
                          <td colSpan={2}></td>
                          <td className="px-6 py-4 align-middle">
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
                              className="invisible group-hover:visible p-2 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        {/* Indicators */}
                        {indicators.map((indicator, indIdx) => {
                          let subIndicators = subIndicatorOptions[indicator.value] || [];
                          if (program.value === 'APPLICANTS_REGISTERED') {
                            const correctKey = getApplicantsRegisteredSubIndicatorKey(indicator.value);
                            subIndicators = subIndicatorOptions[correctKey] || [];
                          }
                          const indicatorLabel = indicatorOptions[program.value]?.find(opt => opt.value === indicator.value)?.label || indicator.label;
                          const indicatorRow = formData.employmentFacilitation.find(
                            row => row.program === program.value && row.indicator === indicator.value && !row.sub_indicator
                          );
                          const isSpecialCategory = ['RETRENCHED', 'OFWS', 'MIGRATORY', 'RURAL'].includes(indicator.value);
                          const rowBg = indIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                          return (
                            <React.Fragment key={indicator.value}>
                              {/* Main indicator row (total) */}
                              <tr className={`hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors align-middle ${rowBg} ${rowBg === 'bg-white' ? 'dark:bg-[#232b3e]' : 'dark:bg-[#181c2a]'}`}>
                                <td className="px-6 py-3 pl-16 text-gray-900 dark:text-blue-100 align-middle">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span>{indicatorLabel}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                  {(() => {
                                    const prevRow = previousPeriodEntries.find(row =>
                                      row.program === program.value &&
                                      row.indicator === indicator.value &&
                                      (!row.sub_indicator || row.sub_indicator === '') &&
                                      (!row.sub_sub_indicator || row.sub_sub_indicator === '')
                                    );
                                    const currentRow = formData.employmentFacilitation.find(row =>
                                      row.program === program.value &&
                                      row.indicator === indicator.value &&
                                      (!row.sub_indicator || row.sub_indicator === '') &&
                                      (!row.sub_sub_indicator || row.sub_sub_indicator === '')
                                    );
                                    const prevValue = prevRow ? prevRow.current_period : 0;
                                    const currValue = currentRow ? currentRow.current_period : 0;
                                    return prevValue + currValue;
                                  })()}
                                </td>
                                <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-blue-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"
                                    value={indicatorRow?.current_period === undefined ? '' : indicatorRow?.current_period}
                                    onChange={e => {
                                      setFormData(prev => {
                                        let val = e.target.value.replace(/^0+(?!$)/, '');
                                        const enteredValue = val === '' ? 0 : parseInt(val) || 0;
                                        const prevRow = previousPeriodEntries.find(row =>
                                          row.program === program.value &&
                                          row.indicator === indicator.value &&
                                          (!row.sub_indicator || row.sub_indicator === '') &&
                                          (!row.sub_sub_indicator || row.sub_sub_indicator === '')
                                        );
                                        const prevValue = prevRow ? prevRow.current_period : 0;
                                        const newValue = enteredValue + prevValue;
                                        const newData = { ...prev };
                                        const existingIndex = newData.employmentFacilitation.findIndex(
                                          row => row.program === program.value && row.indicator === indicator.value && !row.sub_indicator
                                        );
                                        if (existingIndex === -1) {
                                          const newRow: EmploymentFacilitationRow = {
                                            program: program.value as ProgramType,
                                            indicator: indicator.value,
                                            sub_indicator: '',
                                            sub_sub_indicator: '',
                                            previous_report_period: 0,
                                            current_period: newValue,
                                            previous_female_count: 0,
                                            current_female_count: 0,
                                            remarks: ''
                                          };
                                          newData.employmentFacilitation.push(newRow);
                                        } else {
                                          newData.employmentFacilitation[existingIndex] = {
                                            ...newData.employmentFacilitation[existingIndex],
                                            current_period: newValue
                                          };
                                        }
                                        return newData;
                                      });
                                    }}
                                  />
                                </td>
                                <td className="align-middle bg-white dark:bg-[#232b3e]"></td>
                              </tr>
                              {/* Total row for 2.5–2.8 */}
                              {isSpecialCategory && (
                                <tr className={`hover:bg-gray-50/50 dark:hover:bg-blue-900/20 transition-colors align-middle ${rowBg} ${rowBg === 'bg-white' ? 'dark:bg-[#232b3e]' : 'dark:bg-[#181c2a]'}`}>
                                  <td className="px-6 py-3 pl-24 text-gray-800 dark:text-blue-100 align-middle">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                      <span>Total</span>
                                    </div>
                                  </td>
                                  {/* Previous period input (total, read-only) */}
                                  <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                    {(() => {
                                      const row = previousPeriodEntries.find(row =>
                                        row.program === program.value &&
                                        row.indicator === indicator.value &&
                                        (row.sub_indicator || '') === '' &&
                                        (row.sub_sub_indicator || '') === ''
                                      );
                                      return row ? row.current_period : '';
                                    })()}
                                  </td>
                                  {/* Current period input (total) */}
                                  <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                    <input
                                      type="number"
                                      min="0"
                                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-blue-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"
                                      value={(() => {
                                        const row = formData.employmentFacilitation.find(row =>
                                          row.program === program.value &&
                                          row.indicator === indicator.value &&
                                          (row.sub_indicator || '') === '' &&
                                          (row.sub_sub_indicator || '') === ''
                                        );
                                        return row?.current_period === undefined ? '' : row.current_period;
                                      })()}
                                      onChange={e => {
                                        setFormData(prev => {
                                          let val = e.target.value.replace(/^0+(?!$)/, '');
                                          const enteredValue = val === '' ? 0 : parseInt(val) || 0;
                                          const prevRow = previousPeriodEntries.find(row =>
                                            row.program === program.value &&
                                            row.indicator === indicator.value &&
                                            (row.sub_indicator || '') === '' &&
                                            (row.sub_sub_indicator || '') === ''
                                          );
                                          const prevValue = prevRow ? prevRow.current_period : 0;
                                          const newValue = enteredValue + prevValue;
                                          const newData = { ...prev };
                                          const existingIndex = newData.employmentFacilitation.findIndex(
                                            row => row.program === program.value && row.indicator === indicator.value && !row.sub_indicator
                                          );
                                          if (existingIndex === -1) {
                                            const newRow: EmploymentFacilitationRow = {
                                              program: program.value as ProgramType,
                                              indicator: indicator.value,
                                              sub_indicator: '',
                                              sub_sub_indicator: '',
                                              previous_report_period: 0,
                                              current_period: newValue,
                                              previous_female_count: 0,
                                              current_female_count: 0,
                                              remarks: ''
                                            };
                                            newData.employmentFacilitation.push(newRow);
                                          } else {
                                            newData.employmentFacilitation[existingIndex] = {
                                              ...newData.employmentFacilitation[existingIndex],
                                              current_period: newValue
                                            };
                                          }
                                          return newData;
                                        });
                                      }}
                                    />
                                  </td>
                                  <td className="align-middle bg-white dark:bg-[#232b3e]"></td>
                                </tr>
                              )}
                              {/* Special Category Female Row */}
                              {isSpecialCategory && (
                                <tr className={`hover:bg-gray-50/50 dark:hover:bg-blue-900/20 transition-colors align-middle ${rowBg} ${rowBg === 'bg-white' ? 'dark:bg-[#232b3e]' : 'dark:bg-[#181c2a]'}`}>
                                  <td className="px-6 py-3 pl-24 text-gray-800 dark:text-blue-100 align-middle">
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
                                  {/* Previous period input (female, read-only) */}
                                  <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                    {(() => {
                                      const prevRow = previousPeriodEntries.find(row =>
                                        row.program === program.value &&
                                        row.indicator === indicator.value &&
                                        (row.sub_indicator || '') === '' &&
                                        (row.sub_sub_indicator || '') === 'FEMALE'
                                      );
                                      return prevRow ? prevRow.current_female_count : '';
                                    })()}
                                  </td>
                                  {/* Current period input (female) */}
                                  <td className="px-3 py-2 text-center align-middle bg-pink-50/30 dark:bg-pink-900/20">
                                    <input
                                      type="number"
                                      min="0"
                                      className="w-full px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-800 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30 dark:bg-pink-900/20 text-pink-700 dark:text-pink-200"
                                      value={(
                                        formData.employmentFacilitation.find(row =>
                                          row.program === program.value &&
                                          row.indicator === indicator.value &&
                                          (row.sub_indicator || '') === '' &&
                                          (row.sub_sub_indicator || '') === 'FEMALE')?.current_female_count || 0
                                      )}
                                      onChange={e => {
                                        setFormData(prev => {
                                          let val = e.target.value.replace(/^0+(?!$)/, '');
                                          const enteredValue = val === '' ? 0 : parseInt(val) || 0;
                                          const prevRow = previousPeriodEntries.find(row =>
                                            row.program === program.value &&
                                            row.indicator === indicator.value &&
                                            (row.sub_indicator || '') === '' &&
                                            (row.sub_sub_indicator || '') === 'FEMALE'
                                          );
                                          const prevValue = prevRow && typeof prevRow.current_female_count === 'number' ? prevRow.current_female_count : 0;
                                          const newValue = enteredValue + prevValue;
                                          const newData = { ...prev };
                                          const existingIndex = newData.employmentFacilitation.findIndex(
                                            row => row.program === program.value && row.indicator === indicator.value && !row.sub_indicator
                                          );
                                          if (existingIndex === -1) {
                                            const newRow: EmploymentFacilitationRow = {
                                              program: program.value as ProgramType,
                                              indicator: indicator.value,
                                              sub_indicator: '',
                                              sub_sub_indicator: '',
                                              previous_report_period: 0,
                                              current_period: newValue,
                                              previous_female_count: 0,
                                              current_female_count: newValue,
                                              remarks: ''
                                            };
                                            newData.employmentFacilitation.push(newRow);
                                          } else {
                                            newData.employmentFacilitation[existingIndex] = {
                                              ...newData.employmentFacilitation[existingIndex],
                                              current_female_count: newValue
                                            };
                                          }
                                          return newData;
                                        });
                                      }}
                                    />
                                  </td>
                                  <td className="align-middle bg-white dark:bg-[#232b3e]"></td>
                                </tr>
                              )}
                              {/* Sub-indicators */}
                              {!isSpecialCategory && subIndicators.map((subInd) => {
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
                                    <tr className={`hover:bg-gray-50/50 dark:hover:bg-blue-900/20 transition-colors align-middle ${rowBg} ${rowBg === 'bg-white' ? 'dark:bg-[#232b3e]' : 'dark:bg-[#181c2a]'}`}>
                                      <td className="px-6 py-3 pl-24 text-gray-800 dark:text-blue-100 align-middle">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                          <span>{subIndicatorLabel}</span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                        {(() => {
                                          const prevRow = previousPeriodEntries.find(row =>
                                            row.program === program.value &&
                                            row.indicator === indicator.value &&
                                            row.sub_indicator === subInd.value &&
                                            (!row.sub_sub_indicator || row.sub_sub_indicator === "")
                                          );
                                          const currentRow = formData.employmentFacilitation.find(row =>
                                            row.program === program.value &&
                                            row.indicator === indicator.value &&
                                            row.sub_indicator === subInd.value &&
                                            (!row.sub_sub_indicator || row.sub_sub_indicator === "")
                                          );
                                          const prevValue = prevRow ? prevRow.current_period : 0;
                                          const currValue = currentRow ? currentRow.current_period : 0;
                                          return prevValue + currValue;
                                        })()}
                                      </td>
                                      <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                        <input
                                          type="number"
                                          min="0"
                                          className={subInd.value.includes('FEMALE') && subSubIndicators.length === 0 ? "w-full px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-800 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30 dark:bg-pink-900/20 text-pink-700 dark:text-pink-200" : "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-blue-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"}
                                          value={subInd.value.includes('FEMALE') && subSubIndicators.length === 0
                                            ? (subIndicatorRow?.current_female_count === undefined ? '' : subIndicatorRow?.current_female_count)
                                            : (subIndicatorRow?.current_period === undefined ? '' : subIndicatorRow?.current_period)
                                          }
                                          onChange={e => {
                                            setFormData(prev => {
                                              let val = e.target.value.replace(/^0+(?!$)/, '');
                                              const enteredValue = val === '' ? 0 : parseInt(val) || 0;
                                              const prevRow = previousPeriodEntries.find(row =>
                                                row.program === program.value &&
                                                row.indicator === indicator.value &&
                                                row.sub_indicator === subInd.value &&
                                                (!row.sub_sub_indicator || row.sub_sub_indicator === "")
                                              );
                                              const currentRow = formData.employmentFacilitation.find(row =>
                                                row.program === program.value &&
                                                row.indicator === indicator.value &&
                                                row.sub_indicator === subInd.value &&
                                                (!row.sub_sub_indicator || row.sub_sub_indicator === "")
                                              );
                                              const prevValue = prevRow ? prevRow.current_period : 0;
                                              const currValue = currentRow ? currentRow.current_period : 0;
                                              const newData = { ...prev };
                                              const idx = newData.employmentFacilitation.findIndex(
                                                row => row.program === program.value &&
                                                  row.indicator === indicator.value &&
                                                  row.sub_indicator === subInd.value &&
                                                  (!row.sub_sub_indicator || row.sub_sub_indicator === "")
                                              );
                                              if (idx !== -1) {
                                                if (subInd.value.includes('FEMALE')) {
                                                  const newValue = enteredValue + prevValue + currValue;
                                                  newData.employmentFacilitation[idx] = {
                                                    ...newData.employmentFacilitation[idx],
                                                    current_female_count: newValue
                                                  };
                                                } else {
                                                  const newValue = enteredValue + prevValue + currValue;
                                                  newData.employmentFacilitation[idx] = {
                                                    ...newData.employmentFacilitation[idx],
                                                    current_period: newValue
                                                  };
                                                }
                                              }
                                              return newData;
                                            });
                                          }}
                                        />
                                      </td>
                                      <td className="align-middle bg-white dark:bg-[#232b3e]"></td>
                                    </tr>
                                    {/* Sub-sub-indicator rows (e.g., Female) */}
                                    {subSubIndicators.map((subSubInd: IndicatorOption) => {
                                      const isFemale = subSubInd.value.includes("FEMALE");
                                      const subSubIndicatorRow = formData.employmentFacilitation.find(
                                        row => row.program === program.value &&
                                          row.indicator === indicator.value &&
                                          row.sub_indicator === subInd.value &&
                                          row.sub_sub_indicator === subSubInd.value
                                      );
                                      return (
                                        <tr key={subSubInd.value} className={`hover:bg-gray-50/50 dark:hover:bg-blue-900/20 transition-colors align-middle ${rowBg} ${rowBg === 'bg-white' ? 'dark:bg-[#232b3e]' : 'dark:bg-[#181c2a]'}`}>
                                          <td className="px-6 py-3 pl-32 text-gray-700 dark:text-blue-100 align-middle">
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
                                          <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                            {(() => {
                                              const prevRow = previousPeriodEntries.find(row =>
                                                row.program === program.value &&
                                                row.indicator === indicator.value &&
                                                row.sub_indicator === subInd.value &&
                                                row.sub_sub_indicator === subSubInd.value
                                              );
                                              return isFemale ? (prevRow ? prevRow.previous_female_count : '') : (prevRow ? prevRow.previous_report_period : '');
                                            })()}
                                          </td>
                                          <td className="px-3 py-2 text-center align-middle bg-white dark:bg-[#232b3e]">
                                            <input
                                              type="number"
                                              min="0"
                                              className={isFemale ? "w-full px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-800 text-center focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-pink-50/30 dark:bg-pink-900/20 text-pink-700 dark:text-pink-200" : "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-blue-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-[#232b3e] text-gray-900 dark:text-blue-100"}
                                              value={isFemale
                                                ? (subSubIndicatorRow?.current_female_count === undefined ? '' : subSubIndicatorRow?.current_female_count)
                                                : (subSubIndicatorRow?.current_period === undefined ? '' : subSubIndicatorRow?.current_period)
                                              }
                                              onChange={e => {
                                                setFormData(prev => {
                                                  let val = e.target.value.replace(/^0+(?!$)/, '');
                                                  const enteredValue = val === '' ? 0 : parseInt(val) || 0;
                                                  const prevRow = previousPeriodEntries.find(row =>
                                                    row.program === program.value &&
                                                    row.indicator === indicator.value &&
                                                    row.sub_indicator === subInd.value &&
                                                    row.sub_sub_indicator === subSubInd.value
                                                  );
                                                  const newData = { ...prev };
                                                  if (isFemale) {
                                                    const prevValue = prevRow && typeof prevRow.previous_female_count === 'number' ? prevRow.previous_female_count : 0;
                                                    const newValue = enteredValue + prevValue;
                                                    const idx = newData.employmentFacilitation.findIndex(
                                                      row => row.program === program.value &&
                                                        row.indicator === indicator.value &&
                                                        row.sub_indicator === subInd.value &&
                                                        row.sub_sub_indicator === subSubInd.value
                                                    );
                                                    if (idx !== -1) {
                                                      newData.employmentFacilitation[idx] = {
                                                        ...newData.employmentFacilitation[idx],
                                                        current_female_count: newValue
                                                      };
                                                    }
                                                  } else {
                                                    const prevValue = prevRow && typeof prevRow.previous_report_period === 'number' ? prevRow.previous_report_period : 0;
                                                    const newValue = enteredValue + prevValue;
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
                                                  }
                                                  return newData;
                                                });
                                              }}
                                            />
                                          </td>
                                          <td className="align-middle bg-white dark:bg-[#232b3e]"></td>
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
          <div className="flex justify-end gap-4 sticky bottom-0 bg-white dark:bg-[#181c2a] p-4 border-t border-gray-200 dark:border-blue-900 rounded-lg shadow-lg z-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 dark:border-blue-900 text-gray-700 dark:text-blue-100 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="fixed bottom-4 right-4 bg-white dark:bg-[#181c2a] rounded-xl shadow-lg border border-amber-200 dark:border-amber-900 p-4 max-w-md z-50 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-400 dark:text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-blue-100 font-medium">Before you submit</h4>
                  <ul className="mt-2 space-y-2">
                    {Object.entries(validationErrors).map(([key, error]) => (
                      <li key={key} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                        <span className="leading-5">{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowValidationErrors(false)}
                className="flex-shrink-0 ml-4 p-1 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-900 rounded-full"
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
          <div className="fixed bottom-4 right-4 bg-white dark:bg-[#181c2a] rounded-xl shadow-lg border border-green-200 dark:border-green-900 p-4 max-w-md z-50 animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-blue-100 font-medium">Report Submitted Successfully!</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Your report has been saved. You can now create another report or view your entries.</p>
                <div className="mt-3 flex space-x-4">
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setFormData(initialFormState);
                    }}
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-500 dark:hover:text-blue-100 transition-colors"
                  >
                    Create Another Report
                  </button>
                  <button
                    onClick={() => router.push('/report-entry')}
                    className="text-sm font-medium text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-100 transition-colors"
                  >
                    View Report Entries →
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="flex-shrink-0 ml-4 p-1 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-900 rounded-full"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Modals for 12, 13, 14 */}
        <AvailableJobsModal
          open={showAvailableJobs}
          onClose={() => setShowAvailableJobs(false)}
          onSave={setAvailableJobs}
          initialJobs={availableJobs}
        />
        <GenderDistributionModal
          open={showGenderDistribution}
          onClose={() => setShowGenderDistribution(false)}
          onSave={setGenderDistribution}
          initialData={genderDistribution}
        />
        <EmploymentSectorsModal
          open={showEmploymentSectors}
          onClose={() => setShowEmploymentSectors(false)}
          onSave={setEmploymentSectors}
          initialData={employmentSectors}
        />

        {/* Animations */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          table tr td, table tr th {
            vertical-align: middle !important;
          }
        `}</style>
      </div>
    </div>
  );
}