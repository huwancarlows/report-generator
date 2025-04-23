"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { reportService } from '@/services/reportService';
import { toast } from 'react-hot-toast';
import { ProgramType } from "@/types/database.types";

type EmploymentFacilitationRow = {
  program: string;
  indicator: string;
  subIndicator?: string;
  subSubIndicator?: string;
  previousReportPeriod: number;
  currentPeriod: number;
  remarks?: string;
};

interface ReportData {
  employmentFacilitation: EmploymentFacilitationRow[];
  reportingPeriod: string;
  reportingOffice: string;
}

type FieldType<T, K extends keyof T> = T[K];

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReportData>({
    employmentFacilitation: [
      {
        program: "JOB_VACANCIES",
        indicator: "REGULAR_PROGRAM",
        subIndicator: "LOCAL_EMPLOYMENT",
        subSubIndicator: "FEMALE",
        previousReportPeriod: 0,
        currentPeriod: 0,
        remarks: ""
      }
    ],
    reportingPeriod: "",
    reportingOffice: ""
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.reportingPeriod) {
      newErrors.reportingPeriod = "Reporting period is required";
    }
    
    if (!formData.reportingOffice) {
      newErrors.reportingOffice = "Reporting office is required";
    }

    formData.employmentFacilitation.forEach((row, index) => {
      if (!row.program) {
        newErrors[`row${index}_program`] = "Program is required";
      }
      if (!row.indicator) {
        newErrors[`row${index}_indicator`] = "Indicator is required";
      }
      if (row.previousReportPeriod < 0) {
        newErrors[`row${index}_previous`] = "Value cannot be negative";
      }
      if (row.currentPeriod < 0) {
        newErrors[`row${index}_current`] = "Value cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
  
    setLoading(true);
  
    // Validate the `program` field for each entry
    const isValid = formData.employmentFacilitation.every(entry =>
      isValidProgram(entry.program)  // Validate the program
    );
  
    if (!isValid) {
      toast.error('One or more programs are invalid.');
      setLoading(false);
      return;
    }
  
    try {
      const result = await reportService.createReport(
        formData.reportingPeriod,
        formData.reportingOffice,
        formData.employmentFacilitation.map(entry => ({
          program: entry.program as ProgramType,  // Cast program to ProgramType
          indicator: entry.indicator,
          sub_indicator: entry.subIndicator,
          sub_sub_indicator: entry.subSubIndicator,
          previous_report_period: entry.previousReportPeriod,
          current_period: entry.currentPeriod,
          remarks: entry.remarks
        }))
      );
  
      if (result) {
        toast.success('Report saved successfully');
        router.push('/reports'); // Redirect to reports list
      } else {
        toast.error('Failed to save report');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('An error occurred while saving the report');
    } finally {
      setLoading(false);
    }
  };
  
// Validation function for ProgramType
const isValidProgram = (program: string): program is ProgramType => {
  return [
    'JOB_VACANCIES',
    'APPLICANTS_REGISTERED',
    'PWD_PROJECTS',
    'PWD_TRAINING',
    'APPLICANTS_COUNSELLED',
    'APPLICANTS_TESTED',
    'CAREER_GUIDANCE',
    'JOB_FAIR',
    'LIVELIHOOD'
  ].includes(program);
};

  const updateRow = <K extends keyof EmploymentFacilitationRow>(
    index: number,
    field: K,
    value: FieldType<EmploymentFacilitationRow, K>
  ) => {
    const newData = { ...formData };
    newData.employmentFacilitation[index][field] = value;
    setFormData(newData);
  };

  // Program options based on the DOLE form
  const programOptions = [
    { value: "JOB_VACANCIES", label: "1. Job vacancies solicited/reported" },
    { value: "APPLICANTS_REGISTERED", label: "2. Applicants registered" },
    { value: "PWD_PROJECTS", label: "5. Number of projects implemented for PWDs" },
    { value: "PWD_TRAINING", label: "6. Training conducted for PWDs" },
    { value: "APPLICANTS_COUNSELLED", label: "7. Total applicants counselled" },
    { value: "APPLICANTS_TESTED", label: "8. Total applicants tested" },
    { value: "CAREER_GUIDANCE", label: "9. Career Guidance conducted" },
    { value: "JOB_FAIR", label: "10. Jobs fair" },
    { value: "LIVELIHOOD", label: "11. Livelihood and self-employment" }
  ];

  // Indicator options based on the DOLE form
  const indicatorOptions = {
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
    PWD_PROJECTS: [
      { value: "BENEFICIARIES", label: "5.1 Beneficiaries" }
    ],
    PWD_TRAINING: [
      { value: "BENEFICIARIES", label: "6.1 Beneficiaries" }
    ],
    APPLICANTS_COUNSELLED: [
      { value: "TOTAL", label: "7. Total applicants counselled" }
    ],
    APPLICANTS_TESTED: [
      { value: "TOTAL", label: "8. Total applicants tested" }
    ],
    CAREER_GUIDANCE: [
      { value: "STUDENTS", label: "9.1 Students given Career Guidance" },
      { value: "INSTITUTIONS", label: "9.2 Schools/Colleges/Universities" }
    ],
    JOB_FAIR: [
      { value: "CONDUCTED", label: "10.1 Jobs fair conducted/assisted" },
      { value: "TYPES", label: "10.2 Types" },
      { value: "VACANCIES", label: "10.3 Job vacancies solicited" },
      { value: "APPLICANTS", label: "10.4 Job applicants registered" },
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
  const subIndicatorOptions = {
    REGULAR_PROGRAM: [
      { value: "LOCAL_EMPLOYMENT", label: "1.1.1 Local employment" },
      { value: "OVERSEAS_EMPLOYMENT", label: "1.1.2 Overseas employment" }
    ],
    SPES: [
      { value: "PUBLIC_SECTOR", label: "1.2.1 Public Sector" },
      { value: "PRIVATE_SECTOR", label: "1.2.2 Private Sector" }
    ],
    WAP: [
      { value: "FEMALE", label: "1.3.1 Female" }
    ],
    TULAY: [
      { value: "WAGE_EMPLOYMENT", label: "1.4.1 Wage employment" },
      { value: "SELF_EMPLOYMENT", label: "1.4.2 Self-employment" }
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
    BENEFICIARIES: [
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
    JOB_VACANCIES: [
      { value: "LOCAL", label: "10.3.1 Local employment" },
      { value: "OVERSEAS", label: "10.3.2 Overseas employment" },
      { value: "BOTH", label: "10.3.3 Local and Overseas employment" },
      { value: "PWD", label: "10.3.4 PWDs and other disadvantaged groups" }
    ],
    JOB_APPLICANTS: [
      { value: "LOCAL", label: "10.4.1 Local employment" },
      { value: "OVERSEAS", label: "10.4.2 Overseas employment" },
      { value: "BOTH", label: "10.4.3 Local and Overseas employment" },
      { value: "PWD", label: "10.4.4 PWDs and other disadvantaged groups" }
    ],
    HIRED_ON_SPOT: [
      { value: "LOCAL", label: "10.5.1 Local employment" },
      { value: "OVERSEAS", label: "10.5.2 Overseas employment" },
      { value: "BOTH", label: "10.5.3 Local and Overseas employment" },
      { value: "PWD", label: "10.5.4 PWDs and other disadvantaged groups" }
    ],
    REPORTED_PLACED: [
      { value: "LOCAL", label: "10.6.1 Local employment" },
      { value: "OVERSEAS", label: "10.6.2 Overseas employment" },
      { value: "BOTH", label: "10.6.3 Local and Overseas employment" },
      { value: "PWD", label: "10.6.4 PWDs and other disadvantaged groups" }
    ],
    PRAS_ASSISTED: [
      { value: "REGISTERED", label: "10.7.1 Job applicants registed" },
      { value: "PLACED", label: "10.7.2 Job applicants placed" }
    ],
    LRA: [
      { value: "ASSISTED", label: "10.8.1 LRA assisted" },
      { value: "VACANCIES", label: "10.8.2 Job vacancies solicited" },
      { value: "APPLICANTS", label: "10.8.3 Job applicants registered" },
      { value: "HIRED_ON_SPOT", label: "10.8.4 Job applicants hired on the spot" },
      { value: "REPORTED_PLACED", label: "10.8.5 Job applicants reported placed" }
    ],
    LRA_ASSISTED: [
      { value: "LGU", label: "10.8.1.1 Local Government Units" },
      { value: "PRIVATE", label: "10.8.2.1 Private Institutions" },
      { value: "SCHOOLS", label: "10.8.3.1 Schools" }
    ],
    LRA_APPLICANTS: [
      { value: "FEMALE", label: "10.8.3.1 Female" }
    ],
    LRA_HIRED: [
      { value: "FEMALE", label: "10.8.4.1 Female" }
    ],
    LRA_PLACED: [
      { value: "FEMALE", label: "10.8.5.1 Female" }
    ]
  };

  const addNewRow = () => {
    setFormData(prev => ({
      ...prev,
      employmentFacilitation: [
        ...prev.employmentFacilitation,
        {
          program: "",
          indicator: "",
          subIndicator: "",
          subSubIndicator: "",
          previousReportPeriod: 0,
          currentPeriod: 0,
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

  return (
    <div className="p-6 max-w-[95%] mx-auto">
      {/* Form Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Department of Labor and Employment</h1>
          <p className="text-lg mt-2">Monthly Report on Implementation of Employment Programs</p>
          <p className="text-sm text-gray-600 mt-1">Revised SPRPS Form 2003-1</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reporting Period</label>
            <input
              type="month"
              className="w-full p-2 border rounded dark:bg-gray-700"
              value={formData.reportingPeriod}
              onChange={(e) => setFormData({...formData, reportingPeriod: e.target.value})}
            />
            {errors.reportingPeriod && (
              <p className="text-red-500 text-sm mt-1">{errors.reportingPeriod}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reporting Office</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700"
              value={formData.reportingOffice}
              onChange={(e) => setFormData({...formData, reportingOffice: e.target.value})}
            />
            {errors.reportingOffice && (
              <p className="text-red-500 text-sm mt-1">{errors.reportingOffice}</p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Section Header */}
          <div className="border-b p-4">
            <h2 className="text-xl font-semibold">I. EMPLOYMENT FACILITATION</h2>
            <p className="text-sm text-gray-600 mt-1">A. PUBLIC EMPLOYMENT SERVICE OFFICE</p>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-sm">
                  <th className="px-4 py-3 text-left border w-[8%] align-top">KRA</th>
                  <th className="px-4 py-3 text-left border w-[20%] align-top">PROGRAM</th>
                  <th className="px-4 py-3 text-left border w-[35%] align-top">
                    <div>INDICATOR</div>
                    <div className="text-xs text-gray-500">(OUTPUT SPECIFICATION)</div>
                  </th>
                  <th className="px-4 py-3 text-center border w-[12%] align-top">
                    <div>PREVIOUS</div>
                    <div>REPORTING</div>
                    <div>PERIOD</div>
                  </th>
                  <th className="px-4 py-3 text-center border w-[12%] align-top">
                    <div>CURRENT</div>
                    <div>REPORTING</div>
                    <div>PERIOD</div>
                  </th>
                  <th className="px-4 py-3 text-center border w-[10%] align-top">REMARKS</th>
                  <th className="px-4 py-3 w-[3%] align-top"></th>
                </tr>
              </thead>
              <tbody>
                {formData.employmentFacilitation.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 border align-top">I</td>
                    <td className="px-4 py-2 border">
                      <div className="relative">
                        <select
                          className={`w-full p-2 border rounded dark:bg-gray-700 text-sm appearance-none ${
                            errors[`row${index}_program`] ? 'border-red-500' : ''
                          }`}
                          value={row.program}
                          onChange={(e) => {
                            updateRow(index, "program", e.target.value);
                            updateRow(index, "indicator", "");
                            updateRow(index, "subIndicator", "");
                          }}
                        >
                          <option value="">Select Program</option>
                          {programOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                          </svg>
                        </div>
                      </div>
                      {errors[`row${index}_program`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`row${index}_program`]}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="space-y-2">
                        <div className="relative">
                          <select
                            className={`w-full p-2 border rounded dark:bg-gray-700 text-sm appearance-none ${
                              errors[`row${index}_indicator`] ? 'border-red-500' : ''
                            }`}
                            value={row.indicator}
                            onChange={(e) => {
                              updateRow(index, "indicator", e.target.value);
                              updateRow(index, "subIndicator", "");
                            }}
                          >
                            <option value="">Select Indicator</option>
                            {indicatorOptions[row.program as keyof typeof indicatorOptions]?.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                            </svg>
                          </div>
                        </div>
                        {row.indicator && (
                          <div className="relative">
                            <select
                              className="w-full p-2 border rounded dark:bg-gray-700 text-sm appearance-none"
                              value={row.subIndicator}
                              onChange={(e) => updateRow(index, "subIndicator", e.target.value)}
                            >
                              <option value="">Select Sub-Indicator</option>
                              {subIndicatorOptions[row.indicator as keyof typeof subIndicatorOptions]?.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="number"
                        min="0"
                        className={`w-full p-2 border rounded text-center dark:bg-gray-700 ${
                          errors[`row${index}_previous`] ? 'border-red-500' : ''
                        }`}
                        value={row.previousReportPeriod}
                        onChange={(e) => updateRow(index, "previousReportPeriod", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="number"
                        min="0"
                        className={`w-full p-2 border rounded text-center dark:bg-gray-700 ${
                          errors[`row${index}_current`] ? 'border-red-500' : ''
                        }`}
                        value={row.currentPeriod}
                        onChange={(e) => updateRow(index, "currentPeriod", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700"
                        value={row.remarks || ''}
                        onChange={(e) => updateRow(index, "remarks", e.target.value)}
                        placeholder="Optional"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="p-4 border-t">
            <button
              type="button"
              onClick={addNewRow}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <span className="mr-2">+</span> Add Row
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
