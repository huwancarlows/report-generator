import { CompleteReport } from '@/types/database.types'
import { indicatorOptions } from '@/constants/indicatorOptions'
import { subIndicatorOptions } from '@/constants/indicatorOptions'
import React from 'react'

interface ApplicantsPlacedTableProps {
    reportData: CompleteReport[] | null
    selectedReportIndex: number
}

export default function ApplicantsPlacedTable({ reportData, selectedReportIndex }: ApplicantsPlacedTableProps) {
    if (!reportData || reportData.length === 0) return null

    const currentReport = reportData[selectedReportIndex]
    const entries = currentReport.entries.filter(entry => entry.program === 'APPLICANTS_PLACED')

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Applicants Placed Section Header */}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">
                            4. Applicants placed
                        </td>
                    </tr>

                    {/* Regular Program */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">4.1 Regular Program</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>4.1.1 Local Employment</div>
                                <div className="ml-4">4.1.1.1 Female</div>
                                <div>4.1.2 Overseas employment</div>
                                <div className="ml-4">4.1.2.1 Female</div>
                                <div>4.1.3 Self-employment</div>
                                <div className="ml-4">4.1.3.1 Female</div>
                                <div>4.1.4 Training</div>
                                <div className="ml-4">4.1.4.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_EMPLOYMENT_PLACED', 'OVERSEAS_EMPLOYMENT_PLACED', 'SELF_EMPLOYMENT_PLACED', 'TRAINING_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {(() => {
                                                const entry = entries.find(e =>
                                                    e.indicator === 'REGULAR_PROGRAM_PLACED' &&
                                                    e.sub_indicator === type &&
                                                    !e.sub_sub_indicator
                                                );
                                                return entry ? (entry.previous_report_period || 0) : 0;
                                            })()}
                                        </div>
                                        <div className="text-pink-600">
                                            {(() => {
                                                const entry = entries.find(e =>
                                                    e.indicator === 'REGULAR_PROGRAM_PLACED' &&
                                                    e.sub_indicator === type &&
                                                    e.sub_sub_indicator === 'FEMALE'
                                                );
                                                return entry ? (entry.previous_female_count || 0) : 0;
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['LOCAL_EMPLOYMENT_PLACED', 'OVERSEAS_EMPLOYMENT_PLACED', 'SELF_EMPLOYMENT_PLACED', 'TRAINING_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {(() => {
                                                const entry = entries.find(e =>
                                                    e.indicator === 'REGULAR_PROGRAM_PLACED' &&
                                                    e.sub_indicator === type &&
                                                    !e.sub_sub_indicator
                                                );
                                                return entry ? (entry.current_period || 0) : 0;
                                            })()}
                                        </div>
                                        <div className="text-pink-600">
                                            {(() => {
                                                const entry = entries.find(e =>
                                                    e.indicator === 'REGULAR_PROGRAM_PLACED' &&
                                                    e.sub_indicator === type &&
                                                    e.sub_sub_indicator === 'FEMALE'
                                                );
                                                return entry ? (entry.current_female_count || 0) : 0;
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* SPES */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">4.2 SPES</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>4.2.1 Public Sector</div>
                                <div className="ml-4">4.2.1.1 Female</div>
                                <div>4.2.2 Private Sector</div>
                                <div className="ml-4">4.2.2.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['PUBLIC_SECTOR_PLACED', 'PRIVATE_SECTOR_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {entries
                                                .filter(entry => entry.indicator === 'SPES_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.previous_report_period || 0)}
                                        </div>
                                        <div className="text-pink-600">
                                            {entries
                                                .filter(entry => entry.indicator === 'SPES_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.previous_female_count || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['PUBLIC_SECTOR_PLACED', 'PRIVATE_SECTOR_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {entries
                                                .filter(entry => entry.indicator === 'SPES_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.current_period || 0)}
                                        </div>
                                        <div className="text-pink-600">
                                            {entries
                                                .filter(entry => entry.indicator === 'SPES_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.current_female_count || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* WAP */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">4.3 WAP</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>4.3.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div className="text-pink-600">
                                    {entries
                                        .filter(entry => entry.indicator === 'WAP_PLACED' &&
                                            entry.sub_sub_indicator === 'FEMALE')
                                        .map(entry => entry.previous_female_count || 0)}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                <div className="text-pink-600">
                                    {entries
                                        .filter(entry => entry.indicator === 'WAP_PLACED' &&
                                            entry.sub_sub_indicator === 'FEMALE')
                                        .map(entry => entry.current_female_count || 0)}
                                </div>
                            </div>
                        </td>
                    </tr>

                    {/* TULAY */}
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">4.4 TULAY 2000</td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                            <div className="space-y-2">
                                <div>4.4.1 Wage employment</div>
                                <div className="ml-4">4.4.1.1 Female</div>
                                <div>4.4.2 Self-employment</div>
                                <div className="ml-4">4.4.2.1 Female</div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['WAGE_EMPLOYMENT_PLACED', 'SELF_EMPLOYMENT_TULAY_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {entries
                                                .filter(entry => entry.indicator === 'TULAY_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.previous_report_period || 0)}
                                        </div>
                                        <div className="text-pink-600">
                                            {entries
                                                .filter(entry => entry.indicator === 'TULAY_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.previous_female_count || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                            <div className="space-y-2">
                                {['WAGE_EMPLOYMENT_PLACED', 'SELF_EMPLOYMENT_TULAY_PLACED'].map((type) => (
                                    <div key={type}>
                                        <div>
                                            {entries
                                                .filter(entry => entry.indicator === 'TULAY_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    !entry.sub_sub_indicator)
                                                .map(entry => entry.current_period || 0)}
                                        </div>
                                        <div className="text-pink-600">
                                            {entries
                                                .filter(entry => entry.indicator === 'TULAY_PLACED' &&
                                                    entry.sub_indicator === type &&
                                                    entry.sub_sub_indicator === 'FEMALE')
                                                .map(entry => entry.current_female_count || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>

                    {/* Special Categories */}
                    {['RETRENCHED_PLACED', 'OFWS_PLACED', 'MIGRATORY_PLACED', 'RURAL_PLACED'].map((category, index) => (
                        <tr key={category}>
                            <td className="px-6 py-4 text-sm text-gray-900 w-[8%]"></td>
                            <td className="px-6 py-4 text-sm text-gray-900 w-[20%]">
                                {`4.${index + 5} ${category === 'RETRENCHED_PLACED' ? 'Retrenched/Displaced Workers' :
                                    category === 'OFWS_PLACED' ? 'Returning OFWs' :
                                        category === 'MIGRATORY_PLACED' ? 'Migratory Workers' :
                                            'Rural Workers'}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 w-[35%]">
                                <div className="space-y-2">
                                    <div>Total</div>
                                    <div className="ml-4">{`4.${index + 5}.1 Female`}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                                <div className="space-y-2">
                                    <div>
                                        {entries
                                            .filter(entry => entry.indicator === category &&
                                                !entry.sub_sub_indicator)
                                            .map(entry => entry.previous_report_period || 0)}
                                    </div>
                                    <div className="text-pink-600">
                                        {entries
                                            .filter(entry => entry.indicator === category &&
                                                entry.sub_sub_indicator === 'FEMALE')
                                            .map(entry => entry.previous_female_count || 0)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center w-[12%]">
                                <div className="space-y-2">
                                    <div>
                                        {entries
                                            .filter(entry => entry.indicator === category &&
                                                !entry.sub_sub_indicator)
                                            .map(entry => entry.current_period || 0)}
                                    </div>
                                    <div className="text-pink-600">
                                        {entries
                                            .filter(entry => entry.indicator === category &&
                                                entry.sub_sub_indicator === 'FEMALE')
                                            .map(entry => entry.current_female_count || 0)}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {/* Summary Row */}
                    <tr className="bg-gray-50">
                        <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">Total Applicants Placed</td>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {entries
                                    .filter(entry => !entry.sub_sub_indicator)
                                    .reduce((sum, entry) => sum + (entry.previous_report_period || 0), 0)}
                            </div>
                            <div className="text-pink-600">
                                {entries
                                    .filter(entry => entry.sub_sub_indicator === 'FEMALE')
                                    .reduce((sum, entry) => sum + (entry.previous_female_count || 0), 0)}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div>
                                {entries
                                    .filter(entry => !entry.sub_sub_indicator)
                                    .reduce((sum, entry) => sum + (entry.current_period || 0), 0)}
                            </div>
                            <div className="text-pink-600">
                                {entries
                                    .filter(entry => entry.sub_sub_indicator === 'FEMALE')
                                    .reduce((sum, entry) => sum + (entry.current_female_count || 0), 0)}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
} 