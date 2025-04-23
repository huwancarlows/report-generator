'use client'

import { useEffect, useState } from 'react'
import { reportService } from '@/services/reportService' // adjust the path if needed
import { CompleteReport } from '@/types/database.types'

export default function ReportEntryPage() {
  const [reportData, setReportData] = useState<CompleteReport[] | null>(null) // Changed to an array for multiple reports
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true) // Start loading
      const data = await reportService.getUserReports() // Adjust this service call to fetch all reports
      setReportData(data)
      setLoading(false) // End loading
    }

    fetchReports()
  }, [])

  if (loading) return <div className="p-4">Loading...</div>

  if (!reportData || reportData.length === 0) return <div className="p-4">Failed to load or no reports available.</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-center mb-4">Revised SPRPS Form 2003-1</h1>
      
      {reportData.map((report, idx) => (
        <div key={idx}>
          <div className="text-sm mb-2">
            <div className="flex justify-between">
              <span>Republic of the Philippines</span>
              <span>Page 1 of __</span>
            </div>
            <div className="flex justify-between">
              <span>{report.reporting_office}</span>
              <span>{report.reporting_period}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Report</span>
              <span>Reference Month / Year</span>
            </div>
            <div className="mb-4">Regional Office No. X</div>
          </div>

          <table className="w-full border border-collapse text-xs">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-1">Program</th>
                <th className="border p-1">Indicator</th>
                <th className="border p-1">Previous</th>
                <th className="border p-1">Current</th>
              </tr>
            </thead>
            <tbody>
              {report.entries && report.entries.length > 0 ? (
                report.entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="border p-1">{entry.program || ''}</td>
                    <td className="border p-1">{entry.indicator}</td>
                    <td className="border p-1 text-right">{entry.previous_report_period}</td>
                    <td className="border p-1 text-right">{entry.current_period}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border p-1 text-center">
                    No entries available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-8">
            <div>PREPARED BY: <strong>VANESSA MAE R. MORALES</strong></div>
            <div className="mb-2">PESO MANAGER - Designate</div>
            <div>APPROVED: <strong>HON. JENNIE ROSALIE UY - MENDEZ</strong></div>
            <div>MUNICIPAL MAYOR</div>
            <div className="mt-2 text-sm">Date: 14-Mar-25</div>
          </div>

          <div className="mt-6 text-xs italic">
            Note: Include in the SPRS a simple LMI Analysis Report...
          </div>
        </div>
      ))}
    </div>
  )
}
