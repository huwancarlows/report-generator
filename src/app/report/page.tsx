"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { reportService } from '@/services/reportService';
import { toast } from 'react-hot-toast';
import { ProgramType } from "@/types/database.types";

type EmploymentFacilitationRow = {
  program: ProgramType;
  indicator: string;
  sub_indicator?: string;
  sub_sub_indicator?: string;
  previous_report_period: number;
  current_period: number;
  remarks?: string;
};

interface ReportData {
  employmentFacilitation: EmploymentFacilitationRow[];
  reportingPeriod: string;
  reportingOffice: string;
}

type FieldType<T, K extends keyof T> = T[K];

type IndicatorOption = {
  value: string;
  label: string;
};

type IndicatorOptionsMap = {
  [key: string]: IndicatorOption[];
};

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReportData>({
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
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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
      if (row.previous_report_period < 0) {
        newErrors[`row${index}_previous`] = "Value cannot be negative";
      }
      if (row.current_period < 0) {
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
          program: entry.program,
          indicator: entry.indicator,
          sub_indicator: entry.sub_indicator,
          sub_sub_indicator: entry.sub_sub_indicator,
          previous_report_period: entry.previous_report_period,
          current_period: entry.current_period,
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

  const updateRow = <K extends keyof EmploymentFacilitationRow>(
    index: number,
    field: K,
    value: FieldType<EmploymentFacilitationRow, K>
  ) => {
    const newData = { ...formData };
    newData.employmentFacilitation[index][field] = value;

    // Reset dependent fields when parent field changes
    if (field === "program") {
      newData.employmentFacilitation[index].indicator = "";
      newData.employmentFacilitation[index].sub_indicator = "";
      newData.employmentFacilitation[index].sub_sub_indicator = "";
    } else if (field === "indicator") {
      newData.employmentFacilitation[index].sub_indicator = "";
      newData.employmentFacilitation[index].sub_sub_indicator = "";
    } else if (field === "sub_indicator") {
      newData.employmentFacilitation[index].sub_sub_indicator = "";
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Form Header with Card Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Department of Labor and Employment</h1>
            <p className="text-lg mt-3 text-gray-600">Monthly Report on Implementation of Employment Programs</p>
            <p className="text-sm text-gray-500 mt-2">Revised SPRPS Form 2003-1</p>
          </div>

          {/* Report Period and Office Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Reporting Period</label>
              <input
                type="month"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.reportingPeriod}
                onChange={(e) => setFormData({ ...formData, reportingPeriod: e.target.value })}
              />
              {errors.reportingPeriod && (
                <p className="text-red-500 text-sm mt-1">{errors.reportingPeriod}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Reporting Office</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.reportingOffice}
                onChange={(e) => setFormData({ ...formData, reportingOffice: e.target.value })}
                placeholder="Enter reporting office"
              />
              {errors.reportingOffice && (
                <p className="text-red-500 text-sm mt-1">{errors.reportingOffice}</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">I. EMPLOYMENT FACILITATION</h2>
              <p className="text-sm text-gray-600 mt-1">A. PUBLIC EMPLOYMENT SERVICE OFFICE</p>
            </div>

            {/* Quick Add Section */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Quick Add Programs</h3>
                  <button
                    type="button"
                    onClick={() => addNewRow()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Custom Entry
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {programOptions.map((program) => (
                    <button
                      key={program.value}
                      type="button"
                      onClick={() => {
                        const newRow = {
                          program: program.value as ProgramType,
                          indicator: "",
                          sub_indicator: "",
                          sub_sub_indicator: "",
                          previous_report_period: 0,
                          current_period: 0,
                          remarks: ""
                        };
                        setFormData(prev => ({
                          ...prev,
                          employmentFacilitation: [...prev.employmentFacilitation, newRow]
                        }));
                      }}
                      className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 mr-2">
                        {program.label.split('.')[0]}
                      </span>
                      <span className="truncate">{program.label.split('.')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left border-b border-gray-200 font-semibold text-gray-900 w-[8%]">KRA</th>
                    <th className="px-6 py-4 text-left border-b border-gray-200 font-semibold text-gray-900 w-[20%]">INDICATOR</th>
                    <th className="px-6 py-4 text-left border-b border-gray-200 font-semibold text-gray-900 w-[35%]">
                      <div>OTHER SPECIFICATION</div>
                    </th>
                    <th className="px-6 py-4 text-center border-b border-gray-200 font-semibold text-gray-900 w-[12%]">
                      <div>PREVIOUS</div>
                      <div className="text-xs font-normal text-gray-500">REPORTING PERIOD</div>
                    </th>
                    <th className="px-6 py-4 text-center border-b border-gray-200 font-semibold text-gray-900 w-[12%]">
                      <div>CURRENT</div>
                      <div className="text-xs font-normal text-gray-500">REPORTING PERIOD</div>
                    </th>
                    <th className="px-6 py-4 w-[3%] border-b border-gray-200"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.employmentFacilitation.map((row, index) => (
                    <tr key={index} className="group hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">I</td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="relative">
                            <select
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                              value={row.program}
                              onChange={(e) => updateRow(index, "program", e.target.value as ProgramType)}
                            >
                              <option value="">Select Program</option>
                              {programOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {row.program && (
                            <div className="relative">
                              <select
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                                value={row.indicator}
                                onChange={(e) => updateRow(index, "indicator", e.target.value)}
                              >
                                <option value="">Select Indicator</option>
                                {indicatorOptions[row.program]?.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {row.indicator && (
                            <div className="relative">
                              <select
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                                value={row.sub_indicator}
                                onChange={(e) => updateRow(index, "sub_indicator", e.target.value)}
                              >
                                <option value="">Select Sub-Indicator</option>
                                {subIndicatorOptions[row.indicator]?.map((option: IndicatorOption) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          {row.sub_indicator && subIndicatorOptions[row.sub_indicator] && (
                            <div className="relative">
                              <select
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                                value={row.sub_sub_indicator}
                                onChange={(e) => updateRow(index, "sub_sub_indicator", e.target.value)}
                              >
                                <option value="">Select Sub-Sub-Indicator</option>
                                {subIndicatorOptions[row.sub_indicator]?.map((option: IndicatorOption) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={row.previous_report_period}
                          onChange={(e) => updateRow(index, "previous_report_period", parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={row.current_period}
                          onChange={(e) => updateRow(index, "current_period", parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="invisible group-hover:visible p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                          title="Remove row"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Report...
                </div>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
