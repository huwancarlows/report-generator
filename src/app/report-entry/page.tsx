'use client'

import { useEffect, useState } from 'react'
import { reportService } from '@/services/reportService'
import { CompleteReport } from '@/types/database.types'
import { useAuth } from '../context/AuthContext'
import { exportToPDF } from '@/utils/pdfExport'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabaseClient'

interface UserProfile {
  name: string;
  municipal_mayor: string;
  address: string;
}

export default function ReportEntryPage() {
  const [reportData, setReportData] = useState<CompleteReport[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [exportingSPRS, setExportingSPRS] = useState<boolean>(false)
  const [exportingSummary, setExportingSummary] = useState<boolean>(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(0)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and has user role only
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser || storedUser.role !== "user") {
      router.replace("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, municipal_mayor, address')
          .eq('email', user?.email)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchReports = async () => {
      setLoading(true)
      const data = await reportService.getUserReports()
      setReportData(data)
      setLoading(false)
    }

    fetchUserProfile();
    fetchReports()
  }, [router, user?.email])

  const handleExportSPRS = async (reportElement: HTMLElement, index: number) => {
    const filename = `SPRS-${reportData?.[index].reporting_period || 'report'}.pdf`
    await exportToPDF(
      reportElement,
      filename,
      () => setExportingSPRS(true),
      () => setExportingSPRS(false)
    )
  }

  const handleExportSummary = async (summaryElement: HTMLElement, index: number) => {
    const filename = `Summary-${reportData?.[index].reporting_period || 'report'}.pdf`

    // Create a container for the summary with header
    const container = document.createElement('div')
    container.style.padding = '20px'
    container.style.backgroundColor = 'white'

    // Add the header
    const header = document.createElement('div')
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Department of Labor and Employment</h1>
        <p style="font-size: 18px; margin-bottom: 4px;">Summary Report on Implementation of Employment Programs</p>
        <p style="font-size: 14px;">Reporting Period: ${reportData?.[index].reporting_period}</p>
      </div>
    `
    container.appendChild(header)

    // Clone the summary table
    const summaryClone = summaryElement.cloneNode(true)
    container.appendChild(summaryClone)

    // Add to document temporarily
    document.body.appendChild(container)

    // Export to PDF
    await exportToPDF(
      container,
      filename,
      () => setExportingSummary(true),
      () => setExportingSummary(false)
    )

    // Clean up
    document.body.removeChild(container)
  }

  // Add this new function to calculate summary
  const calculateSummary = (entries: CompleteReport['entries']) => {
    const summary = {
      vacancies: { male: 0, female: 0 },
      registered: { male: 0, female: 0 },
      referred: { male: 0, female: 0 },
      placed: { male: 0, female: 0 }
    };

    entries.forEach(entry => {
      if (entry.program === 'JOB_VACANCIES' && entry.sub_indicator === 'LOCAL_EMPLOYMENT') {
        if (entry.sub_sub_indicator === 'FEMALE') {
          summary.vacancies.female += entry.current_period;
        } else {
          summary.vacancies.male += entry.current_period;
        }
      }
      if (entry.program === 'APPLICANTS_REGISTERED') {
        if (entry.sub_sub_indicator === 'FEMALE') {
          summary.registered.female += entry.current_period;
        } else {
          summary.registered.male += entry.current_period;
        }
      }
      if (entry.program === 'APPLICANTS_REFERRED') {
        if (entry.sub_sub_indicator === 'FEMALE') {
          summary.referred.female += entry.current_period;
        } else {
          summary.referred.male += entry.current_period;
        }
      }
      if (entry.program === 'APPLICANTS_PLACED') {
        if (entry.sub_sub_indicator === 'FEMALE') {
          summary.placed.female += entry.current_period;
        } else {
          summary.placed.male += entry.current_period;
        }
      }
    });

    return summary;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reportData || reportData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gray-50 rounded-lg p-8 text-center max-w-md">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No reports available</h2>
          <p className="mt-2 text-gray-500">There are no reports to display at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Report Selection Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="mt-1 text-sm text-gray-500">View and export your submitted reports</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedReportIndex}
            onChange={(e) => setSelectedReportIndex(Number(e.target.value))}
            className="block w-full sm:w-80 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            {reportData.map((report, idx) => (
              <option key={idx} value={idx}>
                {report.reporting_period} - {report.reporting_office}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportSummary(
                document.querySelector(`#report-${selectedReportIndex} .mb-8`)!,
                selectedReportIndex
              )}
              disabled={exportingSummary}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{exportingSummary ? 'Exporting...' : 'Export Summary'}</span>
            </button>
            <button
              onClick={() => handleExportSPRS(document.getElementById(`report-${selectedReportIndex}`)!, selectedReportIndex)}
              disabled={exportingSPRS}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{exportingSPRS ? 'Exporting...' : 'Export SPRS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold">Department of Labor and Employment</h1>
            <p className="text-lg mt-2 text-blue-100">Monthly Report on Implementation of Employment Programs</p>
            <p className="text-sm text-blue-200 mt-1">Revised SPRPS Form 2003-1</p>
          </div>
        </div>

        <div id={`report-${selectedReportIndex}`} className="p-6">
          {/* Add Summary Report Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Report</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">LOCAL EMPLOYMENT</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">MALE</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">FEMALE</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData[selectedReportIndex].entries && (() => {
                    const summary = calculateSummary(reportData[selectedReportIndex].entries);
                    return (
                      <>
                        <tr className="bg-white">
                          <td className="px-6 py-3 text-sm text-gray-900">Vacancies Solicited</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.vacancies.male}</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.vacancies.female}</td>
                          <td className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                            {summary.vacancies.male + summary.vacancies.female}
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">Applicant's Registered</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.registered.male}</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.registered.female}</td>
                          <td className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                            {summary.registered.male + summary.registered.female}
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-6 py-3 text-sm text-gray-900">Applicant's Referred</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.referred.male}</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.referred.female}</td>
                          <td className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                            {summary.referred.male + summary.referred.female}
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">Applicant's Placed</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.placed.male}</td>
                          <td className="px-6 py-3 text-center text-sm text-gray-900">{summary.placed.female}</td>
                          <td className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                            {summary.placed.male + summary.placed.female}
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Existing report period and office section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Period</label>
              <div className="text-lg font-semibold text-gray-900">{reportData[selectedReportIndex].reporting_period}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Office</label>
              <div className="text-lg font-semibold text-gray-900">{reportData[selectedReportIndex].reporting_office}</div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[1200px] border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-center border-r border-gray-200 text-sm font-semibold text-gray-900 w-[5%]">No.</th>
                  <th className="px-6 py-4 text-left border-r border-gray-200 text-sm font-semibold text-gray-900 w-[8%]">KRA</th>
                  <th className="px-6 py-4 text-left border-r border-gray-200 text-sm font-semibold text-gray-900 w-[20%]">PROGRAM</th>
                  <th className="px-6 py-4 text-left border-r border-gray-200 text-sm font-semibold text-gray-900 w-[35%]">
                    <div>INDICATOR</div>
                    <div className="text-xs font-normal text-gray-500 mt-1">(OUTPUT SPECIFICATION)</div>
                  </th>
                  <th className="px-6 py-4 text-center border-r border-gray-200 text-sm font-semibold text-gray-900 w-[12%]">
                    <div>PREVIOUS</div>
                    <div className="font-normal text-gray-500">REPORTING PERIOD</div>
                  </th>
                  <th className="px-6 py-4 text-center border-r border-gray-200 text-sm font-semibold text-gray-900 w-[12%]">
                    <div>CURRENT</div>
                    <div className="font-normal text-gray-500">REPORTING PERIOD</div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-[8%]">REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData[selectedReportIndex].entries && reportData[selectedReportIndex].entries.length > 0 ? (
                  reportData[selectedReportIndex].entries.map((entry, entryIdx) => (
                    <tr key={entryIdx} className={entryIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 border-r border-gray-200 text-center font-medium text-gray-900">{entryIdx + 1}</td>
                      <td className="px-6 py-4 border-r border-gray-200 text-center text-gray-900">I</td>
                      <td className="px-6 py-4 border-r border-gray-200">
                        <div className="font-medium text-gray-900">{entry.program}</div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200">
                        <div className="space-y-1.5">
                          <div className="font-medium text-gray-900">{entry.indicator}</div>
                          {entry.sub_indicator && (
                            <div className="text-sm text-gray-600">{entry.sub_indicator}</div>
                          )}
                          {entry.sub_sub_indicator && (
                            <div className="text-sm text-gray-500">{entry.sub_sub_indicator}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 text-center">
                        <span className="font-medium text-gray-900">{entry.previous_report_period}</span>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 text-center">
                        <span className="font-medium text-gray-900">{entry.current_period}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600">{entry.remarks || '-'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No entries available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="font-semibold text-gray-900 mb-2">PREPARED BY:</div>
              <div className="text-gray-900 font-medium">{userProfile?.name || 'N/A'}</div>
              <div className="text-sm text-gray-600 mt-1">PESO Staff</div>
              <div className="text-sm text-gray-500 mt-1">{userProfile?.address || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="font-semibold text-gray-900 mb-2">APPROVED BY:</div>
              <div className="text-gray-900 font-medium">HON. {userProfile?.municipal_mayor || 'N/A'}</div>
              <div className="text-sm text-gray-600 mt-1">MUNICIPAL MAYOR</div>
              <div className="text-sm text-gray-500 mt-1">{userProfile?.address || 'N/A'}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600 border-t border-gray-200 pt-6">
            <div>
              Date: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="italic text-gray-500">
              Note: Include in the SPRS a simple LMI Analysis Report...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
