'use client'

import { useEffect, useState } from 'react'
import { reportService } from '@/services/reportService'
import { CompleteReport } from '@/types/database.types'
import { useAuth } from '../context/AuthContext'
import { exportToPDF } from '@/utils/pdfExport'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabaseClient'
import JobVacanciesTable from '@/components/report/JobVacanciesTable'
import ApplicantsRegisteredTable from '@/components/report/ApplicantsRegisteredTable'
import ApplicantsReferredTable from '@/components/report/ApplicantsReferredTable'
import ApplicantsPlacedTable from '@/components/report/ApplicantsPlacedTable'
import AdditionalProgramsTable from '@/components/report/AdditionalProgramsTable'
import JobsFairTable from '@/components/report/JobsFairTable'
import { toast } from 'react-hot-toast'

interface UserProfile {
  name: string;
  municipal_mayor: string;
  address: string;
}

interface Summary {
  vacancies: {
    total: number;
    female: number;
    male: number;
  };
  registered: {
    total: number;
    female: number;
    male: number;
  };
  referred: {
    total: number;
    female: number;
    male: number;
  };
  placed: {
    total: number;
    female: number;
    male: number;
    government: number;
    private: number;
    overseas: number;
  };
  jobSeekers: {
    gender: {
      male: number;
      female: number;
    };
    age: {
      '15-24': number;
      '25-54': number;
      '55-above': number;
    };
    education: {
      elementary: number;
      secondary: number;
      college: number;
      graduate: number;
    };
  };
}

export default function ReportEntryPage() {
  const [reportData, setReportData] = useState<CompleteReport[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [exportingReport, setExportingReport] = useState<boolean>(false)
  const [exportingSummary, setExportingSummary] = useState<boolean>(false)
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(0)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Use user context for profile info
  const userProfile = user ? {
    name: user.name,
    municipal_mayor: user.municipal_mayor,
    address: user.address
  } : null;

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }
    const fetchReports = async () => {
      setLoading(true);
      try {
          const data = await reportService.getUserReports(user.id);
        if (data && data.length > 0) {
          // Sort reports by reporting period in descending order
          const sortedReports = data.sort((a, b) =>
            new Date(b.reporting_period).getTime() - new Date(a.reporting_period).getTime()
          );
          setReportData(sortedReports);
        } else {
          setReportData([]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to fetch reports');
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };
      fetchReports();
    }
  }, [router, user, authLoading]);

  const handleExportPDF = async (reportElement: HTMLElement, index: number) => {
    try {
      const filename = `report-${reportData?.[index].reporting_period || 'report'}.pdf`
      await exportToPDF(
        reportElement,
        filename,
        () => setExportingReport(true),
        () => setExportingReport(false),
        false
      )
    } catch (error) {
      console.error('Failed to export PDF:', error)
      // You could add a toast notification or alert here
      alert('Failed to export PDF. Please try again.')
    }
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
    const initialSummary: Summary = {
      vacancies: { total: 0, female: 0, male: 0 },
      registered: { total: 0, female: 0, male: 0 },
      referred: { total: 0, female: 0, male: 0 },
      placed: {
        total: 0,
        female: 0,
        male: 0,
        government: 0,
        private: 0,
        overseas: 0
      },
      jobSeekers: {
        gender: { male: 0, female: 0 },
        age: {
          '15-24': 0,
          '25-54': 0,
          '55-above': 0
        },
        education: {
          elementary: 0,
          secondary: 0,
          college: 0,
          graduate: 0
        }
      }
    };

    // Helper to get total, female, male for a given program
    function getGenderBreakdown(program: string) {
      const total = entries
        .filter(e => e.program === program && e.sub_sub_indicator !== 'FEMALE')
        .reduce((sum, e) => sum + (e.current_period || 0), 0);
      const female = entries
        .filter(e => e.program === program && e.sub_sub_indicator === 'FEMALE')
        .reduce((sum, e) => sum + (e.current_female_count || 0), 0);
      const male = total - female;
      return { total, female, male };
    }

    // Registered
    const reg = getGenderBreakdown('APPLICANTS_REGISTERED');
    initialSummary.registered = reg;

    // Vacancies
    const vac = getGenderBreakdown('JOB_VACANCIES');
    initialSummary.vacancies = vac;

    // Referred
    const ref = getGenderBreakdown('APPLICANTS_REFERRED');
    initialSummary.referred = ref;

    // Placed
    const placed = getGenderBreakdown('APPLICANTS_PLACED');
    initialSummary.placed.total = placed.total;
    initialSummary.placed.female = placed.female;
    initialSummary.placed.male = placed.male;
    // Placement by sector (unchanged)
    entries.forEach(entry => {
      if (entry.program === 'APPLICANTS_PLACED') {
        if (entry.sub_indicator === 'PUBLIC_SECTOR') {
          initialSummary.placed.government += entry.current_period || 0;
        } else if (entry.sub_indicator === 'PRIVATE_SECTOR') {
          initialSummary.placed.private += entry.current_period || 0;
        } else if (entry.sub_indicator === 'OVERSEAS') {
          initialSummary.placed.overseas += entry.current_period || 0;
        }
      }
    });

    // Job Seekers Profile: gender
    initialSummary.jobSeekers.gender.female = entries
      .filter(e => e.program === 'APPLICANTS_REGISTERED' && e.sub_sub_indicator === 'FEMALE')
      .reduce((sum, e) => sum + (e.current_female_count || 0), 0);
    initialSummary.jobSeekers.gender.male = reg.total - initialSummary.jobSeekers.gender.female;

    // Job Seekers Profile: age and education (unchanged)
    entries.forEach(entry => {
      if (entry.program === 'APPLICANTS_REGISTERED') {
        if (entry.sub_indicator === 'AGE_15_24') {
          initialSummary.jobSeekers.age['15-24'] += entry.current_period || 0;
        } else if (entry.sub_indicator === 'AGE_25_54') {
          initialSummary.jobSeekers.age['25-54'] += entry.current_period || 0;
        } else if (entry.sub_indicator === 'AGE_55_ABOVE') {
          initialSummary.jobSeekers.age['55-above'] += entry.current_period || 0;
        }
        if (entry.sub_indicator === 'ELEMENTARY') {
          initialSummary.jobSeekers.education.elementary += entry.current_period || 0;
        } else if (entry.sub_indicator === 'SECONDARY') {
          initialSummary.jobSeekers.education.secondary += entry.current_period || 0;
        } else if (entry.sub_indicator === 'COLLEGE') {
          initialSummary.jobSeekers.education.college += entry.current_period || 0;
        } else if (entry.sub_indicator === 'GRADUATE') {
          initialSummary.jobSeekers.education.graduate += entry.current_period || 0;
        }
      }
    });

    return initialSummary;
  };

  const formatIndicatorName = (name: string) => {
    if (!name) return '';
    // Split by underscore and convert to title case
    return name.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          <button
            onClick={() => handleExportPDF(document.getElementById(`report-${selectedReportIndex}`)!, selectedReportIndex)}
            disabled={exportingReport}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{exportingReport ? 'Exporting...' : 'Export SPRS'}</span>
          </button>
          <button
            onClick={() => handleExportSummary(document.getElementById(`summary-${selectedReportIndex}`)!, selectedReportIndex)}
            disabled={exportingSummary}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{exportingSummary ? 'Exporting...' : 'Export Summary'}</span>
          </button>
        </div>
      </div>

      {/* Main Report Content */}
      <div
        id={`report-${selectedReportIndex}`}
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-12"
        data-report={JSON.stringify({
          ...reportData[selectedReportIndex],
          profile: userProfile
        })}
      >
        <div className="bg-white p-8 border-b border-gray-200">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Department of Labor and Employment</h1>
            <p className="text-lg mt-3 text-gray-600">Monthly Report on Implementation of Employment Programs</p>
            <p className="text-sm text-gray-500 mt-2">Revised SPRPS Form 2003-1</p>
          </div>

          {/* Report Period and Office Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Reporting Period</label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50">
                {reportData[selectedReportIndex].reporting_period}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Reporting Office</label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50">
                {reportData[selectedReportIndex].reporting_office}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">I. EMPLOYMENT FACILITATION</h2>
              <p className="text-sm text-gray-600 mt-1">A. PUBLIC EMPLOYMENT SERVICE OFFICE</p>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <JobVacanciesTable
                reportData={reportData}
                selectedReportIndex={selectedReportIndex}
              />
            </div>

            <div className="mt-8">
              <ApplicantsRegisteredTable
                reportData={reportData}
                selectedReportIndex={selectedReportIndex}
              />
            </div>

            <div className="mt-8">
              <ApplicantsReferredTable
                reportData={reportData}
                selectedReportIndex={selectedReportIndex}
              />
            </div>

            <div className="mt-8">
              <ApplicantsPlacedTable
                reportData={reportData}
                selectedReportIndex={selectedReportIndex}
              />
            </div>

            <div className="mt-8">
              <AdditionalProgramsTable
                reportData={reportData}
                selectedReportIndex={selectedReportIndex}
              />
            </div>

            <div className="mt-8">
              <JobsFairTable
                reportData={reportData}
                selectedReportIndex={selectedReportIndex}
              />
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 prepared-by">
              <div className="font-semibold text-gray-900 mb-2">PREPARED BY:</div>
              <div className="text-gray-900 font-medium">{userProfile?.name || 'N/A'}</div>
              <div className="text-sm text-gray-600 mt-1">PESO MANAGER - Designate</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 approved-by">
              <div className="font-semibold text-gray-900 mb-2">APPROVED BY:</div>
              <div className="text-gray-900 font-medium">HON. {userProfile?.municipal_mayor || 'N/A'}</div>
              <div className="text-sm text-gray-600 mt-1">MUNICIPAL MAYOR</div>
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

      {/* Analytics Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Analytics</h2>

        {/* Employment Statistics Summary */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Statistics Summary</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Statistics */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Male
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Female
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Vacancies Solicited
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).vacancies.male}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).vacancies.female}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50">
                      {calculateSummary(reportData[selectedReportIndex].entries).vacancies.male + calculateSummary(reportData[selectedReportIndex].entries).vacancies.female}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Applicants Registered
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).registered.male}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).registered.female}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50">
                      {calculateSummary(reportData[selectedReportIndex].entries).registered.male + calculateSummary(reportData[selectedReportIndex].entries).registered.female}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Applicants Referred
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).referred.male}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).referred.female}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50">
                      {calculateSummary(reportData[selectedReportIndex].entries).referred.male + calculateSummary(reportData[selectedReportIndex].entries).referred.female}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Applicants Placed
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).placed.male}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).placed.female}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50">
                      {calculateSummary(reportData[selectedReportIndex].entries).placed.male + calculateSummary(reportData[selectedReportIndex].entries).placed.female}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Placement Categories */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placement Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Government Sector
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).placed.government}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Private Sector
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {calculateSummary(reportData[selectedReportIndex].entries).placed.private}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Job Seekers Profile */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Seekers Profile</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Age Group Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Age Group Distribution</h4>
              <div className="space-y-4">
                {Object.entries(calculateSummary(reportData[selectedReportIndex].entries).jobSeekers.age).map(([range, count]) => (
                  <div key={range} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{range}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational Attainment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Educational Attainment</h4>
              <div className="space-y-4">
                {Object.entries(calculateSummary(reportData[selectedReportIndex].entries).jobSeekers.education).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {level.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Labor Market Information */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Labor Market Information</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-base font-medium text-gray-900 mb-4">Top 10 Available Jobs</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacancies
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualified Applicants
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* This will need to be populated with actual data */}
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Summary for PDF Export */}
      <div
        id={`summary-${selectedReportIndex}`}
        className="hidden"
        data-report={JSON.stringify({
          ...reportData[selectedReportIndex],
          profile: userProfile
        })}
      >
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-blue-600 text-white p-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold">Department of Labor and Employment</h1>
              <p className="text-lg mt-2">Employment Statistics Summary Report</p>
              <p className="text-sm mt-1">PESO {reportData[selectedReportIndex].reporting_office}</p>
            </div>
          </div>

          <div className="p-6">
            {/* Report Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Period</label>
                <div className="text-lg font-semibold text-gray-900">{reportData[selectedReportIndex].reporting_period}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Office</label>
                <div className="text-lg font-semibold text-gray-900">{reportData[selectedReportIndex].reporting_office}</div>
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
                  {reportData[selectedReportIndex].entries && (() => {
                    const summary = calculateSummary(reportData[selectedReportIndex].entries);
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
                <div className="text-gray-900 font-medium">{userProfile?.name || 'N/A'}</div>
                <div className="text-sm text-gray-600 mt-1">PESO Staff</div>
                <div className="text-sm text-gray-500 mt-1">{userProfile?.address || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}