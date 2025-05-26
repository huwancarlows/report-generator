'use client'

import { useEffect, useState } from 'react'
import { reportService } from '@/services/reportService'
import { CompleteReport, ReportStatus } from '@/types/database.types'
import { useAuth } from '../context/AuthContext'
import { exportToPDF } from '@/utils/pdfExport'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabaseClient'
import * as XLSX from 'xlsx'
import { exportSPRSExcelFromReport } from '@/utils/sprsExcelExport'

interface UserProfile {
  name: string;
  municipal_mayor: string;
  address: string;
}

interface ReportWithUserInfo extends CompleteReport {
  user_profile: UserProfile;
  status: ReportStatus;
}

export default function AdminPage() {
  const [reportData, setReportData] = useState<ReportWithUserInfo[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [exportingReport, setExportingReport] = useState<boolean>(false)
  const [exportingSummary, setExportingSummary] = useState<boolean>(false)
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(0)
  const [filterOffice, setFilterOffice] = useState<string>('')
  const [filterPeriod, setFilterPeriod] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and has admin role
    if (!authLoading && (!user || user.role !== "admin")) {
      window.location.href = "/login";
      return;
    }

    if (user && user.role === "admin") {
      const fetchAllReports = async () => {
        setLoading(true)
        try {
          // Get all reports with their entries and user profiles
          const { data: reports, error: reportsError } = await supabase
            .from('employment_reports')
            .select(`
            *,
            employment_facilitation_entries(*),
            user_profile:profiles(name, municipal_mayor, address)
          `)
            .order('reporting_period', { ascending: false });

          if (reportsError) throw reportsError;

          if (reports) {
            // Transform the data to match the expected format
            const transformedReports = reports.map(report => ({
              ...report,
              entries: report.employment_facilitation_entries || [],
              user_profile: report.user_profile
            }));
            setReportData(transformedReports as ReportWithUserInfo[]);
          }
        } catch (error) {
          console.error('Error fetching reports:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchAllReports();
    }
  }, [user, authLoading, router])

  const handleExportPDF = async (reportElement: HTMLElement, index: number) => {
    const filename = `report-${reportData?.[index].reporting_period || 'report'}.pdf`
    await exportToPDF(
      reportElement,
      filename,
      () => setExportingReport(true),
      () => setExportingReport(false),
      false
    )
  }

  const handleExportSummary = async (summaryElement: HTMLElement, index: number) => {
    const filename = `summary-${reportData?.[index].reporting_period || 'summary'}.pdf`
    await exportToPDF(
      summaryElement,
      filename,
      () => setExportingSummary(true),
      () => setExportingSummary(false),
      true
    )
  }

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

  const getUniqueOffices = () => {
    if (!reportData) return [];
    return Array.from(new Set(reportData.map(report => report.reporting_office)));
  };

  const getUniquePeriods = () => {
    if (!reportData) return [];
    return Array.from(new Set(reportData.map(report => report.reporting_period)));
  };

  const handleStatusChange = async (reportId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('employment_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      setReportData(prevData =>
        prevData?.map(report =>
          report.id === reportId
            ? { ...report, status: newStatus }
            : report
        ) || null
      );
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reportData?.filter(report => {
    const matchesOffice = !filterOffice || report.reporting_office === filterOffice;
    const matchesPeriod = !filterPeriod || report.reporting_period === filterPeriod;
    const matchesStatus = !filterStatus || report.status === filterStatus;
    return matchesOffice && matchesPeriod && matchesStatus;
  });

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
      {/* Admin Header with Stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage and View all PESO Reports</h1>
        <p className="text-gray-600 mt-1 text-base">All submitted employment reports are listed below. You can export each report or summary as PDF.</p>
        <div className="mt-6">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-2xl shadow-lg flex items-center gap-4 w-full max-w-xs">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white drop-shadow">{reportData?.length || 0}</div>
              <div className="mt-1 inline-block px-3 py-1 bg-white/80 text-blue-700 rounded-full text-xs font-semibold shadow">Total Reports</div>
            </div>
          </div>
        </div>
        <hr className="my-8 border-blue-100" />
      </div>

      {/* Enhanced Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="office-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Office</label>
            <select
              id="office-filter"
              value={filterOffice}
              onChange={(e) => setFilterOffice(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            >
              <option value="">All Offices</option>
              {getUniqueOffices().map((office) => (
                <option key={office} value={office}>{office}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Period</label>
            <select
              id="period-filter"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            >
              <option value="">All Periods</option>
              {getUniquePeriods().map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Reports List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-12">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Reporting Office</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Reporting Period</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">PESO Staff</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Municipal Mayor</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports?.map((report, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{report.reporting_office}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reporting_period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.user_profile?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.user_profile?.municipal_mayor || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-2 items-center">
                      <button
                        onClick={() => handleExportPDF(document.getElementById(`report-${index}`)!, index)}
                        disabled={exportingReport}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                      >
                        {exportingReport ? 'Exporting...' : 'Export SPRS'}
                      </button>
                      <button
                        onClick={() => handleExportSummary(document.getElementById(`summary-${index}`)!, index)}
                        disabled={exportingSummary}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                      >
                        {exportingSummary ? 'Exporting...' : 'Export Summary'}
                      </button>
                      <button
                        onClick={() => exportSPRSExcelFromReport(report, `report-${report.reporting_period || 'report'}.xlsx`)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                      >
                        Export Excel
                      </button>
                      <span className="ml-2 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold shadow-sm">{report.entries?.length || 0} entries</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <hr className="my-12 border-gray-200" />

      {/* Hidden Report Elements for Export */}
      {reportData.map((report, index) => (
        <div key={index} className="hidden">
          {/* Summary Export Template */}
          <div id={`summary-${index}`} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#2563eb] text-white p-6">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold">Department of Labor and Employment</h1>
                <p className="text-lg mt-2">Employment Statistics Summary Report</p>
                <p className="text-sm mt-1">PESO {report.reporting_office}</p>
              </div>
            </div>

            <div className="p-6">
              {/* Report Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Period</label>
                  <div className="text-lg font-semibold text-gray-900">{report.reporting_period}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Office</label>
                  <div className="text-lg font-semibold text-gray-900">{report.reporting_office}</div>
                </div>
              </div>

              {/* Summary Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Male</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Female</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      const summary = calculateSummary(report.entries);
                      return (
                        <>
                          <tr>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Vacancies Solicited</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.vacancies.male}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.vacancies.female}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center bg-gray-50">
                              {summary.vacancies.male + summary.vacancies.female}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Applicants Registered</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.registered.male}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.registered.female}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center bg-gray-50">
                              {summary.registered.male + summary.registered.female}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Applicants Referred</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.referred.male}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.referred.female}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center bg-gray-50">
                              {summary.referred.male + summary.referred.female}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Applicants Placed</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.placed.male}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{summary.placed.female}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center bg-gray-50">
                              {summary.placed.male + summary.placed.female}
                            </td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Footer Section */}
              <div className="mt-8 grid grid-cols-2 gap-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-2">PREPARED BY:</div>
                  <div className="text-gray-900 font-medium">{report.user_profile?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-600 mt-1">PESO Staff</div>
                  <div className="text-sm text-gray-500 mt-1">{report.user_profile?.address || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-2">APPROVED BY:</div>
                  <div className="text-gray-900 font-medium">HON. {report.user_profile?.municipal_mayor || 'N/A'}</div>
                  <div className="text-sm text-gray-600 mt-1">MUNICIPAL MAYOR</div>
                  <div className="text-sm text-gray-500 mt-1">{report.user_profile?.address || 'N/A'}</div>
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
              </div>
            </div>
          </div>

          {/* Report Export Template */}
          <div id={`report-${index}`} className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e5e7eb]">
            <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white p-6">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold">Department of Labor and Employment</h1>
                <p className="text-lg mt-2 text-[#bfdbfe]">Monthly Report on Implementation of Employment Programs</p>
                <p className="text-sm text-[#93c5fd] mt-1">Revised SPRPS Form 2003-1</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Period</label>
                  <div className="text-lg font-semibold text-gray-900">{report.reporting_period}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Office</label>
                  <div className="text-lg font-semibold text-gray-900">{report.reporting_office}</div>
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
                    {report.entries && report.entries.length > 0 ? (
                      report.entries.map((entry, entryIdx) => (
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

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600 border-t border-gray-200 pt-6">
                <div>
                  Date: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
