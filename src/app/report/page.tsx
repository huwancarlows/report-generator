"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type EmploymentFacilitationRow = {
  program: string;
  indicator: string;
  previousReportPeriod: number;
  currentPeriod: number;
};

interface ReportData {
  employmentFacilitation: EmploymentFacilitationRow[];
}

type FieldType<T, K extends keyof T> = T[K];

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ReportData>({
    employmentFacilitation: [
      { program: "", indicator: "", previousReportPeriod: 0, currentPeriod: 0 }
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit data to backend
    console.log(formData);
  };

  const addNewRow = () => {
    setFormData(prev => ({
      ...prev,
      employmentFacilitation: [
        ...prev.employmentFacilitation,
        { program: "", indicator: "", previousReportPeriod: 0, currentPeriod: 0 }
      ]
    }));
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
    { value: "JOB_SOLICITATION", label: "1. Job vacancies solicited/reported" },
    { value: "OVERSEAS", label: "1.1 Overseas employment" },
    { value: "LOCAL", label: "1.2 Local employment" },
    { value: "SPES", label: "1.3 SPES" },
    { value: "GIP", label: "1.4 GIP" },
    { value: "TULAY", label: "1.5 TULAY" }
  ];

  // Indicator options based on the DOLE form
  const indicatorOptions = [
    { value: "REGULAR", label: "1.1 Regular Program" },
    { value: "PUBLIC", label: "1.2 Public Sector" },
    { value: "SPECIAL", label: "1.3 Special Program" },
    { value: "REFERRAL", label: "2. Applicants Referred" },
    { value: "PLACEMENT", label: "3. Applicants Placed" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">DOLE Employment Report Form</h1>
        <div className="text-gray-600 space-y-1">
          <p>Revised SPRPS Form 2003-1</p>
          <p>Department of Labor and Employment</p>
          <p>Monthly Report on Implementation of Employment Programs</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold">I. Employment Facilitation</h2>
            <p className="text-sm text-gray-600 mt-1">A. Public Employment Service</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left">Program</th>
                  <th className="px-4 py-2 text-left">Indicator</th>
                  <th className="px-4 py-2 text-center w-32">Previous Report Period</th>
                  <th className="px-4 py-2 text-center w-32">Current Period</th>
                </tr>
              </thead>
              <tbody>
                {formData.employmentFacilitation.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">
                      <select
                        className="w-full p-2 border rounded dark:bg-gray-700"
                        value={row.program}
                        onChange={(e) => updateRow(index, "program", e.target.value)}
                      >
                        <option value="">Select Program</option>
                        {programOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="w-full p-2 border rounded dark:bg-gray-700"
                        value={row.indicator}
                        onChange={(e) => updateRow(index, "indicator", e.target.value)}
                      >
                        <option value="">Select Indicator</option>
                        {indicatorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded text-center dark:bg-gray-700"
                        value={row.previousReportPeriod}
                        onChange={(e) => updateRow(index, "previousReportPeriod", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded text-center dark:bg-gray-700"
                        value={row.currentPeriod}
                        onChange={(e) => updateRow(index, "currentPeriod", parseInt(e.target.value) || 0)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={addNewRow}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            >
              Add Row
            </button>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold">Remarks</h2>
          </div>
          <textarea
            className="w-full p-2 border rounded min-h-[100px] dark:bg-gray-700"
            placeholder="Enter any additional remarks or notes..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
